"use server";

import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "fs/promises";
import path from "path";
import {
  generateAssetBible as _genBible,
  generateAssetImages as _genImages,
  type AssetBible,
  type AssetBibleResult,
  type AssetImagesResult,
} from "@/lib/asset-pipeline";

export type { AssetBible, AssetBibleResult, AssetImagesResult };

export type ScriptResult =
  | { ok: true; result: string; cost: number; durationMs: number }
  | { ok: false; error: string };

const MODEL = "claude-sonnet-4-6";
const PRICE_INPUT_PER_MTOK = 3;
const PRICE_OUTPUT_PER_MTOK = 15;

export async function generateScript(idea: string): Promise<ScriptResult> {
  if (!idea || idea.trim().length < 10) {
    return { ok: false, error: "Contame un poco más de la idea (mínimo 10 caracteres)." };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      error: "Falta ANTHROPIC_API_KEY en variables de entorno del servidor.",
    };
  }

  const skillPath = path.join(
    process.cwd(),
    ".claude/skills/seedance-script-director/SKILL.md"
  );

  let skillBody = "";
  try {
    skillBody = await readFile(skillPath, "utf-8");
  } catch {
    return {
      ok: false,
      error: "No pude cargar la skill. Verificá que .claude/skills esté en el deploy.",
    };
  }

  const systemPrompt = `Sos el agente "seedance-script-director" del pipeline Seedance. Seguí estrictamente el siguiente contrato de la skill:

${skillBody}

Modo de operación: one-shot. No preguntes, asumí lo que falte y declaralo en un bloque "Supuestos" al inicio si es crítico. Devolvé markdown limpio.`;

  const userPrompt = `Idea del usuario:

"""
${idea.trim()}
"""

Convertí esto en guion Seedance.

Si el usuario no especificó:
- Duración: asumí 15–30s.
- Plataforma: Instagram/TikTok vertical 9:16.
- Tono: inferí del texto.

Entregá las 6 secciones del contract en este orden:

1. **Premisa** (1 frase)
2. **Sinopsis** (1–2 párrafos)
3. **Beat sheet** (lista con duración estimada por beat)
4. **Guion puro** (acción + diálogo/VO + progresión)
5. **Notas de continuidad**
6. **Riesgos**

Al final agregá un bloque **Next handoff** con: personajes, locaciones, props, cambios de vestuario, tono visual inferido. No incluyas prompts de imagen ni shot list técnico.`;

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
    const result = textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!result) {
      return { ok: false, error: "El modelo no devolvió texto." };
    }

    const cost =
      (response.usage.input_tokens * PRICE_INPUT_PER_MTOK) / 1_000_000 +
      (response.usage.output_tokens * PRICE_OUTPUT_PER_MTOK) / 1_000_000;

    return {
      ok: true,
      result,
      cost,
      durationMs: Date.now() - start,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error desconocido al llamar a la API.",
    };
  }
}

export async function generateAssetBibleAction(
  scriptOutput: string
): Promise<AssetBibleResult> {
  return _genBible(scriptOutput);
}

export async function generateAssetImagesAction(
  bible: AssetBible,
  falApiKey: string
): Promise<AssetImagesResult> {
  return _genImages(bible, falApiKey);
}
