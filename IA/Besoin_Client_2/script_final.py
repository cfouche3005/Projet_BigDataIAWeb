from __future__ import annotations

import argparse
import pickle
from pathlib import Path

import pandas as pd
from sklearn.pipeline import Pipeline


BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
SCALER_PATH = BASE_DIR / "encoders" / "scaler.pkl"
NUMERIC_COLS = ["haut_tronc", "haut_tot", "tronc_diam"]


def normalize_nomfrancais(value: object) -> str:
	if pd.isna(value):
		return "UNKNOW"

	text = str(value).strip()
	if text == "Indéterminé":
		text = "UNKNOW"

	cleaned = "".join(char for char in text if not char.islower())
	return cleaned if cleaned else "UNKNOW"


def resolve_model_path(model_name: str, use_gridsearch: bool, species: str | None) -> Path:
	if species:
		prefix = "nomfrancais_gridsearch" if use_gridsearch else "nomfrancais_baseline"
	else:
		prefix = "gridsearch" if use_gridsearch else "regression"

	return MODELS_DIR / f"{prefix}_{model_name}.pkl"


def build_input_frame(haut_tronc: float, haut_tot: float, tronc_diam: float, species: str | None) -> pd.DataFrame:
	row = {
		"haut_tronc": haut_tronc,
		"haut_tot": haut_tot,
		"tronc_diam": tronc_diam,
	}

	if species is not None:
		row["nomfrancais"] = normalize_nomfrancais(species)

	return pd.DataFrame([row])


def load_scaler() -> object:
	if not SCALER_PATH.exists():
		raise FileNotFoundError(f"Scaler file not found: {SCALER_PATH}")

	with open(SCALER_PATH, "rb") as file_handle:
		return pickle.load(file_handle)


def predict_age(model: object, input_frame: pd.DataFrame, species: str | None) -> float:
	if isinstance(model, Pipeline):
		return float(model.predict(input_frame)[0])

	if species is not None:
		raise ValueError(
			"The selected nomfrancais model is not a pipeline. Re-train the models or use a saved pipeline file."
		)

	scaler = load_scaler()
	x_scaled = scaler.transform(input_frame[NUMERIC_COLS])
	return float(model.predict(x_scaled)[0])


def main() -> None:
	parser = argparse.ArgumentParser(description="Predict tree age from a trained model.")
	parser.add_argument("--haut-tronc", type=float, required=True, help="Value for haut_tronc.")
	parser.add_argument("--haut-tot", type=float, required=True, help="Value for haut_tot.")
	parser.add_argument("--tronc-diam", type=float, required=True, help="Value for tronc_diam.")
	parser.add_argument(
		"--model",
		default="RandomForestRegressor",
		choices=["RandomForestRegressor", "MLPRegressor"],
		help="Model to use.",
	)
	parser.add_argument(
		"--gridsearch",
		action="store_true",
		help="Use the GridSearchCV-trained model instead of the baseline one.",
	)
	parser.add_argument(
		"--species",
		default=None,
		help="Optional species name. If provided, the nomfrancais models are used.",
	)
	args = parser.parse_args()

	model_path = resolve_model_path(args.model, args.gridsearch, args.species)
	if not model_path.exists():
		available_models = sorted(path.name for path in MODELS_DIR.glob("*.pkl"))
		raise FileNotFoundError(
			f"Model file not found: {model_path}\nAvailable models: {available_models}"
		)

	with open(model_path, "rb") as file_handle:
		model = pickle.load(file_handle)

	input_frame = build_input_frame(
		haut_tronc=args.haut_tronc,
		haut_tot=args.haut_tot,
		tronc_diam=args.tronc_diam,
		species=args.species,
	)

	predicted_age = predict_age(model, input_frame, args.species)

	print(f"Loaded model: {model_path.name}")
	if args.species is not None:
		print(f"Species: {normalize_nomfrancais(args.species)}")
	print(f"Predicted age: {predicted_age:.2f}")


if __name__ == "__main__":
	main()
