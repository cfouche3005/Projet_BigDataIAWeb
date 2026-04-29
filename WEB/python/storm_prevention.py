from __future__ import annotations

from functools import lru_cache
from typing import Any

import joblib
import numpy as np
import pandas as pd

from common import CLIENT_3_DIR
from exceptions import CLIError


@lru_cache(maxsize=1)
def load_client_3_models() -> dict[str, Any]:
	return {
		"preprocessor": joblib.load(CLIENT_3_DIR / "models" / "preprocessor_tempete.pkl"),
		"model": joblib.load(CLIENT_3_DIR / "models" / "modele_tempete.pkl"),
	}


def predict_client_3(payload: dict[str, Any]) -> dict[str, Any]:
	required_fields = ["haut_tronc", "haut_tot", "tronc_diam", "clc_nbr_diag"]
	missing_fields = [field for field in required_fields if field not in payload]
	if missing_fields:
		raise CLIError(f"Missing required field(s) for storm_prevention: {', '.join(missing_fields)}")

	models = load_client_3_models()
	input_frame = pd.DataFrame(
		{
			"haut_tronc": [float(payload["haut_tronc"])],
			"haut_tot": [float(payload["haut_tot"])],
			"tronc_diam": [float(payload["tronc_diam"])],
			"clc_nbr_diag": [float(payload["clc_nbr_diag"])],
		}
	)

	transformed_data = models["preprocessor"].transform(input_frame)
	prediction = models["model"].predict(transformed_data)[0]
	probabilities = models["model"].predict_proba(transformed_data)[0]
	index_classe = np.where(models["model"].classes_ == prediction)[0][0]
	confidence = float(probabilities[index_classe] * 100)

	return {
		"prediction": str(prediction).upper(),
		"raw_prediction": str(prediction),
		"confidence_percent": round(confidence, 2),
	}