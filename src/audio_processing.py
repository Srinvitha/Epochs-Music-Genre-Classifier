"""Audio loading and basic signal-processing utilities for Epochs."""
import librosa
import numpy as np

TARGET_SR = 22050
CLIP_DURATION = 30

def load_audio(path, sr=TARGET_SR, duration=CLIP_DURATION, offset=0.0):
    y, sr = librosa.load(
        path,
        sr=sr,
        mono=True,
        offset=offset,
        duration=duration
    )
    return y, sr

def calculate_tempo(y, sr):
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    return float(np.asarray(tempo).reshape(-1)[0])

def calculate_rms_energy(y):
    rms = librosa.feature.rms(y=y)
    return float(np.mean(rms))
