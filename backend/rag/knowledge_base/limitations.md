# Epochs Limitations and Responsible Interpretation

Epochs is an audio classification and analysis system, not an objective judge of musical identity.

Important limitations:

1. The model uses 61 handcrafted aggregate features rather than learned spectrogram representations.
2. Music genres overlap substantially in real-world recordings.
3. Pop is particularly difficult for the current model in the held-out evaluation.
4. BPM and energy are measurements, not explanations of emotion.
5. A high classifier probability is model confidence, not proof that the predicted genre is objectively correct.
6. RAG explanations must not invent audio characteristics that were not returned by the analyzer.
7. RAG retrieves project/domain knowledge; it does not replace the trained genre classifier.
