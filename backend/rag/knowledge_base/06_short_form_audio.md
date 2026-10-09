# Short-Form Audio — Stories, Reels, Edits and Intros

## Start with the use case
Ask or infer only what is needed: duration, mood, intended visual moment, energy, whether vocals are wanted, and whether the clip must loop. If key information is missing, provide a sensible default and label it.

## Useful creative briefs
- **Photo dump / memory montage:** warm or wistful texture, a recognizable motif, moderate development, gentle ending.
- **Night drive / city montage:** pulsing bass, spacious synths, repeating motif, slow filter movement.
- **Character reveal:** sparse tension, a short build, strong reveal/impact, controlled tail.
- **Horror or mystery:** low drone, dissonant or unresolved motif, restrained high-frequency details, silence before a reveal.
- **Energetic edit:** clear rhythmic hook, punchy transient, syncopation, one or two well-timed accents.
- **Soft emotional story:** sparse keys or plucked motif, gentle pad, limited percussion, natural decay.
These are creative starting points, not guarantees about audience reaction.

## Blueprint structure
For each request, return:
1. Concept title.
2. Mood and intended visual use.
3. Duration and proposed tempo (or explicitly state no fixed tempo).
4. Sound palette and role of each layer.
5. Timeline with timestamps.
6. Production steps and optional effects.
7. Ending/loop strategy.
8. An external music-generation prompt if requested.
9. One simpler alternative and one more intense alternative.

## Timeline examples

### 12-second mysterious story
- 0–3s: low drone and distant texture; leave space.
- 3–6s: add a faint pulse or repeating two-note motif.
- 6–9s: gradually increase tension with filtering or a riser.
- 9–12s: reveal with a short impact, then let the tail decay.
Use a restrained mix; do not add every possible effect.

### 15-second nostalgic photo montage
- 0–3s: introduce a soft chord or motif.
- 3–7s: add a gentle pulse, texture, or secondary note.
- 7–12s: vary the motif or open the texture slightly.
- 12–15s: resolve softly or create a loopable tail.
Possible palette: mellow keys, muted pluck, gentle bass, restrained room ambience.

### 20-second energetic edit
- 0–3s: brief pickup or rhythmic cue.
- 3–8s: establish groove.
- 8–12s: reduce elements or create a short pause.
- 12–17s: strongest rhythmic or melodic moment.
- 17–20s: ending impact, tail, or loop setup.

## Music-generation prompt design
A useful prompt can specify:
- style or blend, described in ordinary language;
- mood and energy;
- instruments or sound roles;
- tempo feel, if useful;
- arrangement arc and duration;
- vocal/instrumental preference;
- mix and ending requirements;
- exclusions, such as no vocals or no abrupt ending.

Avoid contradictory prompts such as “minimal but full of many competing layers.” Prefer a primary style plus one supporting influence. Generation tools vary, so a prompt cannot guarantee exact BPM, duration, or structure.

## Important capability boundary
This guide helps Epochs create a plan or prompt. Unless a separate generation model is integrated, Epochs does not render a playable audio file itself.
