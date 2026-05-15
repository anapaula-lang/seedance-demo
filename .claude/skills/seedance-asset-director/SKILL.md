---
name: seedance-asset-director
description: "Use whenever a Seedance script, beat sheet, or story bible is approved and the user needs visual development before storyboard: moodboard, casting, character sheets, locations, wardrobe, props, product refs, and GPT Image 2 prompts/assets generated separately in 16:9. Use before storyboard creation."
---

# Seedance Asset Director

Convierte un guion aprobado en una biblia visual de assets separados. Esta etapa disena casting, personajes, locaciones, vestuario, props y moodboard antes de combinarlos en storyboards.

## Skill Creator Practices

Esta skill debe producir assets reutilizables con IDs estables. Mantene el `SKILL.md` liviano y carga la referencia solo si hay que resolver direccion de arte o prompts complejos.

## GSTACK Review Lens

Antes de entregar, revisa:

- `CEO`: cada asset sirve a la historia; no hay decoracion gratuita que complique produccion.
- `Design`: identidad, paleta, vestuario, props y locaciones son consistentes y diferenciables.
- `Eng`: los assets estan separados, referenciables y aptos para combinar luego en Seedance.
- `DX`: cada asset tiene prompt, consistencia bloqueada y variaciones permitidas.

## Output Location

Si se invoca dentro de un proyecto empaquetado, guarda o prepara assets en:

- `outputs/<run-id>/02_assets/asset_bible.md`
- `outputs/<run-id>/02_assets/characters/`
- `outputs/<run-id>/02_assets/wardrobe/`
- `outputs/<run-id>/02_assets/locations/`
- `outputs/<run-id>/02_assets/props/`
- `outputs/<run-id>/02_assets/moodboard/`

Cada imagen o prompt generado debe usar el ID del asset en el nombre de archivo cuando sea posible. Actualiza `run_manifest.json` con `asset_ids` y archivos generados.

## Inputs

Requiere:

- guion puro o beat sheet aprobado.
- tono visual o referencias, si existen.
- formato/aspect ratio; default `16:9`.
- restricciones de marca, casting o producto.
- modo: interactivo por default o one-shot si el usuario lo pidio.

## Reference

Usa `references/storyboard-director-pro-manual.txt` cuando necesites criterios de direccion de arte, consistencia visual, prompts de imagen o decisiones de estilo cinematografico.

Lee `references/asset-output-style.md` cuando generes prompts para `CHAR-##` o `LOC-##`. Es la fuente de verdad para:

- character sheets: retrato grande alineado a la izquierda + front/right/left/back sobre fondo blanco.
- locaciones: hoja 16:9 en grid 2x2 con cuatro vistas consistentes de la misma locacion.

## Trigger Examples

- `El guion ya esta aprobado, generemos casting y locaciones.`
- `Necesito character sheets, props y moodboard para este video.`
- `Arma la biblia de assets 16:9 para pasar a storyboard.`

## Asset Bible

Crea IDs estables y no los cambies salvo que el usuario lo pida:

- `CHAR-##`: personas, animales, criaturas, entidades.
- `WARD-##`: vestuario por personaje y por momento.
- `LOC-##`: locaciones y variantes de iluminacion/estado.
- `PROP-##`: objetos, productos, vehiculos, dispositivos o elementos de escena.
- `MOOD-##`: paleta, lente/look, textura, atmosfera.

Para cada asset entrega:

- `ID`
- `Nombre`
- `Funcion narrativa`
- `Descripcion visual`
- `Prompt GPT Image 2 16:9`
- `Consistencia bloqueada`
- `Variaciones permitidas`
- `Referencia generada/path` o `Pendiente de generacion`

## Image Generation Rules

Si la herramienta de imagen esta disponible, genera assets separados. No mezcles personaje + locacion + prop salvo que sea un moodboard explicitamente pedido.

Si el usuario ya envio un asset usable, no lo regeneres por default. Copialo al run, asignale un ID estable, registralo como source/approved asset y usalo como referencia primaria. Genera solamente assets faltantes, variantes o ediciones explicitamente pedidas.

Canon operativo: cuando un `CHAR-##` ya tiene un character sheet aprobado, ese sheet pasa a ser el unico canonico del personaje. No generes variantes nuevas, sheets extra de vestuario o expresiones separadas salvo pedido explicito; deriva continuidad de ese sheet.

Canon operativo: si hay multiples locaciones pendientes (`LOC-##`), generalas juntas en paralelo/batch despues de preparar prompts y paths. Esto tiene prioridad sobre generar una locacion por vez para evitar demoras innecesarias.

Cuando haya multiples assets independientes, prepara todos los prompts y generacion paths primero, y generlos en paralelo o batch si la herramienta lo permite. Si la herramienta disponible serializa la generacion, avisa explicitamente y ejecuta en el modo mas concurrente posible.

Un asset board combinado puede generarse como preview/moodboard universal, pero debe anunciarse como tal y nunca cuenta como reemplazo de `CHAR-##`, `LOC-##` o `PROP-##` separados.

Prompts de assets:

- usar lenguaje positivo.
- incluir sujeto, composicion, accion/pose, ubicacion/fondo cuando aplique y estilo.
- pedir `16:9`.
- para character sheets, usar por default el formato de `references/asset-output-style.md`: closeup portrait left aligned, outfit visible, neutral expression, full body front/right/left/back, white background, no text, no borders, no soft gradients.
- para locaciones, usar por default hoja `16:9` con `2x2 grid`: wide establishing view, alternate angle, closer detail view y top-down/plan-like spatial view.
- para personajes principales de alta fidelidad, preferir retrato, cuerpo completo y expresiones separados.

## Interactive Behavior

Default: frenar al final y pedir aprobacion de casting/assets.

Pregunta:

`Aprobamos esta biblia de assets para storyboard o queres ajustar casting, locaciones, vestuario, props o mood?`

One-shot: marca `Assets aprobados por supuesto operativo` y entrega `Next handoff` para `$seedance-storyboard-director`.

## Handoff To Storyboard

Incluye:

- Asset Bible completa.
- lista de assets imprescindibles por beat del guion.
- continuidad visual que no debe romperse.
- referencias/paths generados o prompts si no se generaron imagenes.
