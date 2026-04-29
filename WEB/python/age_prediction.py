from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
from sklearn.pipeline import Pipeline

from common import CLIENT_2_DIR, load_pickle_model, load_scaler, normalize_nomfrancais
from exceptions import CLIError


def resolve_client_2_model_path(model_name: str, use_gridsearch: bool, species: str | None) -> Path:
	if species:
		prefix = "nomfrancais_gridsearch" if use_gridsearch else "nomfrancais_baseline"
	else:
		prefix = "gridsearch" if use_gridsearch else "regression"

	return CLIENT_2_DIR / "models" / f"{prefix}_{model_name}.pkl"


def build_client_2_input_frame(haut_tronc: float, haut_tot: float, tronc_diam: float, species: str | None) -> pd.DataFrame:
	row = {
		"haut_tronc": haut_tronc,
		"haut_tot": haut_tot,
		"tronc_diam": tronc_diam,
	}

	if species is not None:
		row["nomfrancais"] = normalize_nomfrancais(species)

	return pd.DataFrame([row])


def predict_client_2(payload: dict[str, Any]) -> dict[str, Any]:
	required_fields = ["haut_tronc", "haut_tot", "tronc_diam"]
	missing_fields = [field for field in required_fields if field not in payload]
	if missing_fields:
		raise CLIError(f"Missing required field(s) for age_prediction: {', '.join(missing_fields)}")

	model_name = str(payload.get("model", "RandomForestRegressor"))
	use_gridsearch = bool(payload.get("gridsearch", False))
	species = payload.get("species")
	model_path = resolve_client_2_model_path(model_name, use_gridsearch, species)
	model = load_pickle_model(model_path)
	input_frame = build_client_2_input_frame(
		haut_tronc=float(payload["haut_tronc"]),
		haut_tot=float(payload["haut_tot"]),
		tronc_diam=float(payload["tronc_diam"]),
		species=species,
	)

	if isinstance(model, Pipeline):
		predicted_age = float(model.predict(input_frame)[0])
	else:
		if species is not None:
			raise CLIError(
				"The selected nomfrancais model is not a pipeline. Re-train the models or use a saved pipeline file."
			)

		scaler_path = CLIENT_2_DIR / "encoders" / "scaler.pkl"
		scaler = load_scaler(scaler_path)
		x_scaled = scaler.transform(input_frame[["haut_tronc", "haut_tot", "tronc_diam"]])
		predicted_age = float(model.predict(x_scaled)[0])

	result = {
		"predicted_age": round(predicted_age, 2),
		"model_file": model_path.name,
		"model_name": model_name,
		"gridsearch": use_gridsearch,
	}
	if species is not None:
		result["species"] = normalize_nomfrancais(species)

	return result