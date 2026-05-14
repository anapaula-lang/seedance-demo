"use server";

import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFile } from "fs/promises";
import path from "path";

export type ScriptResult =
  | { ok: true; result: string; cost: number; durationMs: number }
  | { ok: false; error: string };

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

  const prompt = `${skillBody}

---

Modo one-shot. Idea del usuario:

"""
${idea.trim()}
"""

Convertí esto en un guion Seedance siguiendo el output contract de la skill arriba.

Si el usuario no especificó:
- Duración: asumí video corto de 15–30s.
- Plataforma: asumí Instagram/TikTok vertical 9:16.
- Tono: inferí del texto. Si no se infiere, asumí cinematográfico observado.

Si faltan datos críticos, declará "Supuestos" al inicio antes de las 6 secciones.

Entregá las 6 secciones del contract en markdown limpio, en este orden:

1. **Premisa** (1 frase)
2. **Sinopsis** (1–2 párrafos)
3. **Beat sheet** (lista con duración estimada por beat)
4. **Guion puro** (acción + diálogo/VO + progresión)
5. **Notas de continuidad** (qué debe sobrevivir a assets/storyboard)
6. **Riesgos** (ambigüedades, dependencias visuales caras)

Al final agregá un bloque **Next handoff** con: lista de personajes, locaciones, props, cambios de vestuario, tono visual inferido. No incluyas prompts de imagen ni shot list técnico.`;

  const start = Date.now();
  let result = "";
  let cost = 0;

  try {
    for await (const message of query({
      prompt,
      options: {
        settingSources: [],
      },
    })) {
      if (message.type === "result") {
        if ("result" in message && typeof message.result === "string") {
          result = message.result;
        }
        if ("total_cost_usd" in message && typeof message.total_cost_usd === "number") {
          cost = message.total_cost_usd;
        }
      }
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error desconocido al llamar al SDK.",
    };
  }

  if (!result) {
    return { ok: false, error: "El agente no devolvió resultado." };
  }

  return {
    ok: true,
    result,
    cost,
    durationMs: Date.now() - start,
  };
}
