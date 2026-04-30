<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/PythonCLI.php';
require_once __DIR__ . '/models/Database.php';
require_once __DIR__ . '/controllers/PredictionController.php';
require_once __DIR__ . '/controllers/ArbreController.php';
require_once __DIR__ . '/controllers/ReferenceController.php';

// Simple file logger for API requests/responses
function api_log($level, $message, $context = []) {
	$logFile = defined('API_LOG') ? API_LOG : (defined('ERROR_LOG') ? ERROR_LOG : __DIR__ . '/../logs/api.log');
	$entry = [
		'ts' => date('c'),
		'level' => $level,
		'message' => $message,
		'context' => $context,
	];
	@file_put_contents($logFile, json_encode($entry, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

// Log the incoming request
api_log('info', 'incoming_request', ['method' => $_SERVER['REQUEST_METHOD'], 'uri' => $_SERVER['REQUEST_URI'], 'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? null, 'body' => $request_body]);

$method = $_SERVER['REQUEST_METHOD'];

// Support PATH_INFO when calling the router directly (e.g. /php/api.php/arbres)
if (!empty($_SERVER['PATH_INFO'])) {
	$path = $_SERVER['PATH_INFO'];
} else {
	$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
	// legacy: strip leading /api when using rewrite
	$path = preg_replace('#^/api#', '', $path);
}

$path = rtrim($path, '/');

$request_body = file_get_contents('php://input');
$request_json = json_decode($request_body, true);

try {
	$db = new Database();

	if ($path === '/predictions' && $method === 'POST') {
		$controller = new PredictionController($db);
		$result = $controller->predict($request_json);
		api_log('info', 'prediction', ['input' => $request_json, 'result' => $result]);
		Response::ok($result);
	} elseif ($path === '/especes' && $method === 'GET') {
		$controller = new ReferenceController($db);
		$result = $controller->listEspeces();
		api_log('info', 'list_especes', ['result_count' => count($result)]);
		Response::ok($result);
	} elseif (preg_match('#^/especes/(\d+)$#', $path, $matches) && $method === 'GET') {
		$controller = new ReferenceController($db);
		$result = $controller->getEspece((int) $matches[1]);
		api_log('info', 'get_espece', ['id' => (int)$matches[1], 'found' => (bool)$result]);
		Response::ok($result);
	} elseif ($path === '/etats' && $method === 'GET') {
		$controller = new ReferenceController($db);
		$result = $controller->listEtats();
		api_log('info', 'list_etats', ['result_count' => count($result)]);
		Response::ok($result);
	} elseif ($path === '/stades-developpement' && $method === 'GET') {
		$controller = new ReferenceController($db);
		$result = $controller->listStadesDeveloppement();
		api_log('info', 'list_stades', ['result_count' => count($result)]);
		Response::ok($result);
	} elseif ($path === '/types-port' && $method === 'GET') {
		$controller = new ReferenceController($db);
		$result = $controller->listTypesPort();
		api_log('info', 'list_types_port', ['result_count' => count($result)]);
		Response::ok($result);
	} elseif ($path === '/types-pied' && $method === 'GET') {
		$controller = new ReferenceController($db);
		$result = $controller->listTypesPied();
		api_log('info', 'list_types_pied', ['result_count' => count($result)]);
		Response::ok($result);
	} elseif ($path === '/arbres' && $method === 'GET') {
		$controller = new ArbreController($db);
		$result = $controller->listArbres();
		api_log('info', 'list_arbres', ['result_count' => count($result)]);
		Response::ok($result);
	} elseif ($path === '/arbres' && $method === 'POST') {
		$controller = new ArbreController($db);
		$result = $controller->createArbre($request_json);
		api_log('info', 'create_arbre', ['input' => $request_json, 'created_id' => $result['id_arbre'] ?? null]);
		Response::created($result);
	} elseif (preg_match('#^/arbres/(\d+)$#', $path, $matches) && $method === 'GET') {
		$controller = new ArbreController($db);
		$result = $controller->getArbre((int) $matches[1]);
		api_log('info', 'get_arbre', ['id' => (int)$matches[1], 'found' => (bool)$result]);
		Response::ok($result);
	} elseif (preg_match('#^/arbres/(\d+)$#', $path, $matches) && $method === 'PATCH') {
		$controller = new ArbreController($db);
		$result = $controller->updateArbre((int) $matches[1], $request_json);
		api_log('info', 'update_arbre', ['id' => (int)$matches[1], 'input' => $request_json]);
		Response::ok($result);
	} elseif (preg_match('#^/arbres/(\d+)$#', $path, $matches) && $method === 'DELETE') {
		$controller = new ArbreController($db);
		$controller->deleteArbre((int) $matches[1]);
		api_log('info', 'delete_arbre', ['id' => (int)$matches[1]]);
		Response::noContent();
	} else {
		api_log('warning', 'not_found', ['path' => $path, 'method' => $method]);
		Response::notFound('Endpoint not found');
	}
} catch (PDOException $e) {
	api_log('error', 'pdo_exception', ['message' => $e->getMessage()]);
	Response::error(500, 'DatabaseError', 'Database connection failed: ' . $e->getMessage());
} catch (Exception $e) {
	api_log('error', 'exception', ['message' => $e->getMessage()]);
	Response::error(500, 'InternalError', $e->getMessage());
}
