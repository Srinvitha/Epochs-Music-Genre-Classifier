# Epochs Machine Learning Model

## Pipeline

Epochs compares multiple classical machine-learning classifiers using the extracted audio features.

Candidate models:

- Logistic Regression
- K-Nearest Neighbors
- Support Vector Machine
- Random Forest
- XGBoost as an additional experiment

The selected model is an RBF-kernel Support Vector Machine.

Parameters:

- C = 1
- kernel = rbf
- gamma = scale
- probability = True for probability estimates

The final model is persisted as `models/final_pipeline.joblib`.

## Artist-aware evaluation

Epochs uses artist-grouped cross-validation and an artist-disjoint held-out evaluation. The held-out test set contains 1,512 tracks and has zero artist overlap with the training set.

## Reported performance

Artist-grouped cross-validation macro-F1:

- SVM: 0.4726
- Random Forest: 0.4375
- Logistic Regression: 0.4258
- KNN: 0.3868
- XGBoost experiment: 0.4661

Final artist-disjoint held-out evaluation:

- Accuracy: 0.4716
- Macro precision: 0.4680
- Macro recall: 0.4829
- Macro F1: 0.4697

These values describe the trained classifier's evaluation. They should not be presented as a guarantee of real-world song-level accuracy.
