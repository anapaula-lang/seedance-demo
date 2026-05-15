import Anthropic from "@anthropic-ai/sdk";
import { fal } from "@fal-ai/client";
import { readFile } from "fs/promises";
import path from "path";

const MODEL = "claude-sonnet-4-6";
const PRICE_INPUT_PER_MTOK = 3;
const PRICE_OUTPUT_PER_MTOK = 15;
const FAL_PRICE_PER_IMAGE_USD = 0.08;

export type Asset = {
  id: string;
  type: "character" | "location" | "prop" | "wardrobe" | "moodboard";
  name: string;
  narrative_function: string;
  visual_description: string;
  fal_prompt: string;
  aspect_ratio: "16:9" | "1:1" | "9:16" | "auto";
  consistency_locked: string;
  variations_allowed: string;
};

export type AssetBible = {
  assets: Asset[];
  notes?: string;
};

export type GeneratedAsset = Asset & {
  image_url: string | null;
  error?: string;
};

export type AssetBibleResult =
  | { ok: true; bible: AssetBible; cost: number; durationMs: number }
  | { ok: false; error: string };

export type AssetImagesResult =
  | { ok: true; assets: GeneratedAsset[]; falCost: number; durationMs: number }
  | { ok: false; error: string };

async function loadSkillContext() {
  const skillRoot = path.join(
    process.cwd(),
    ".claude/skills/seedance-asset-director"
  );
  const [skillBody, styleRef] = await Promise.all([
    readFile(path.join(skillRoot, "SKILL.md"), "utf-8"),
    readFile(path.join(skillRoot, "references/asset-output-style.md"), "utf-8"),
  ]);
  return { skillBody, styleRef };
}

export async function generateAssetBible(
  scriptOutput: string
): Promise<AssetBibleResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "Falta ANTHROPIC_API_KEY en el servidor." };
  }

  let skillBody = "";
  let styleRef = "";
  try {
    const ctx = await loadSkillContext();
    skillBody = ctx.skillBody;
    styleRef = ctx.styleRef;
  } catch {
    return {
      ok: false,
      error: "No pude cargar la skill asset-director. Verificá .claude/skills.",
    };
  }

  const systemPrompt = `Sos el agente "seedance-asset-director" del pipeline Seedance. Seguí estrictamente este contrato:

${skillBody}

REGLAS DE PROMPT PARA IMÁGENES (asset-output-style.md):

${styleRef}

IMPORTANTE: vas a generar prompts que se ejecutarán con Nano Banana 2 (text-to-image). Los prompts tienen que ser autocontenidos, en inglés, fotográficamente específicos. Para character sheets, seguir el pattern exacto (closeup left aligned + 4 turnaround views + white bg + no text). Para locations, seguir el 2x2 grid pattern.

Modo: one-shot. Asumí lo que falte.

OUTPUT: solo JSON válido (sin markdown, sin texto antes ni después). Schema:

{
  "assets": [
    {
      "id": "CHAR-01",
      "type": "character" | "location" | "prop" | "wardrobe" | "moodboard",
      "name": "nombre corto",
      "narrative_function": "qué rol cumple en la historia",
      "visual_description": "descripción humana en español",
      "fal_prompt": "prompt EN INGLÉS para Nano Banana 2, autocontenido, siguiendo el pattern del style guide según type",
      "aspect_ratio": "16:9",
      "consistency_locked": "qué NO debe cambiar entre imágenes futuras",
      "variations_allowed": "qué SÍ puede variar"
    }
  ],
  "notes": "comentario corto opcional"
}

Limitá a máximo 6 assets totales para esta demo (1-2 characters + 1-2 locations + 1-2 props/moodboard según relevancia narrativa).`;

  const userPrompt = `Acá está el guion + handoff aprobado del script director:

${scriptOutput}

Generá la asset bible JSON.`;

  const start = Date.now();

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!raw) return { ok: false, error: "El modelo no devolvió texto." };

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { ok: false, error: "No encontré JSON en la respuesta del modelo." };
    }

    let bible: AssetBible;
    try {
      bible = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return {
        ok: false,
        error: `JSON inválido: ${e instanceof Error ? e.message : "parse error"}`,
      };
    }

    if (!bible.assets || !Array.isArray(bible.assets) || bible.assets.length === 0) {
      return { ok: false, error: "El JSON no tiene assets válidos." };
    }

    const cost =
      (response.usage.input_tokens * PRICE_INPUT_PER_MTOK) / 1_000_000 +
      (response.usage.output_tokens * PRICE_OUTPUT_PER_MTOK) / 1_000_000;

    return { ok: true, bible, cost, durationMs: Date.now() - start };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al generar la bible.",
    };
  }
}

export async function generateAssetImages(
  bible: AssetBible,
  falApiKey: string
): Promise<AssetImagesResult> {
  if (!falApiKey || falApiKey.length < 20) {
    return { ok: false, error: "FAL API key inválida o vacía." };
  }

  const start = Date.now();

  try {
    fal.config({ credentials: falApiKey });

    const results = await Promise.all(
      bible.assets.map(async (asset): Promise<GeneratedAsset> => {
        try {
          const result = await fal.subscribe("fal-ai/nano-banana-2", {
            input: {
              prompt: asset.fal_prompt,
              aspect_ratio: asset.aspect_ratio || "16:9",
              resolution: "1K",
              num_images: 1,
            },
          });

          const data = result.data as { images?: { url: string }[] };
          const imageUrl = data.images?.[0]?.url;

          if (!imageUrl) {
            return { ...asset, image_url: null, error: "FAL no devolvió imagen." };
          }

          return { ...asset, image_url: imageUrl };
        } catch (e) {
          return {
            ...asset,
            image_url: null,
            error: e instanceof Error ? e.message : "Error en FAL.",
          };
        }
      })
    );

    const successCount = results.filter((r) => r.image_url).length;
    const falCost = successCount * FAL_PRICE_PER_IMAGE_USD;

    return {
      ok: true,
      assets: results,
      falCost,
      durationMs: Date.now() - start,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error inicializando FAL.",
    };
  }
}
