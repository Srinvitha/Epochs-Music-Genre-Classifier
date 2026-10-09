# Epochs Creator RAG Knowledge Pack

This is an **add-on** knowledge pack for the existing Epochs RAG. It is designed to be copied into the existing `backend/rag/knowledge_base/` folder. It does not replace your existing Epochs-specific documents or the current SVM.

## Included files
- `02_genre_production_recipes.md`
- `03_sound_design_and_effects.md`
- `04_arrangement_and_composition.md`
- `05_remix_playbooks.md`
- `06_short_form_audio.md`
- `07_mixing_and_troubleshooting.md`
- `08_generation_prompt_design.md`
- `09_genre_taxonomy.md`
- `10_sources_and_evidence.md`

The numbering follows the proposed creator-focused structure. Keep your existing Epochs fundamentals/model/dataset/limitations documents; rename files only if necessary to avoid duplicate topics.

## Install
1. Back up `backend/rag/knowledge_base/`.
2. Copy the Markdown files from this folder into that directory.
3. Inspect your existing `backend/rag/ingest.py` to confirm it recursively loads all `.md` files in the knowledge-base folder.
4. From the project root, activate `mvenv` and run:
   `python -m backend.rag.ingest`
5. Restart FastAPI and test creator questions in `/docs`.

Do not delete the existing `backend/rag/storage` until you have confirmed the new ingestion completes successfully. The ingestion script may overwrite the index in place; if so, back up `storage` first.

## Suggested smoke-test questions
- “Give me a 15-second dark, cinematic soundtrack concept for a character reveal.”
- “How could I reinterpret a rock song as dark synthwave?”
- “Give me a lo-fi production recipe for a nostalgic photo montage.”
- “My mix sounds muddy. What should I check first?”
- “Can you make actual audio, or only provide a blueprint?”
- “How could I make a short clip loop smoothly?”
- “What genres can the current Epochs classifier recognize?”
- “Create a music-generation prompt for a dreamy ambient story soundtrack.”

For each answer, check retrieval sources, actionable steps, factual restraint, and whether it distinguishes a production suggestion from measured Song DNA. Start with short answers and a small `similarity_top_k` because local CPU inference has previously timed out.
