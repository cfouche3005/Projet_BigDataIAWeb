from __future__ import annotations

from functools import lru_cache
from typing import Any

import joblib
import pandas as pd

from common import CLIENT_1_DIR
from exceptions import CLIError


@lru_cache(maxsize=1)
def load_client_1_models() -> dict[str, Any]:
	return {
		"k2": {
			"kmeans": joblib.load(CLIENT_1_DIR / "models" / "kmeans_model.pkl"),
			"scaler": joblib.load(CLIENT_1_DIR / "encoders" / "scaler.pkl"),
			"pca": joblib.load(CLIENT_1_DIR / "models" / "pca.pkl"),
		},
		"k3": {
			"kmeans": joblib.load(CLIENT_1_DIR / "models" / "kmeans_model_k3.pkl"),
			"scaler": joblib.load(CLIENT_1_DIR / "encoders" / "scaler_k3.pkl"),
			"pca": joblib.load(CLIENT_1_DIR / "models" / "pca_k3.pkl"),
		},
	}


def predict_client_1(payload: dict[str, Any]) -> dict[str, Any]:
	if "num_clusters" not in payload:
		raise CLIError("Missing required field for height_classification: num_clusters")

	required_fields = ["haut_tot", "tronc_diam", "age_estim", "fk_stadedev_encoded"]
	missing_fields = [field for field in required_fields if field not in payload]
	if missing_fields:
		raise CLIError(f"Missing required field(s) for height_classification: {', '.join(missing_fields)}")

	num_clusters = int(payload["num_clusters"])
	if num_clusters not in {2, 3}:
		raise CLIError("height_classification expects num_clusters to be 2 or 3")

	models = load_client_1_models()[f"k{num_clusters}"]
	feature_frame = pd.DataFrame(
		[
			{
				"haut_tot": float(payload["haut_tot"]),
				"tronc_diam": float(payload["tronc_diam"]),
				"age_estim": float(payload["age_estim"]),
				"fk_stadedev_encoded": float(payload["fk_stadedev_encoded"]),
			}
		]
	)

	scaled_features = models["scaler"].transform(feature_frame)
	pca_features = models["pca"].transform(scaled_features)
	cluster = int(models["kmeans"].predict(pca_features)[0])

	cluster_labels = {
		2: {0: "Grand", 1: "Petit"},
		3: {0: "Petit", 1: "Grand", 2: "Moyen"},
	}

	return {
		"cluster": cluster,
		"cluster_label": cluster_labels[num_clusters].get(cluster, "Inconnu"),
		"num_clusters": num_clusters,
	}