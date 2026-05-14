# Seedance Script Director — Demo

Demo web de la primera etapa del pipeline [seedance-storyboard](https://github.com/anapaula-lang/seedance-storyboard): convierte una idea en guion estructurado (premisa, beat sheet, guion puro, handoff a assets).

Solo etapa de script. El pipeline completo (assets, storyboard, prompts, video con Fal.ai) se corre clonando el repo y usando Claude Code.

## Stack

- Next.js 16 (App Router)
- @anthropic-ai/claude-agent-sdk
- Tailwind CSS 4
- Deploy: Vercel

## Local

```bash
cp .env.example .env.local
# pegá tu ANTHROPIC_API_KEY (https://console.anthropic.com)
npm install
npm run dev
```

Abrí http://localhost:3000.

## Deploy en Vercel

1. Push a GitHub.
2. Importá el repo en vercel.com.
3. Agregá `ANTHROPIC_API_KEY` en Project Settings → Environment Variables.
4. Deploy.

## Costo por run

~$0.05–$0.20 en tokens Claude Sonnet, según largo del input/output. La demo no guarda outputs ni cobra al usuario; cada ejecución usa la API key del operador.
