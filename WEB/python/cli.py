from __future__ import annotations

import argparse
import json
import sys
from typing import Any

from height_classification import predict_client_1
from age_prediction import predict_client_2
from storm_prevention import predict_client_3
from common import normalize_client_name
from exceptions import CLIError


def extract_payload(args: argparse.Namespace) -> dict[str, Any]:
	for candidate in (args.json, args.payload):
		if candidate:
			return json.loads(candidate)

	if not sys.stdin.isatty():
		raw_payload = sys.stdin.read().strip()
		if raw_payload:
			return json.loads(raw_payload)

	raise CLIError("A JSON payload is required through --json, a positional argument, or stdin")


def infer_client_name(payload: dict[str, Any]) -> str:
	if "client" in payload or "model" in payload or "target" in payload:
		return normalize_client_name(payload.get("client") or payload.get("target") or payload.get("model"))

	if "num_clusters" in payload:
		return "height_classification"

	if "clc_nbr_diag" in payload:
		return "storm_prevention"

	if {"haut_tronc", "haut_tot", "tronc_diam"}.issubset(payload):
		return "age_prediction"

	raise CLIError(
		"Unable to infer the target model. Add a client field with height_classification, age_prediction, or storm_prevention."
	)


def build_response(payload: dict[str, Any]) -> dict[str, Any]:
	client_name = infer_client_name(payload)
	if client_name == "height_classification":
		result = predict_client_1(payload)
	elif client_name == "age_prediction":
		result = predict_client_2(payload)
	elif client_name == "storm_prevention":
		result = predict_client_3(payload)
	else:
		raise CLIError(
			"Unknown model. Use height_classification, age_prediction, or storm_prevention in the client/model field."
		)

	return {
		"ok": True,
		"client": client_name,
		"input": payload,
		"result": result,
	}


def main() -> int:
	parser = argparse.ArgumentParser(description="JSON CLI wrapper for the tree models.")
	parser.add_argument("payload", nargs="?", help="JSON payload as a positional argument.")
	parser.add_argument("--json", dest="json", help="JSON payload as a command-line argument.")
	parser.add_argument("--pretty", action="store_true", help="Pretty-print the JSON response.")
	args = parser.parse_args()

	try:
		payload = extract_payload(args)
		response = build_response(payload)
	except json.JSONDecodeError as error:
		response = {"ok": False, "error": {"type": "JSONDecodeError", "message": str(error)}}
		print(json.dumps(response, ensure_ascii=True, indent=2 if args.pretty else None))
		return 1
	except CLIError as error:
		response = {"ok": False, "error": {"type": "CLIError", "message": str(error)}}
		print(json.dumps(response, ensure_ascii=True, indent=2 if args.pretty else None))
		return 1
	except Exception as error:
		response = {"ok": False, "error": {"type": type(error).__name__, "message": str(error)}}
		print(json.dumps(response, ensure_ascii=True, indent=2 if args.pretty else None))
		return 1

	print(json.dumps(response, ensure_ascii=True, indent=2 if args.pretty else None))
	return 0