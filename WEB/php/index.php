<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/PythonCLI.php';
require_once __DIR__ . '/models/Database.php';
require_once __DIR__ . '/controllers/PredictionController.php';
require_once __DIR__ . '/controllers/ArbreController.php';
require_once __DIR__ . '/controllers/ReferenceController.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);
$path = rtrim($path, '/');

$request_body = file_get_contents('php://input');
$request_json = json_decode($request_body, true);

try {
	$db = new Database();

	if ($path === '/predictions' && $method === 'POST') {
		$controller = new PredictionController($db);
		Response::ok($controller->predict($request_json));
	} elseif ($path === '/especes' && $method === 'GET') {
		$controller = new ReferenceController($db);
		Response::ok($controller->listEspeces());
	} elseif (preg_match('#^/especes/(\d+)$#', $path, $matches) && $method === 'GET') {
		$controller = new ReferenceController($db);
		Response::ok($controller->getEspece((int) $matches[1]));
	} elseif ($path === '/etats' && $method === 'GET') {
		$controller = new ReferenceController($db);
		Response::ok($controller->listEtats());
	} elseif ($path === '/stades-developpement' && $method === 'GET') {
		$controller = new ReferenceController($db);
		Response::ok($controller->listStadesDeveloppement());
	} elseif ($path === '/types-port' && $method === 'GET') {
		$controller = new ReferenceController($db);
		Response::ok($controller->listTypesPort());
	} elseif ($path === '/types-pied' && $method === 'GET') {
		$controller = new ReferenceController($db);
		Response::ok($controller->listTypesPied());
	} elseif ($path === '/arbres' && $method === 'GET') {
		$controller = new ArbreController($db);
		Response::ok($controller->listArbres());
	} elseif ($path === '/arbres' && $method === 'POST') {
		$controller = new ArbreController($db);
		Response::created($controller->createArbre($request_json));
	} elseif (preg_match('#^/arbres/(\d+)$#', $path, $matches) && $method === 'GET') {
		$controller = new ArbreController($db);
		Response::ok($controller->getArbre((int) $matches[1]));
	} elseif (preg_match('#^/arbres/(\d+)$#', $path, $matches) && $method === 'PATCH') {
		$controller = new ArbreController($db);
		Response::ok($controller->updateArbre((int) $matches[1], $request_json));
	} elseif (preg_match('#^/arbres/(\d+)$#', $path, $matches) && $method === 'DELETE') {
		$controller = new ArbreController($db);
		$controller->deleteArbre((int) $matches[1]);
		Response::noContent();
	} else {
		Response::notFound('Endpoint not found');
	}
} catch (PDOException $e) {
	Response::error(500, 'DatabaseError', 'Database connection failed: ' . $e->getMessage());
} catch (Exception $e) {
	Response::error(500, 'InternalError', $e->getMessage());
}
