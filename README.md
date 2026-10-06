# Epochs — Music Genre Classification & Song DNA Analyzer

Solo 4-week ML + FSD case study.

Upload a song → extract audio features → predict genre → calculate BPM/energy → visualize waveform and Mel-spectrogram → display Song DNA.

## Primary dataset
FMA Small: 8,000 30-second tracks across 8 balanced genres.

## Stack
Python, Librosa, NumPy, Pandas, Scikit-learn, Joblib, FastAPI, HTML/CSS/JavaScript + Bootstrap.

## Structure
- data/ — dataset and processed features
- notebooks/ — EDA, feature extraction, model training
- src/ — reusable audio/ML code
- models/ — trained model artifacts
- backend/ — FastAPI API
- frontend/ — Song DNA interface
- results/ — evaluation outputs

## Ask Epochs RAG

The optional Ask Epochs panel retrieves project knowledge and answers questions
using the current Song DNA. It does not change genre predictions.

1. Install the RAG dependencies with `pip install -r requirements-rag.txt`.
2. Copy `.env.example` to `.env` to configure the local Ollama models.
3. Build the local knowledge index with `python -m backend.rag.ingest`.
4. Start the API with `uvicorn backend.main:app --reload`.

The default configuration uses `granite-embedding:30m` for embeddings and
`granite4:micro` for answers. The generated vector index is stored under
`backend/rag/storage/` and is excluded from Git.
