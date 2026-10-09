# Sources, Evidence, and Knowledge-Base Maintenance

## Provenance policy
Each knowledge document should distinguish:
1. Established technical descriptions;
2. Common production conventions;
3. Creative suggestions and heuristics;
4. Epochs-specific measured facts;
5. Unsupported claims that should not be made.

Production recipes in this starter pack are curated practical heuristics. Tempo ranges and arrangement examples are approximate and intentionally presented as starting points rather than definitive genre definitions.

## Recommended source types for future enrichment
Prioritize:
- official documentation for DAWs, audio effects, and audio-processing tools;
- university/open educational resources for acoustics, signal processing, harmony, and rhythm;
- openly licensed music-production tutorials and educational references;
- dataset documentation and original research papers for claims about labelled audio data;
- primary documentation for any external audio-generation service.

For each imported reference, record title, author/publisher, URL, access date, license/usage terms, and which statements it supports.

## Copyright and licensing
Do not copy large sections of copyrighted tutorials or books into the knowledge base. Prefer your own summaries and short factual notes with attribution. Confirm license and permitted use before including datasets, audio, or substantial text. A dataset's availability does not automatically grant unrestricted commercial use.

## Quality checks
- Are claims appropriately qualified?
- Is advice actionable for a beginner?
- Does it distinguish measured facts from suggestions?
- Does it avoid promising that a setting guarantees a genre or mood?
- Does it mention uncertainty where styles overlap?
- Does it avoid claims about audio contents that Epochs has not measured?
- Can a user try the recommendation in a typical DAW?
- Does the document say when it applies and where it may fail?

## Maintenance
When adding a genre, update both the relevant production guide and the taxonomy. Do not imply that adding the guide retrains the classifier. Rebuild the RAG index after changing knowledge documents and run the creator-question evaluation set.
