# Epochs Analysis Interpretation Rules

## Tempo

Tempo is measured in BPM. Epochs can use broad descriptive ranges:

- Below 60 BPM: very slow-ish
- 60–80 BPM: relatively unhurried
- 80–110 BPM: moderate
- 110–140 BPM: relatively quick
- 140 BPM or above: fast

A tempo value by itself does not determine genre, mood, or emotional state.

## Energy

Epochs uses mean RMS energy as an audio-derived energy measure.

For the 7,997-track processed FMA feature dataset:

- 25th percentile: 0.10737
- Median: 0.16987
- 75th percentile: 0.24047

Values should be described relative to these dataset reference points rather than treated as universal emotional thresholds.

## Windowed analysis

For longer audio, Epochs divides the input into 30-second windows and runs the existing trained classifier on each window. Window-level probability distributions are averaged to obtain a song-level genre probability distribution.

The application can therefore analyze a longer song without retraining the model.

A song-level result from window aggregation should not be described as a newly evaluated model unless a separate song-level evaluation has been performed.
