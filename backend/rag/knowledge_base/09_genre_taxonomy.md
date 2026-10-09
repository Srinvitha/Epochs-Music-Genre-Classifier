# Genre Taxonomy and Label Mapping

## Purpose
Keep the RAG independent from the classifier's current fixed label list. A production guide may describe styles the classifier cannot currently recognize. Never present knowledge-base coverage as classifier capability.

## Current Epochs classifier labels
The current FMA Small model uses these eight broad labels:
- Electronic
- Experimental
- Folk
- Hip-Hop
- Instrumental
- International
- Pop
- Rock

These are classifier labels, not a complete map of music. “Instrumental” describes vocal presence or format more than a single genre; “International” is a broad dataset label and should not be treated as one coherent musical style.

## Suggested taxonomy design
Store genre concepts with fields such as:
- canonical name;
- parent family;
- synonyms and spelling variants;
- related styles;
- common overlaps;
- short descriptive definition;
- whether it is currently a classifier label;
- whether a production guide exists;
- source and confidence notes.

## Example relationships (illustrative)
- Electronic → house, techno, drum & bass, ambient electronic, synthwave, trance.
- Hip-Hop → boom bap, trap, lo-fi hip-hop, instrumental hip-hop.
- Rock → alternative rock, hard rock, punk rock, metal-related styles.
- Folk → acoustic folk, singer-songwriter, regional folk traditions.
These groupings are simplified. Real-world genres overlap, evolve, and vary across scenes.

## Important distinctions
- A genre appearing in a RAG guide does not mean the classifier can identify it.
- A classifier label does not necessarily map one-to-one to a production genre.
- Some tracks are hybrids and may require multi-label descriptions.
- If a user's requested style is outside the model's label set, the assistant can still provide production advice while stating that it is not a supported classifier label.

## Retrieval guidance
Match aliases and related styles, but don't collapse all related genres into one answer. If a user asks for synthwave, prioritize the synthwave guide and use the broader electronic guide only as supporting context.
