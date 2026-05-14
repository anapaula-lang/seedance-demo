---
name: seedance-script-director
description: "Use whenever the user has an idea, brief, product angle, commercial concept, rough script, or story seed that must become the pure narrative script stage for a Seedance pipeline. Use before asset generation or storyboard work. Produces premise, synopsis, beat sheet, script, dialogue/VO, timing assumptions, risks, and continuity handoff."
---

# Seedance Script Director

Desarrolla la historia en texto puro. Esta skill no genera imagenes ni prompts Seedance finales; entrega la base narrativa aprobable para que despues trabajen assets, storyboard y prompts.

## Skill Creator Practices

Mantene esta skill enfocada en una sola etapa. La descripcion decide el trigger; el cuerpo explica el contrato. No agregues instrucciones de imagen o Seedance final aca: eso pertenece a otras sub-skills.

## GSTACK Review Lens

Antes de entregar, hace un mini-review:

- `CEO`: la premisa es fuerte, especifica y no diluye el brief.
- `Design`: el guion ya sugiere imagenes filmables, no ideas abstractas imposibles de visualizar.
- `Eng`: el timing estimado puede segmentarse despues en bloques de `<=15s`.
- `DX`: el siguiente agente recibe personajes, locaciones, props y continuidad sin adivinar.

## Output Location

Si se invoca dentro de un proyecto empaquetado, guarda o prepara los entregables de guion en:

`outputs/<run-id>/01_script/`

El handoff hacia assets tambien debe quedar registrado ahi y reflejado en `outputs/<run-id>/run_manifest.json`.

## Inputs

Acepta idea, brief, guion parcial o instrucciones creativas. Detecta:

- duracion total deseada o rango.
- plataforma/formato.
- genero, tono, publico, marca/producto.
- personajes obligatorios.
- dialogo, VO, texto en pantalla o silencio.
- restricciones de produccion, referencias y nivel de automatizacion.

Si falta informacion critica y el modo es interactivo, pregunta. Si el usuario pidio one-shot, asume y declara `Supuestos`.

## Reference

Usa `references/storyboard-director-pro-manual.txt` solo cuando necesites preguntas de direccion, variedad dramatica o criterios publicitarios. No cargues el manual completo si con el contexto alcanza.

## Trigger Examples

- `Tengo esta idea para un video, ayudame a convertirla en guion.`
- `A partir de este brief, armame la historia pura antes de assets.`
- `Escribi el guion one-shot para despues hacer storyboard Seedance.`

## Output Contract

Entrega siempre:

1. `Premisa`: una frase clara.
2. `Sinopsis`: 1-2 parrafos.
3. `Beat sheet`: beats narrativos con duracion estimada.
4. `Guion puro`: accion, dialogo/VO si aplica, progresion emocional y cierre.
5. `Notas de continuidad`: elementos que deben sobrevivir a assets/storyboard.
6. `Riesgos`: ambiguedades, escenas caras, dependencias visuales o puntos que requieren decision.

No incluyas prompts de imagen, shot list tecnico ni YAML Seedance en esta etapa.

## Interactive Behavior

Default: frenar al final y pedir feedback. Usa una pregunta concreta:

`Queres aprobar este guion para pasar a assets o ajustamos algo de historia, tono, personajes o timing?`

One-shot: marca `Guion aprobado por supuesto operativo` y entrega un bloque breve `Next handoff` con lo que debe recibir `$seedance-asset-director`.

## Handoff To Assets

El handoff debe incluir:

- guion final.
- lista de personajes/entidades.
- locaciones necesarias.
- props/objetos narrativamente importantes.
- cambios de vestuario o estado.
- tono visual inferido.
