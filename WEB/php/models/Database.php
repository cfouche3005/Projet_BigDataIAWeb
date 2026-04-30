<?php

class Database {
	private $pdo;

	public function __construct() {
		$databaseDirectory = dirname(DB_PATH);
		if (!is_dir($databaseDirectory)) {
			mkdir($databaseDirectory, 0755, true);
		}

		$dsn = 'sqlite:' . DB_PATH;

		$this->pdo = new PDO($dsn, null, null, [
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		]);

		$this->pdo->exec('PRAGMA foreign_keys = ON');
	}

	public function query($sql, $params = []) {
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute($params);
		return $stmt;
	}

	public function fetchAll($sql, $params = []) {
		return $this->query($sql, $params)->fetchAll();
	}

	public function fetchOne($sql, $params = []) {
		return $this->query($sql, $params)->fetch();
	}

	public function execute($sql, $params = []) {
		return $this->query($sql, $params);
	}

	public function lastInsertId() {
		return $this->pdo->lastInsertId();
	}

	public function beginTransaction() {
		return $this->pdo->beginTransaction();
	}

	public function commit() {
		return $this->pdo->commit();
	}

	public function rollBack() {
		return $this->pdo->rollBack();
	}
}
