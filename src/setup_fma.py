"""
FMA dataset setup and verification.

Extracts the FMA Small audio archive and FMA metadata archive,
then verifies that the expected files/folders exist.
"""

from pathlib import Path
import zipfile


# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"
EXTRACTED_DIR = PROJECT_ROOT / "data" / "extracted"

AUDIO_ZIP = RAW_DIR / "fma_small.zip"
METADATA_ZIP = RAW_DIR / "fma_metadata.zip"


def extract_zip(zip_path: Path, destination: Path) -> None:
    """Extract a ZIP archive into the destination directory."""

    print(f"\nExtracting: {zip_path.name}")
    print(f"Destination: {destination}")

    destination.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(zip_path, "r") as archive:
        bad_file = archive.testzip()

        if bad_file is not None:
            raise RuntimeError(
                f"Corrupted file found inside {zip_path.name}: {bad_file}"
            )

        archive.extractall(destination)

    print(f"Finished: {zip_path.name}")


def verify_dataset() -> None:
    """Verify the expected FMA dataset structure."""

    print("\n--- Dataset Verification ---")

    metadata_dir = EXTRACTED_DIR / "fma_metadata"
    audio_dir = EXTRACTED_DIR / "fma_small"

    tracks_csv = metadata_dir / "tracks.csv"
    genres_csv = metadata_dir / "genres.csv"

    checks = {
        "Metadata directory": metadata_dir,
        "Audio directory": audio_dir,
        "tracks.csv": tracks_csv,
        "genres.csv": genres_csv,
    }

    all_ok = True

    for name, path in checks.items():
        exists = path.exists()
        status = "OK" if exists else "MISSING"

        print(f"{status:>8}  {name}: {path}")

        if not exists:
            all_ok = False

    if all_ok:
        print("\nFMA dataset structure looks good.")
    else:
        raise RuntimeError(
            "\nDataset verification failed. "
            "Check the extracted folder structure."
        )


def main() -> None:
    """Run the complete dataset setup."""

    print("=== Epochs — FMA Dataset Setup ===")

    if not AUDIO_ZIP.exists():
        raise FileNotFoundError(f"Missing: {AUDIO_ZIP}")

    if not METADATA_ZIP.exists():
        raise FileNotFoundError(f"Missing: {METADATA_ZIP}")

    extract_zip(
        METADATA_ZIP,
        EXTRACTED_DIR,
    )

    extract_zip(
        AUDIO_ZIP,
        EXTRACTED_DIR,
    )

    verify_dataset()

    print("\nDataset setup completed successfully.")


if __name__ == "__main__":
    main()