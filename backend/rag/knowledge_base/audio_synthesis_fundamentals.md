# Audio Synthesis Fundamentals for Sound Design

## Scope and provenance
Original high-level notes based on concepts documented in the official SuperCollider help and tutorials. These are not copied manual pages or executable code.
Sources: https://docs.supercollider.online/ and https://github.com/supercollider/learn
Licensing: https://docs.supercollider.online/Other/HelpDocsLicensing.html and the tutorial repository. See `source_manifest.md`.

## Oscillators and waveforms
- An oscillator produces a repeating signal. Different waveforms have different harmonic content and therefore different timbral qualities.
- Sine waves are spectrally simple; saw-like and pulse-like waves contain richer harmonic structures.
- Final timbre also depends on pitch, envelope, filtering, modulation, distortion, layering and playback context.
- Treat waveform-to-mood associations as creative heuristics, not reliable rules.

## Envelopes
- An amplitude envelope describes how a sound changes over time. A common model uses attack, decay, sustain and release (ADSR).
- Short attack/release times can make a sound feel more percussive; longer attacks or releases can create softer entrances or tails. Results depend on source and envelope shape.
- For short social clips, envelope and note length can matter as much as the synth patch.

## Filters
- Low-pass filters attenuate higher frequencies above a cutoff region; high-pass filters attenuate lower frequencies below a cutoff region.
- Cutoff automation can create motion, reveal, distance, or a sense of opening/closing.
- Resonance emphasizes frequencies near the cutoff and can become piercing or boomy when excessive.
- Without hearing or analyzing the user's audio, Epochs should suggest experiments rather than claim a specific frequency is defective.

## Modulation
- Modulation changes a parameter over time. A low-frequency oscillator (LFO) can modulate pitch, amplitude, filter cutoff or stereo position.
- Subtle modulation can keep sustained tones from feeling static; too much can distract from the motif.
- Automation and modulation can create development when an arrangement has few notes or layers.

## Effects and layering
- Reverb suggests space and adds decay; long tails can blur fast patterns.
- Delay repeats a sound and can create rhythmic echoes. Tempo-synchronized delay can support a groove.
- Distortion and saturation add harmonics and density but can mask detail.
- Layer sounds by role: transient/attack, body, low foundation, harmonic bed, melody and texture. Remove competing layers rather than processing everything.

## Example experiments
- **Dark reveal:** low drone + slowly opening low-pass filter + one short impact; keep the motif sparse.
- **Dreamy texture:** sustained pad + gentle modulation + a few delayed notes; leave space.
- **Retro pulse:** steady bass pulse + bright lead + restrained modulation; control reverb tails so the groove remains clear.

## Implementation boundary
This document teaches sound-design concepts. It does not mean Epochs currently includes a synthesizer, runs SuperCollider, creates MIDI, or renders generated audio.
