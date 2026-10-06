# Epochs Audio Features

Epochs represents each 30-second analysis window using 61 handcrafted audio features.

## Feature groups

### MFCC
13 MFCC coefficients, each summarized by mean and standard deviation.

Total: 26 features.

### Chroma
12 chroma features, each summarized by mean and standard deviation.

Total: 24 features.

### Spectral and signal descriptors
Mean and standard deviation are calculated for:

- Spectral centroid
- Spectral bandwidth
- Spectral rolloff
- Zero-crossing rate
- RMS energy

Total: 10 features.

### Tempo
Estimated tempo/BPM is included as one feature.

Total: 1 feature.

## Total

26 + 24 + 10 + 1 = 61 features.

## Song DNA distinction

Genre is the machine-learning classification output.

BPM and energy are signal-analysis measurements.

Waveform and Mel-spectrogram are visual representations of the audio signal.

Epochs should not claim that BPM or RMS energy are independently predicted by the genre classifier.
