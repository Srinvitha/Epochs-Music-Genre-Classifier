import librosa
import librosa.display
from pathlib import Path
import base64
import io
import tempfile
import subprocess

import imageio_ffmpeg

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.rag_router import router as rag_router
from src.audio_processing import load_audio
from src.feature_extraction import extract_features


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / "models" / "final_pipeline.joblib"


# ---------------------------------------------------------
# Load trained model
# ---------------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Final model not found: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)


# ---------------------------------------------------------
# FastAPI
# ---------------------------------------------------------

app = FastAPI(
    title="Epochs — Music Genre Classifier",
    description="Song DNA analysis API",
    version="1.0.0"
)

app.include_router(rag_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

ALLOWED_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".flac",
    ".ogg",
    ".m4a",
    ".webm",
}

WINDOW_DURATION = 30
MAX_RECORDING_DURATION = 90
MAX_UPLOAD_DURATION = 5 * 60
MAX_WAVEFORM_POINTS = 3000


def calculate_energy(y):
    """Calculate RMS energy."""
    rms = librosa.feature.rms(y=y)
    return float(np.mean(rms))


def create_waveform(y, points=MAX_WAVEFORM_POINTS):
    """Downsample waveform for frontend visualization."""
    if len(y) <= points:
        return y.astype(float).tolist()

    indices = np.linspace(0, len(y) - 1, points).astype(int)
    return y[indices].astype(float).tolist()


def create_mel_spectrogram(y, sr):
    """Generate a Mel-spectrogram PNG and return it as base64."""
    mel = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_mels=128
    )

    mel_db = librosa.power_to_db(
        mel,
        ref=np.max
    )

    duration = len(y) / sr
    figure_width = min(16, max(10, duration / 8))
    fig, ax = plt.subplots(figsize=(figure_width, 4))

    librosa.display.specshow(
        mel_db,
        sr=sr,
        x_axis="time",
        y_axis="mel",
        ax=ax
    )

    ax.set_title("Mel-Spectrogram")
    fig.tight_layout()

    buffer = io.BytesIO()
    fig.savefig(
        buffer,
        format="png",
        dpi=120,
        bbox_inches="tight"
    )

    plt.close(fig)

    buffer.seek(0)

    return base64.b64encode(
        buffer.read()
    ).decode("utf-8")

# ---------------------------------------------------------
# Converts WebM → mono WAV → 22,050 Hz
# ---------------------------------------------------------

def convert_to_wav(input_path: Path) -> Path:
    """
    Convert browser-recorded WebM audio to WAV
    so the existing Librosa pipeline can process it.
    """

    output_file = tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False
    )

    output_path = Path(output_file.name)
    output_file.close()

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    command = [
        ffmpeg_exe,
        "-y",
        "-i",
        str(input_path),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "22050",
        "-sample_fmt",
        "s16",
        str(output_path),
    ]

    subprocess.run(
        command,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        check=True,
    )

    return output_path


def analyze_audio_windows(audio_path: Path, total_duration=None):
    """Predict each 30-second window and aggregate song-level metrics."""
    if total_duration is None:
        total_duration = float(
            librosa.get_duration(path=str(audio_path))
        )

    if total_duration <= 0:
        raise ValueError("The uploaded audio contains no usable audio.")

    feature_columns = (
        list(model.feature_names_in_)
        if hasattr(model, "feature_names_in_")
        else None
    )
    segment_results = []
    start = 0.0

    while start < total_duration:
        window_duration = min(
            WINDOW_DURATION,
            total_duration - start
        )

        if window_duration < 1.0:
            break

        features = extract_features(
            audio_path,
            offset=start,
            duration=WINDOW_DURATION
        )
        segment_audio, segment_sr = load_audio(
            audio_path,
            offset=start,
            duration=window_duration
        )
        segment_tempo, _ = librosa.beat.beat_track(
            y=segment_audio,
            sr=segment_sr
        )
        segment_tempo = float(
            np.asarray(segment_tempo).reshape(-1)[0]
        )

        if feature_columns is None:
            feature_columns = list(features.keys())

        feature_df = pd.DataFrame(
            [[features[column] for column in feature_columns]],
            columns=feature_columns
        )
        probabilities = model.predict_proba(feature_df)[0]

        segment_results.append({
            "start": round(start, 2),
            "end": round(start + window_duration, 2),
            "duration": round(window_duration, 2),
            "tempo": segment_tempo,
            "energy": calculate_energy(segment_audio),
            "probabilities": probabilities,
        })

        start += window_duration

    if not segment_results:
        raise ValueError("The uploaded audio is too short to analyze.")

    average_probabilities = np.mean(
        [result["probabilities"] for result in segment_results],
        axis=0
    )
    classes = model.classes_
    prediction_index = int(np.argmax(average_probabilities))
    prediction = classes[prediction_index]

    genre_probabilities = {
        str(classes[index]): round(float(average_probabilities[index]) * 100, 2)
        for index in np.argsort(average_probabilities)[::-1]
    }

    tempo_values = [
        result["tempo"]
        for result in segment_results
        if result["tempo"] > 0
    ]

    return {
        "genre": str(prediction),
        "confidence": round(
            float(average_probabilities[prediction_index]) * 100,
            2
        ),
        "genre_probabilities": genre_probabilities,
        "bpm": float(np.mean(tempo_values)) if tempo_values else 0.0,
        "energy": float(np.mean([
            result["energy"] for result in segment_results
        ])),
        "duration": float(total_duration),
        "segments_analyzed": len(segment_results),
    }

# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------

@app.get("/health")
def health():
    return {
        "service": "Epochs API",
        "status": "UP",
        "model": "SVM",
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Validate filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format."
        )

    # Read uploaded file
    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    temporary_path = None
    converted_path = None

    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False
        ) as temp_file:

            temp_file.write(contents)
            temporary_path = Path(temp_file.name)

        # Browser recordings are usually WebM.
        # Convert them to WAV before audio analysis.
        analysis_path = temporary_path
        if extension == ".webm":
            converted_path = convert_to_wav(
                temporary_path
            )
            analysis_path = converted_path

        total_duration = float(
            librosa.get_duration(path=str(analysis_path))
        )
        is_recording = file.filename.startswith("epoch-recording")

        if is_recording and total_duration > MAX_RECORDING_DURATION:
            raise HTTPException(
                status_code=400,
                detail="Recordings must be 90 seconds or shorter."
            )

        if not is_recording and total_duration > MAX_UPLOAD_DURATION:
            raise HTTPException(
                status_code=400,
                detail="Audio must be 5 minutes or shorter."
            )

        analysis = analyze_audio_windows(
            analysis_path,
            total_duration=total_duration
        )

        y, sr = librosa.load(
            str(analysis_path),
            sr=22050,
            mono=True
        )

        waveform = create_waveform(y)

        mel_spectrogram = create_mel_spectrogram(
            y,
            sr
        )

        # -------------------------------------------------
        # Response
        # -------------------------------------------------

        return {
            "filename": file.filename,

            "genre": analysis["genre"],

            "confidence": analysis["confidence"],

            "genre_probabilities": analysis["genre_probabilities"],

            "bpm": round(analysis["bpm"], 2),

            "energy": round(analysis["energy"], 6),

            "duration": round(total_duration, 2),

            "duration_seconds": round(total_duration, 2),

            "segments_analyzed": analysis["segments_analyzed"],

            "sample_rate": sr,

            "waveform": waveform,

            "mel_spectrogram": mel_spectrogram,
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Audio analysis failed: {str(e)}"
        )

    finally:

        if temporary_path and temporary_path.exists():
            temporary_path.unlink()
        if converted_path and converted_path.exists():
            converted_path.unlink()