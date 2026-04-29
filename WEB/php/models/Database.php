<?php

class Database {
	private $pdo;

	public function __construct() {
		$dsn = sprintf(
			'pgsql:host=%s;port=%d;dbname=%s',
			DB_HOST,
			DB_PORT,
			DB_NAME
		);

		$this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		]);
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
