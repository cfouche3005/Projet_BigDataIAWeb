<?php
/**
 * api.php
 * Point d'entrée unique pour toutes les requêtes AJAX (front-end → back-end)
 * 
 * Routes :
 *  GET  api.php?action=get_arbres          → liste tous les arbres
 *  GET  api.php?action=get_options         → listes déroulantes (espèces, états, etc.)
 *  POST api.php?action=add_arbre           → ajoute un arbre
 *  POST api.php?action=predict_age         → prédit l'âge d'un arbre via Python
 *  POST api.php?action=predict_clusters    → prédit les clusters de tous les arbres
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/php/db.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

    // ── Liste des arbres ────────────────────────────────────────
    case 'get_arbres':
        try {
            $pdo  = getDB();
            $stmt = $pdo->query('
                SELECT a.id,
                       a.hauteur_totale, a.hauteur_tronc, a.diametre_tronc,
                       e.libelle  AS espece,
                       sd.libelle AS stade_developpement,
                       et.libelle AS etat,
                       tp.libelle AS type_port,
                       tpi.libelle AS type_pied,
                       a.remarquable,
                       a.latitude, a.longitude,
                       a.age_estime
                FROM arbres a
                LEFT JOIN especes       e   ON a.id_espece = e.id
                LEFT JOIN stades_dev    sd  ON a.id_stade  = sd.id
                LEFT JOIN etats         et  ON a.id_etat   = et.id
                LEFT JOIN types_port    tp  ON a.id_port   = tp.id
                LEFT JOIN types_pied    tpi ON a.id_pied   = tpi.id
                ORDER BY a.id DESC
            ');
            echo json_encode($stmt->fetchAll());
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    // ── Options des listes déroulantes ─────────────────────────
    case 'get_options':
        try {
            $pdo = getDB();
            $data = [
                'especes'           => $pdo->query('SELECT id, libelle FROM especes ORDER BY libelle')->fetchAll(),
                'stades'            => $pdo->query('SELECT id, libelle FROM stades_dev ORDER BY libelle')->fetchAll(),
                'etats'             => $pdo->query('SELECT id, libelle FROM etats ORDER BY libelle')->fetchAll(),
                'types_port'        => $pdo->query('SELECT id, libelle FROM types_port ORDER BY libelle')->fetchAll(),
                'types_pied'        => $pdo->query('SELECT id, libelle FROM types_pied ORDER BY libelle')->fetchAll(),
            ];
            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    // ── Ajout d'un arbre ───────────────────────────────────────
    case 'add_arbre':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
            break;
        }

        $required = ['hauteur_totale', 'hauteur_tronc', 'diametre_tronc',
                     'id_espece', 'id_stade', 'id_etat', 'id_port', 'id_pied',
                     'remarquable', 'latitude', 'longitude'];

        $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        foreach ($required as $field) {
            if (!isset($body[$field]) || $body[$field] === '') {
                http_response_code(400);
                echo json_encode(['error' => "Champ manquant : $field"]);
                exit;
            }
        }

        try {
            $pdo  = getDB();
            $stmt = $pdo->prepare('
                INSERT INTO arbres
                    (hauteur_totale, hauteur_tronc, diametre_tronc,
                     id_espece, id_stade, id_etat, id_port, id_pied,
                     remarquable, latitude, longitude)
                VALUES
                    (:hauteur_totale, :hauteur_tronc, :diametre_tronc,
                     :id_espece, :id_stade, :id_etat, :id_port, :id_pied,
                     :remarquable, :latitude, :longitude)
            ');
            $stmt->execute([
                ':hauteur_totale' => (float) $body['hauteur_totale'],
                ':hauteur_tronc'  => (float) $body['hauteur_tronc'],
                ':diametre_tronc' => (float) $body['diametre_tronc'],
                ':id_espece'      => (int)   $body['id_espece'],
                ':id_stade'       => (int)   $body['id_stade'],
                ':id_etat'        => (int)   $body['id_etat'],
                ':id_port'        => (int)   $body['id_port'],
                ':id_pied'        => (int)   $body['id_pied'],
                ':remarquable'    => (int)   $body['remarquable'],
                ':latitude'       => (float) $body['latitude'],
                ':longitude'      => (float) $body['longitude'],
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    // ── Prédiction de l'âge (script Python) ───────────────────
    case 'predict_age':
        $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        // Paramètres transmis au script Python
        $params = [
            escapeshellarg((float)($body['hauteur_totale']  ?? 0)),
            escapeshellarg((float)($body['hauteur_tronc']   ?? 0)),
            escapeshellarg((float)($body['diametre_tronc']  ?? 0)),
            escapeshellarg($body['espece']           ?? ''),
            escapeshellarg($body['stade']            ?? ''),
            escapeshellarg($body['etat']             ?? ''),
            escapeshellarg($body['type_port']        ?? ''),
            escapeshellarg($body['type_pied']        ?? ''),
            escapeshellarg((int)($body['remarquable'] ?? 0)),
        ];

        $cmd    = 'python3 ' . __DIR__ . '/python/predict_age.py ' . implode(' ', $params) . ' 2>&1';
        $output = [];
        $retval = 0;
        exec($cmd, $output, $retval);

        $result = implode("\n", $output);

        if ($retval !== 0) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur script Python', 'detail' => $result]);
        } else {
            // Le script Python doit afficher un JSON {"age": X}
            $decoded = json_decode($result, true);
            if ($decoded !== null) {
                echo json_encode($decoded);
            } else {
                echo json_encode(['age_brut' => trim($result)]);
            }
        }
        break;

    // ── Prédiction des clusters ────────────────────────────────
    case 'predict_clusters':
        // Récupération des données de la BDD
        try {
            $pdo  = getDB();
            $stmt = $pdo->query('
                SELECT a.id, a.hauteur_totale, a.hauteur_tronc, a.diametre_tronc,
                       a.latitude, a.longitude,
                       e.libelle AS espece, sd.libelle AS stade, et.libelle AS etat,
                       tp.libelle AS type_port, tpi.libelle AS type_pied, a.remarquable
                FROM arbres a
                LEFT JOIN especes    e   ON a.id_espece = e.id
                LEFT JOIN stades_dev sd  ON a.id_stade  = sd.id
                LEFT JOIN etats      et  ON a.id_etat   = et.id
                LEFT JOIN types_port tp  ON a.id_port   = tp.id
                LEFT JOIN types_pied tpi ON a.id_pied   = tpi.id
            ');
            $arbres = $stmt->fetchAll();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
            break;
        }

        // Écriture d'un fichier JSON temporaire pour le script Python
        $tmpFile = sys_get_temp_dir() . '/arbres_' . uniqid() . '.json';
        file_put_contents($tmpFile, json_encode($arbres));

        $cmd    = 'python3 ' . __DIR__ . '/python/predict_clusters.py ' . escapeshellarg($tmpFile) . ' 2>&1';
        $output = [];
        $retval = 0;
        exec($cmd, $output, $retval);
        unlink($tmpFile);

        $result = implode("\n", $output);

        if ($retval !== 0) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur script Python clusters', 'detail' => $result]);
        } else {
            $decoded = json_decode($result, true);
            echo ($decoded !== null) ? json_encode($decoded) : json_encode(['raw' => $result]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => "Action inconnue : $action"]);
}