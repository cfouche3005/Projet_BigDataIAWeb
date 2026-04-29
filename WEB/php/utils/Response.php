<?php

class Response {
	public static function ok($data = null) {
		http_response_code(200);
		echo json_encode($data ?? ['ok' => true], JSON_UNESCAPED_UNICODE);
		exit;
	}

	public static function created($data = null) {
		http_response_code(201);
		echo json_encode($data ?? ['ok' => true], JSON_UNESCAPED_UNICODE);
		exit;
	}

	public static function noContent() {
		http_response_code(204);
		exit;
	}

	public static function notFound($message = 'Not found') {
		http_response_code(404);
		echo json_encode(['ok' => false, 'error' => ['type' => 'NotFound', 'message' => $message]], JSON_UNESCAPED_UNICODE);
		exit;
	}

	public static function error($code = 500, $type = 'Error', $message = 'An error occurred') {
		http_response_code($code);
		echo json_encode(['ok' => false, 'error' => ['type' => $type, 'message' => $message]], JSON_UNESCAPED_UNICODE);
		exit;
	}

	public static function badRequest($message = 'Bad request') {
		self::error(400, 'BadRequest', $message);
	}
}
