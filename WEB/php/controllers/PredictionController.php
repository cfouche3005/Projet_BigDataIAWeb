<?php

class PredictionController {
	private $db;

	public function __construct($db) {
		$this->db = $db;
	}

	public function predict($payload) {
		if (empty($payload)) {
			Response::badRequest('Request body is empty');
		}

		if (!isset($payload['model']) && !isset($payload['client'])) {
			Response::badRequest('Missing required field: model or client');
		}

		try {
			$response = PythonCLI::predict($payload);
			return $response;
		} catch (Exception $e) {
			Response::error(500, 'PredictionError', $e->getMessage());
		}
	}
}
