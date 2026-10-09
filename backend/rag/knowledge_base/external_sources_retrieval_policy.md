# External Sources and Retrieval Policy

## What should be retrieved for a creator question?
- Harmony/composition question: prioritize Open Music Theory notes.
- Rhythm/groove question: prioritize rhythm and pop/rock notes.
- Sound-design/synthesis question: prioritize synthesis fundamentals and SuperCollider documentation.
- EQ/compression/reverb or DAW workflow question: use mixing notes and, when the user names REAPER, link the official REAPER guide.
- Epochs model question: prioritize the project's own model, dataset and limitations documents.
- Remix or social-media audio request: retrieve composition/form knowledge plus sound-design/effects knowledge as needed.

## Keep evidence types separate
- **External music knowledge:** general musical concepts and technical principles.
- **Creative suggestion:** an optional production experiment assembled for the user's goal.
- **Epochs measurement:** only values actually supplied by the analysis API.
- **Classifier output:** model prediction and probabilities, not certainty.
- **Capability statement:** whether Epochs currently supports a workflow.

## Source presentation
Return relevant source filenames in the API response. In the frontend, display readable source titles and, when practical, clickable URLs. Do not imply that a source directly supports every sentence if it supports only one part.

## Retrieval evaluation questions
- “Explain syncopation and give me a beat-building experiment.”
- “How can I create a short dark synth reveal using filters and envelopes?”
- “My mix sounds muddy; what should I investigate first?”
- “What is the difference between a genre guide and a classifier label?”
- “Create a 15-second nostalgic photo-montage cue.”
- “What can Epochs infer from the current Song DNA?”
- “Give REAPER-specific instructions and link the official manual.”
