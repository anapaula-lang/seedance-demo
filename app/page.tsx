"use client";

import { useState, useTransition } from "react";
import {
  generateScript,
  generateAssetBibleAction,
  generateAssetImagesAction,
  type ScriptResult,
} from "./actions";
import type {
  AssetBible,
  AssetBibleResult,
  AssetImagesResult,
} from "@/lib/asset-pipeline";

const EXAMPLES = [
  "Bestia Digital corre la Ruta 40 al amanecer, mate en mano, mochila atrás. Tono prestige drama.",
  "Una cocina abierta en un fogón a la noche. Familia argentina riéndose. Producto: termo Driven.",
  "Mecánico arregla un 4x4 al costado de la ruta. Llega la lluvia. El crique aparece como héroe silencioso.",
];

type Step = "script" | "assets" | "done";

export default function Home() {
  const [step, setStep] = useState<Step>("script");
  const [idea, setIdea] = useState("");
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null);
  const [bibleResult, setBibleResult] = useState<AssetBibleResult | null>(null);
  const [imagesResult, setImagesResult] = useState<AssetImagesResult | null>(null);
  const [falKey, setFalKey] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleScriptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScriptResult(null);
    startTransition(async () => {
      const r = await generateScript(idea);
      setScriptResult(r);
    });
  };

  const continueToAssets = () => {
    setStep("assets");
  };

  const handleAssetsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptResult || !scriptResult.ok) return;
    setBibleResult(null);
    setImagesResult(null);
    startTransition(async () => {
      const bible = await generateAssetBibleAction(scriptResult.result);
      setBibleResult(bible);
      if (bible.ok) {
        const images = await generateAssetImagesAction(bible.bible, falKey);
        setImagesResult(images);
        setStep("done");
      }
    });
  };

  const reset = () => {
    setStep("script");
    setIdea("");
    setScriptResult(null);
    setBibleResult(null);
    setImagesResult(null);
  };

  return (
    <main className="flex flex-col flex-1 items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-3xl flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Seedance Pipeline — Demo
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
            De idea a guion a asset bible visual. Demo de las primeras 2 etapas del{" "}
            <a
              href="https://github.com/anapaula-lang/seedance-storyboard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-zinc-400 hover:decoration-zinc-900 dark:hover:decoration-zinc-50"
            >
              pipeline open source
            </a>
            .
          </p>
          <Stepper step={step} />
        </header>

        {/* STEP 1: SCRIPT */}
        {step === "script" && (
          <>
            <form onSubmit={handleScriptSubmit} className="flex flex-col gap-3">
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
                {isPending ? "Generando guion…" : "1. Generar guion"}
              </button>
            </form>

            {isPending && <Pending text="~20–60s. El agente está armando las 6 secciones." />}
            {scriptResult && !scriptResult.ok && <ErrorBox msg={scriptResult.error} />}
            {scriptResult && scriptResult.ok && (
              <ScriptOutput result={scriptResult} onContinue={continueToAssets} />
            )}
          </>
        )}

        {/* STEP 2: ASSETS */}
        {step === "assets" && scriptResult?.ok && (
          <>
            <details className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4">
              <summary className="cursor-pointer text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Ver guion aprobado
              </summary>
              <div className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                {scriptResult.result}
              </div>
            </details>

            <form onSubmit={handleAssetsSubmit} className="flex flex-col gap-3">
              <label
                htmlFor="falKey"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Tu FAL API key (BYOK)
                <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-500 mt-1">
                  Las imágenes corren con tu cuenta de FAL — cuesta ~$0.08 por imagen.
                  Sacá una key en{" "}
                  <a
                    href="https://fal.ai/dashboard/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    fal.ai/dashboard/keys
                  </a>
                  . No se guarda en el servidor.
                </span>
              </label>
              <input
                id="falKey"
                type="password"
                value={falKey}
                onChange={(e) => setFalKey(e.target.value)}
                placeholder="fal_..."
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-mono"
                disabled={isPending}
              />

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isPending || falKey.length < 20}
                  className="px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isPending ? "Generando…" : "2. Generar asset bible + imágenes"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("script")}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-50"
                >
                  ← Volver al guion
                </button>
              </div>
            </form>

            {isPending && (
              <Pending text="~30–60s. Claude arma la bible (10s) y FAL genera las imágenes en paralelo." />
            )}
            {bibleResult && !bibleResult.ok && <ErrorBox msg={bibleResult.error} />}
          </>
        )}

        {/* STEP 3: DONE */}
        {step === "done" && bibleResult?.ok && imagesResult && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Asset Bible generada
              </h2>
              <button
                onClick={reset}
                className="text-sm underline text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                Empezar de cero
              </button>
            </div>

            {imagesResult.ok && (
              <>
                <Metrics
                  bibleCost={bibleResult.cost}
                  bibleMs={bibleResult.durationMs}
                  falCost={imagesResult.falCost}
                  falMs={imagesResult.durationMs}
                />
                <Gallery assets={imagesResult.assets} />
              </>
            )}
            {!imagesResult.ok && <ErrorBox msg={imagesResult.error} />}
          </>
        )}

        <footer className="mt-auto pt-12 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
          Esta demo corre las etapas de guion y assets. Las etapas siguientes (storyboard,
          prompts Seedance, video con Fal.ai) se ejecutan clonando el{" "}
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

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "script", label: "1. Guion" },
    { key: "assets", label: "2. Assets" },
    { key: "done", label: "3. Listo" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex gap-2 mt-2">
      {steps.map((s, i) => (
        <div
          key={s.key}
          className={`text-xs px-3 py-1 rounded-full border ${
            i <= currentIdx
              ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600"
          }`}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}

function Pending({ text }: { text: string }) {
  return (
    <div className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">{text}</div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-300">
      {msg}
    </div>
  );
}

function ScriptOutput({
  result,
  onContinue,
}: {
  result: { ok: true; result: string; cost: number; durationMs: number };
  onContinue: () => void;
}) {
  return (
    <article className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          Generado en {(result.durationMs / 1000).toFixed(1)}s · costo ≈ $
          {result.cost.toFixed(4)}
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
      <button
        onClick={onContinue}
        className="self-start px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium hover:opacity-90 transition"
      >
        Continuar a Assets →
      </button>
    </article>
  );
}

function Metrics({
  bibleCost,
  bibleMs,
  falCost,
  falMs,
}: {
  bibleCost: number;
  bibleMs: number;
  falCost: number;
  falMs: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <Metric label="Bible (Claude)" value={`$${bibleCost.toFixed(4)}`} />
      <Metric label="Bible tiempo" value={`${(bibleMs / 1000).toFixed(1)}s`} />
      <Metric label="Imágenes (FAL)" value={`$${falCost.toFixed(2)}`} />
      <Metric label="Imágenes tiempo" value={`${(falMs / 1000).toFixed(1)}s`} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2">
      <div className="text-zinc-500 dark:text-zinc-500">{label}</div>
      <div className="font-mono font-medium text-zinc-900 dark:text-zinc-50 mt-0.5">
        {value}
      </div>
    </div>
  );
}

function Gallery({
  assets,
}: {
  assets: import("@/lib/asset-pipeline").GeneratedAsset[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {assets.map((a) => (
        <div
          key={a.id}
          className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-50">
              {a.id}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">
              {a.type}
            </span>
          </div>
          {a.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.image_url}
              alt={a.name}
              className="w-full rounded border border-zinc-200 dark:border-zinc-800"
            />
          ) : (
            <div className="aspect-video rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center justify-center text-xs text-red-700 dark:text-red-300 px-3 text-center">
              {a.error || "Sin imagen"}
            </div>
          )}
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{a.name}</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            {a.narrative_function}
          </div>
          <details className="text-xs text-zinc-500 dark:text-zinc-500">
            <summary className="cursor-pointer">Ver prompt FAL</summary>
            <code className="block mt-1 text-[10px] leading-tight">{a.fal_prompt}</code>
          </details>
        </div>
      ))}
    </div>
  );
}
