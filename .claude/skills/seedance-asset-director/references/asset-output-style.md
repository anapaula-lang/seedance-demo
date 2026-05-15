# Asset Output Style

Use this reference when generating prompts for characters or locations.

## Character Sheets

Default character sheet prompt pattern:

`Create a realistic character sheet. Include a closeup portrait which is left aligned (the outfit must be visible in the portrait), no borders, with a neutral expression and then also include a full view shot that shows the front, right side view, left side view and back of the character. The character is placed on a white background. Don't include any text. No borders, no soft gradients. [Add character-specific identity, wardrobe, materials, props, and reference constraints.]`

Rules:

- Use for every `CHAR-##` unless the user asks for another format.
- Keep the closeup portrait large and left aligned.
- The outfit/costume must be visible in the portrait.
- Include full-body front, right side, left side and back views.
- White background.
- No text, no labels, no decorative borders, no soft gradients.
- If a prop is identity-critical, include it in the full-body front view only unless it blocks the turnaround.

Style examples live in:

- `assets/style-examples/character-sheets/`
- project package mirror: `resources/style-examples/character-sheets/`

## Location Sheets

Default location prompt pattern:

`Create a 16:9 location reference sheet arranged as a 2x2 grid showing four consistent views of the same location: wide establishing view, alternate angle, closer detail view, and top-down or plan-like spatial view. Keep the architecture, materials, lighting and layout consistent across all four panels. No text, no labels, no people unless explicitly requested. Thin grid separators are acceptable; no decorative borders. [Add location-specific design, mood, props, and reference constraints.]`

Rules:

- Use for every `LOC-##` unless the user asks for a single hero environment.
- Four views must belong to the same location, not four different concepts.
- Include one wide establishing view and one spatial/top-down or plan-like view whenever useful.
- Keep layout continuity: doors, vitrines, corridors, objects and light direction should match.
- No text labels. Avoid signage unless the location depends on it.
- Thin internal grid dividers are acceptable because they define the 2x2 sheet; avoid decorative frames.

Style examples live in:

- `assets/style-examples/location-grids/`
- project package mirror: `resources/style-examples/location-grids/`
