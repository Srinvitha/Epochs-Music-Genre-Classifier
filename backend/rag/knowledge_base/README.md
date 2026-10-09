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

# Epochs External Knowledge Starter Pack

This pack adds a source-attributed external knowledge layer to Epochs' RAG while keeping the classifier unchanged on FMA Small's eight labels.

## Contents
- `source_manifest.md`: source URLs, licensing/provenance notes and attribution.
- `music_theory_rhythm_harmony.md`: original summary notes on rhythm, harmony and form based on Open Music Theory.
- `pop_rock_and_genre_relationships.md`: style dimensions, hybrid design and classifier boundary.
- `audio_synthesis_fundamentals.md`: original summary notes based on SuperCollider documentation/tutorials.
- `mixing_and_audio_effects_concepts.md`: general effects notes plus official REAPER manual pointers.
- `external_sources_retrieval_policy.md`: retrieval routing and evaluation prompts.

These are curated summaries and pointers, not full external manuals. Open Music Theory is CC BY-SA 4.0 except where otherwise noted. SuperCollider help documentation and tutorial repository have their own stated CC BY-SA licenses; software/code licensing is separate. REAPER's official guides are linked as references and are not copied into this pack. Check individual source terms before adding or redistributing more content.

## Install safely
1. Back up `backend/rag/knowledge_base/` and `backend/rag/storage/`.
2. Copy the `.md` files from `external_knowledge/` into `backend/rag/knowledge_base/`.
3. Keep current Epochs-specific files and creator guides for now; consolidate duplicates after testing.
4. From project root with `mvenv` active, run `python -m backend.rag.ingest`.
5. Confirm document count rises and indexing completes.
6. Restart FastAPI and run the smoke tests in `external_sources_retrieval_policy.md`.

## Note
The pack improves breadth and provenance, but it does not make the RAG automatically authoritative. Evaluate retrieval and answer quality, and add source links to the frontend display when practical.
