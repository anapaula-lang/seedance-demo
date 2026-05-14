"use client";

import { useState, useTransition } from "react";
import { generateScript, type ScriptResult } from "./actions";

const EXAMPLES = [
  "Bestia Digital corre la Ruta 40 al amanecer, mate en mano, mochila atrás. Tono prestige drama.",
  "Una cocina abierta en un fogón a la noche. Familia argentina riéndose. Producto: termo Driven.",
  "Mecánico arregla un 4x4 al costado de la ruta. Llega la lluvia. El crique aparece como héroe silencioso.",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const r = await generateScript(idea);
      setResult(r);
    });
  };

  return (
    <main className="flex flex-col flex-1 items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-3xl flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Seedance Script Director
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
            Convertí una idea en guion estructurado: premisa, beat sheet, guion puro y handoff a
            assets. Demo de la primera etapa del{" "}
            <a
              href="https://github.com/anapaula-lang/seedance-storyboard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-zinc-400 hover:decoration-zinc-900 dark:hover:decoration-zinc-50"
            >
              pipeline Seedance open source
            </a>
            .
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label
            htmlFor="idea"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tu idea, brief o concepto
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ej: Una camioneta cruza la cordillera al amanecer. 20 segundos. Producto: termo de acero."
            rows={5}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            disabled={isPending}
          />

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setIdea(ex)}
                disabled={isPending}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                {ex.slice(0, 50)}…
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isPending || idea.trim().length < 10}
            className="self-start mt-2 px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isPending ? "Generando guion…" : "Generar guion"}
          </button>
        </form>

        {isPending && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
            Esto tarda ~20–60 segundos. El agente está leyendo la skill y armando las 6 secciones.
          </div>
        )}

        {result && !result.ok && (
          <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            {result.error}
          </div>
        )}

        {result && result.ok && (
          <article className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                Generado en {(result.durationMs / 1000).toFixed(1)}s · costo ≈ ${result.cost.toFixed(4)}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(result.result)}
                className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Copiar
              </button>
            </div>
            <div className="prose prose-zinc dark:prose-invert max-w-none rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-5 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {result.result}
            </div>
          </article>
        )}

        <footer className="mt-auto pt-12 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
          Esta demo solo corre la etapa de guion. El pipeline completo (assets, storyboard,
          prompts, video con Fal.ai) se ejecuta clonando el{" "}
          <a
            href="https://github.com/anapaula-lang/seedance-storyboard"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            repo
          </a>{" "}
          con Claude Code.
        </footer>
      </div>
    </main>
  );
}
