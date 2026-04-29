from __future__ import annotations

import pickle
from functools import lru_cache
from pathlib import Path
from typing import Any

import pandas as pd

from exceptions import CLIError


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
IA_ROOT = PROJECT_ROOT / "IA"

CLIENT_1_DIR = IA_ROOT / "Besoin_Client_1"
CLIENT_2_DIR = IA_ROOT / "Besoin_Client_2"
CLIENT_3_DIR = IA_ROOT / "Besoin_Client_3"


def normalize_client_name(value: Any) -> str:
	client = str(value).strip().lower()
	aliases = {
		"1": "height_classification",
		"client1": "height_classification",
		"besoin_client_1": "height_classification",
		"client_1": "height_classification",
		"height_classification": "height_classification",
		"2": "age_prediction",
		"client2": "age_prediction",
		"besoin_client_2": "age_prediction",
		"client_2": "age_prediction",
		"age_prediction": "age_prediction",
		"3": "storm_prevention",
		"client3": "storm_prevention",
		"besoin_client_3": "storm_prevention",
		"client_3": "storm_prevention",
		"storm_prevention": "storm_prevention",
	}
	return aliases.get(client, client)


def normalize_nomfrancais(value: Any) -> str:
	if pd.isna(value):
		return "UNKNOW"

	text = str(value).strip()
	if text == "Indéterminé":
		text = "UNKNOW"

	cleaned = "".join(char for char in text if not char.islower())
	return cleaned if cleaned else "UNKNOW"


def load_pickle_model(model_path: Path) -> Any:
	if not model_path.exists():
		available_models = sorted(path.name for path in model_path.parent.glob("*.pkl"))
		raise CLIError(f"Model file not found: {model_path}\nAvailable models: {available_models}")

	with open(model_path, "rb") as file_handle:
		return pickle.load(file_handle)


@lru_cache(maxsize=1)
def load_scaler(model_path: Path) -> Any:
	if not model_path.exists():
		raise CLIError(f"Scaler file not found: {model_path}")

	with open(model_path, "rb") as file_handle:
		return pickle.load(file_handle)