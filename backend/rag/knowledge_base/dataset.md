# Epochs Dataset Knowledge

## FMA Small

Epochs uses the FMA Small subset for music genre classification.

- 8,000 labeled 30-second MP3 clips
- 8 balanced genres
- 1,000 tracks per genre in the original subset
- Official split: 6,400 training, 800 validation, 800 test
- Genres: Hip-Hop, Pop, Folk, Experimental, Rock, International, Electronic, Instrumental
- 2,309 unique artists
- The project uses artist-aware splitting/evaluation to reduce artist leakage.

## Extracted application data

The feature extraction pipeline successfully processed 7,997 tracks. Three unreadable/corrupt audio files were excluded:

- 99134
- 108925
- 133297

The resulting processed feature table contains 7,997 usable tracks.

## Important interpretation rule

FMA genre labels are the training targets. They do not imply that every song has a single objectively correct genre in real-world music. Genre boundaries can overlap, and the Epochs classifier should be described as predicting the most likely label supported by its learned features.
