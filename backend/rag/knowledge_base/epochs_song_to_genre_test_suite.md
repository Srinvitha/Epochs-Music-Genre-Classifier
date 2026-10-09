# Epochs RAG: Analyzed Song → Target Genre Test Suite

Use these requests in Swagger `/docs` → `POST /rag/ask`. For tests that depend on Song DNA, pass a representative `song_dna` object from a real `/predict` response if possible. Do not invent measured facts in the answer.

## Suggested request shape

{
  "question": "How could I reinterpret this analyzed song as dark synthwave? Give me a practical transformation blueprint.",
  "song_dna": {
    "genre": "Rock",
    "confidence": 56.2,
    "bpm": 128,
    "energy": 0.31,
    "duration": 30,
    "genre_probabilities": {
      "Rock": 56.2,
      "Hip-Hop": 17.1,
      "Electronic": 11.8
    }
  }
}

The values above are illustrative only. Replace them with actual fields and values returned by the Epochs analysis endpoint. If the API uses different key names or formats, use its real response schema.

## Core target-genre transformation questions

1. “How could I reinterpret this analyzed song as dark synthwave? Give me a practical transformation blueprint.”
2. “Turn this song conceptually into lo-fi hip-hop. What should I keep, change, add, and simplify?”
3. “How could I adapt this song into a cinematic/orchestral hybrid for a character reveal?”
4. “Suggest a phonk-inspired reinterpretation of this song, with a 15-second arrangement.”
5. “How could I make an ambient version of this song while retaining a recognizable musical identity?”
6. “Compare two possible transformations of this song: dark synthwave versus dreamy ambient. Explain the trade-offs.”

## Social-media creator questions

7. “Create a 15-second Instagram Story soundtrack blueprint inspired by this analyzed song, transformed into dark synthwave.”
8. “Give me a 12-second character-edit version in a target genre of cinematic horror. Use the song's measured properties only where relevant.”
9. “Make a 20-second nostalgic photo-montage concept in lo-fi style, inspired by this song.”
10. “Design a seamless short-form loop based on this song's available Song DNA and my chosen target genre.”

## Personalization and reasoning questions

11. “Given this song's measured BPM and genre probabilities, what target-genre approaches might be practical? Separate measured facts from creative suggestions.”
12. “The source is classified as Rock, but I want dreamy ambient. Give me a blueprint without assuming the source contains particular instruments.”
13. “My target is dark synthwave, but I want to keep the original energy. Give me two different production approaches.”
14. “What can you infer from this Song DNA, and what information would you need before making more specific remix recommendations?”
15. “Can Epochs directly transform the uploaded audio, separate stems, or preserve its melody? Explain the current capability boundary.”

## Expected answer rubric

A good answer should:
- Explicitly acknowledge the user-selected target genre and intended use.
- Use only Song DNA fields actually supplied in the request.
- Distinguish measured BPM/energy/duration and model probabilities from creative suggestions.
- Retrieve relevant target-genre production knowledge and remix/arrangement guidance.
- Give actionable steps: keep/change/add/simplify, sound palette, rhythm/tempo suggestions, effects, arrangement timeline, ending/loop idea.
- Treat tempo/effects as starting points, not guaranteed formulas.
- Never infer specific instruments, chords, key, melody, vocals or stems from genre probabilities alone.
- Explain that Epochs currently generates a plan, not a rendered audio transformation.
- Return relevant source names.

## Important
The example Song DNA values above are fake test fixtures, not measurements of a real song. Prefer a real `/predict` response when evaluating the full workflow.
