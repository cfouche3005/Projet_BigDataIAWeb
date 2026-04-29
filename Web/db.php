<?php
/**
 * db.php
 * Connexion à la base de données MySQL
 * Inclure ce fichier dans tous les scripts PHP qui accèdent à la BDD
 */

// ── Configuration ─────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'patrimoine_arbore');
define('DB_USER', 'root');        // À modifier selon votre config
define('DB_PASS', '');            // À modifier selon votre config
define('DB_CHARSET', 'utf8mb4');

// ── Connexion PDO ──────────────────────────────────────────────
function getDB(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST, DB_NAME, DB_CHARSET
        );
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Connexion BDD échouée : ' . $e->getMessage()]);
            exit;
        }
    }

    return $pdo;
}