from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import torch
from torch import nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from torchvision import transforms, models

from model import CLASS_NAMES, create_model, get_device


BASE_DIR = Path(__file__).resolve().parent
RESNET_MODEL_PATH = BASE_DIR / "models" / "resnet18_four_class_finetuned_best.pth"
VIT_MODEL_PATH = BASE_DIR / "models" / "vit_b16_alzheimer_v2_best.pth"

MAX_UPLOAD_BYTES = 10 * 1024 * 1024

DEVICE = get_device()
MODEL = None
MODEL_ERROR = None
ACTIVE_ARCHITECTURE = "Unavailable"

# Keep CPU usage reasonable on a laptop.
torch.set_num_threads(min(4, max(1, torch.get_num_threads())))

# Match the preprocessing used to train ViT-B/16 V2.
PREPROCESS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])



def load_trained_model():
    """Load ViT-B/16 V2 first, with ResNet18 as a fallback."""
    global MODEL, MODEL_ERROR, ACTIVE_ARCHITECTURE

    errors = []

    # Primary model: ViT-B/16 V2.
    if VIT_MODEL_PATH.is_file():
        try:
            checkpoint = torch.load(
                VIT_MODEL_PATH,
                map_location="cpu",
                weights_only=True,
            )

            if checkpoint.get("class_names") != CLASS_NAMES:
                raise ValueError("ViT checkpoint class names do not match model.py.")

            if checkpoint.get("architecture") != "vit_b_16":
                raise ValueError("Unexpected ViT checkpoint architecture.")

            if checkpoint.get("image_size") != 224:
                raise ValueError("Unexpected ViT checkpoint image size.")

            model = models.vit_b_16(weights=None)
            model.heads.head = nn.Linear(
                model.heads.head.in_features,
                len(CLASS_NAMES),
            )
            model.load_state_dict(checkpoint["model_state_dict"], strict=True)
            model.to(DEVICE)
            model.eval()

            MODEL = model
            ACTIVE_ARCHITECTURE = "ViT-B/16 V2"
            MODEL_ERROR = None

            print(f"{ACTIVE_ARCHITECTURE} loaded successfully on {DEVICE}.")
            print(f"Classes: {CLASS_NAMES}")
            del checkpoint
            return

        except Exception as exc:
            errors.append(f"ViT loading failed: {exc}")
            print(errors[-1])

    else:
        errors.append(f"ViT checkpoint not found: {VIT_MODEL_PATH}")

    # Fallback model: the existing ResNet18 checkpoint.
    if RESNET_MODEL_PATH.is_file():
        try:
            checkpoint = torch.load(
                RESNET_MODEL_PATH,
                map_location="cpu",
                weights_only=True,
            )

            if checkpoint.get("class_names") != CLASS_NAMES:
                raise ValueError("ResNet checkpoint class names do not match model.py.")

            model = create_model(pretrained=False)
            model.load_state_dict(checkpoint["model_state_dict"], strict=True)
            model.to(DEVICE)
            model.eval()

            MODEL = model
            ACTIVE_ARCHITECTURE = "ResNet18"
            MODEL_ERROR = None

            print(f"Fallback {ACTIVE_ARCHITECTURE} loaded on {DEVICE}.")
            print(f"Classes: {CLASS_NAMES}")
            del checkpoint
            return

        except Exception as exc:
            errors.append(f"ResNet18 loading failed: {exc}")
            print(errors[-1])

    else:
        errors.append(f"ResNet checkpoint not found: {RESNET_MODEL_PATH}")

    MODEL = None
    ACTIVE_ARCHITECTURE = "Unavailable"
    MODEL_ERROR = "; ".join(errors)
    print(f"No model could be loaded: {MODEL_ERROR}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_trained_model()
    yield


app = FastAPI(
    title="AlzheimerInsight API",
    description=(
        "Research API for four-class 2D image classification. "
        "This model is experimental and is not a clinical diagnostic system."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "application": "AlzheimerInsight API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy" if MODEL is not None else "model_unavailable",
        "model_loaded": MODEL is not None,
        "device": str(DEVICE),
        "architecture": ACTIVE_ARCHITECTURE,
        "class_names": CLASS_NAMES,
        "input_type": "2D JPG or PNG image",
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Classify one JPG or PNG image using the trained four-class model.

    Returned probabilities are model scores, not calibrated clinical
    probabilities or a measure of diagnostic certainty.
    """
    if MODEL is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "The trained model is unavailable. "
                "Check the model checkpoint and backend logs."
            ),
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A filename is required.",
        )

    suffix = Path(file.filename).suffix.lower()

    if suffix not in {".jpg", ".jpeg", ".png"}:
        raise HTTPException(
            status_code=415,
            detail="This 2D classifier accepts JPG, JPEG, and PNG files only.",
        )

    try:
        content = await file.read(MAX_UPLOAD_BYTES + 1)
    finally:
        await file.close()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image exceeds the 10 MB upload limit.",
        )

    try:
        with Image.open(BytesIO(content)) as source:
            if source.format not in {"JPEG", "PNG"}:
                raise HTTPException(
                    status_code=415,
                    detail="The file content must be a JPG or PNG image.",
                )

            image = source.convert("RGB")

    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a readable image.",
        )

    image_tensor = PREPROCESS(image).unsqueeze(0).to(DEVICE)

    try:
        with torch.inference_mode():
            logits = MODEL(image_tensor)
            probabilities = torch.softmax(logits, dim=1)[0].cpu().tolist()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Model inference failed. Check the backend logs.",
        )

    scores = {
        name: round(float(score), 6)
        for name, score in zip(CLASS_NAMES, probabilities)
    }

    predicted_class = max(scores, key=scores.get)

    return {
        "predicted_class": predicted_class,
        "scores": scores,
        "model": ACTIVE_ARCHITECTURE,
        "input_filename": Path(file.filename).name,
        "research_notice": (
            "Experimental image classification only. "
            "Scores are not clinical diagnostic probabilities. "
            "Do not use this output as a medical diagnosis."
        ),
    }
from typing import List

from fastapi import HTTPException, UploadFile, File
from io import BytesIO
from pathlib import Path
from PIL import Image, UnidentifiedImageError
import torch


@app.post("/predict/batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    """
    Batch inference endpoint for research images.

    Limits each request to 16 images and 10 MB per image to avoid
    excessive CPU and memory usage on a laptop.
    """
    if MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="The trained model is unavailable.",
        )

    if not files:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least one image.",
        )

    if len(files) > 16:
        raise HTTPException(
            status_code=400,
            detail="A maximum of 16 images is allowed per request.",
        )

    images = []
    filenames = []

    try:
        for file in files:
            if not file.filename:
                raise HTTPException(
                    status_code=400,
                    detail="Every uploaded image must have a filename.",
                )

            suffix = Path(file.filename).suffix.lower()

            if suffix not in {".jpg", ".jpeg", ".png"}:
                raise HTTPException(
                    status_code=415,
                    detail=f"Unsupported image type: {file.filename}",
                )

            content = await file.read(MAX_UPLOAD_BYTES + 1)

            if not content:
                raise HTTPException(
                    status_code=400,
                    detail=f"Empty image: {file.filename}",
                )

            if len(content) > MAX_UPLOAD_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"Image exceeds the 10 MB limit: {file.filename}",
                )

            try:
                with Image.open(BytesIO(content)) as source:
                    if source.format not in {"JPEG", "PNG"}:
                        raise HTTPException(
                            status_code=415,
                            detail=f"Invalid image content: {file.filename}",
                        )

                    images.append(PREPROCESS(source.convert("RGB")))
                    filenames.append(Path(file.filename).name)

            except HTTPException:
                raise
            except (UnidentifiedImageError, OSError, ValueError):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unreadable image: {file.filename}",
                )

        batch_tensor = torch.stack(images).to(DEVICE)

        try:
            with torch.inference_mode():
                logits = MODEL(batch_tensor)
                probabilities = torch.softmax(logits, dim=1).cpu()

        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Batch inference failed. Check the backend logs.",
            )

        results = []

        for filename, scores_tensor in zip(filenames, probabilities):
            scores = {
                name: round(float(score), 6)
                for name, score in zip(CLASS_NAMES, scores_tensor.tolist())
            }

            results.append({
                "filename": filename,
                "predicted_class": max(scores, key=scores.get),
                "scores": scores,
            })

        return {
            "model": ACTIVE_ARCHITECTURE,
            "processed": len(results),
            "results": results,
            "research_notice": (
                "Experimental image classification only. "
                "Scores are not calibrated clinical probabilities."
            ),
        }

    finally:
        for file in files:
            await file.close()

from pathlib import Path

from collections import Counter
from pathlib import Path

from fastapi import HTTPException

DATASET_DIR = BASE_DIR / "data" / "Dataset"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}


def get_dataset_paths():
    if not DATASET_DIR.is_dir():
        raise HTTPException(status_code=404, detail="Dataset directory not found.")

    categories = {}

    for folder in sorted(DATASET_DIR.iterdir()):
        if folder.is_dir():
            categories[folder.name] = sorted(
                [
                    path for path in folder.rglob("*")
                    if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
                ],
                key=lambda path: str(path).lower(),
            )

    return categories


@app.get("/dataset/images")
def list_dataset_images():
    categories = get_dataset_paths()

    return {
        "total": sum(len(paths) for paths in categories.values()),
        "categories": {
            name: len(paths) for name, paths in categories.items()
        },
    }


@app.post("/dataset/analyze")
def analyze_dataset(limit: int = 32):
    if MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="The trained model is unavailable.",
        )

    if limit < 1 or limit > 6400:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 6400.",
        )

    categories = get_dataset_paths()
    all_paths = [
        (category, path)
        for category, paths in categories.items()
        for path in paths
    ]

    if not all_paths:
        raise HTTPException(status_code=404, detail="No images were found.")

    # Balanced sampling: take approximately equal numbers from each
    # category, rather than always selecting Mild_Demented first.
    selected = []
    names = sorted(categories.keys())
    per_category = limit // max(1, len(names))
    remainder = limit % max(1, len(names))

    for index, name in enumerate(names):
        count = per_category + (1 if index < remainder else 0)
        selected.extend((name, path) for path in categories[name][:count])

    # If any category is smaller than its requested share, fill from
    # remaining images in the other categories.
    selected_paths = {path for _, path in selected}
    if len(selected) < min(limit, len(all_paths)):
        for category, path in all_paths:
            if path not in selected_paths:
                selected.append((category, path))
                selected_paths.add(path)
                if len(selected) >= min(limit, len(all_paths)):
                    break

    results = []

    for start in range(0, len(selected), 16):
        batch = selected[start:start + 16]
        tensors = []
        valid_items = []

        for actual_class, path in batch:
            try:
                with Image.open(path) as source:
                    tensors.append(PREPROCESS(source.convert("RGB")))
                    valid_items.append((actual_class, path))
            except (UnidentifiedImageError, OSError, ValueError):
                continue

        if not tensors:
            continue

        with torch.inference_mode():
            probabilities = torch.softmax(
                MODEL(torch.stack(tensors).to(DEVICE)), dim=1
            ).cpu()

        for (actual_class, path), row in zip(valid_items, probabilities):
            scores = {
                name: round(float(score), 6)
                for name, score in zip(CLASS_NAMES, row.tolist())
            }

            results.append({
                "filename": path.name,
                "relative_path": path.relative_to(DATASET_DIR).as_posix(),
                "actual_class": actual_class,
                "predicted_class": max(scores, key=scores.get),
                "scores": scores,
            })

    predicted_counts = Counter(
        item["predicted_class"] for item in results
    )
    actual_counts = Counter(
        item["actual_class"] for item in results
    )

    correct = sum(
        item["actual_class"] == item["predicted_class"]
        for item in results
    )

    return {
        "requested": limit,
        "processed": len(results),
        "model": ACTIVE_ARCHITECTURE,
        "actual_counts": dict(actual_counts),
        "predicted_counts": dict(predicted_counts),
        "accuracy_on_selected_folder_labels": (
            round(correct / len(results), 4) if results else None
        ),
        "results": results,
        "research_notice": (
            "Experimental image classification only. "
            "Folder labels are reference labels, not clinical diagnoses."
        ),
    }

