<?php

class ArbreController {
	private $db;

	public function __construct($db) {
		$this->db = $db;
	}

	private function normalizeCoordinateValue($value, $field) {
		if (!is_scalar($value)) {
			Response::badRequest("Invalid coordinate field: $field");
		}

		$normalized = trim((string)$value);
		if ($normalized === '' || !preg_match('/^-?[0-9]+(?:\.[0-9]{1,64})?$/', $normalized)) {
			Response::badRequest("Invalid coordinate field: $field");
		}

		return $normalized;
	}

	public function listArbres() {
		return $this->db->fetchAll(
			'SELECT id_arbre, id_espece, id_etat, id_stade, id_port, id_pied, est_remarquable, 
			        hauteur_totale, hauteur_tronc, diametre_tronc, latitude, longitude 
			 FROM arbres ORDER BY id_arbre'
		);
	}

	public function getArbre($id) {
		$result = $this->db->fetchOne(
			'SELECT id_arbre, id_espece, id_etat, id_stade, id_port, id_pied, est_remarquable, 
			        hauteur_totale, hauteur_tronc, diametre_tronc, latitude, longitude 
			 FROM arbres WHERE id_arbre = ?',
			[$id]
		);
		if (!$result) {
			Response::notFound("Tree not found");
		}
		return $result;
	}

	public function createArbre($payload) {
		if (empty($payload)) {
			Response::badRequest('Request body is empty');
		}

		$required = ['latitude', 'longitude'];
		foreach ($required as $field) {
			if (!isset($payload[$field])) {
				Response::badRequest("Missing required field: $field");
			}
		}

		$payload['latitude'] = $this->normalizeCoordinateValue($payload['latitude'], 'latitude');
		$payload['longitude'] = $this->normalizeCoordinateValue($payload['longitude'], 'longitude');

		$fields = ['id_espece', 'id_etat', 'id_stade', 'id_port', 'id_pied', 'est_remarquable', 
		           'hauteur_totale', 'hauteur_tronc', 'diametre_tronc', 'latitude', 'longitude'];
		$placeholders = [];
		$values = [];
		$columns = [];

		foreach ($fields as $field) {
			if (isset($payload[$field])) {
				$columns[] = $field;
				$placeholders[] = '?';
				$values[] = $payload[$field];
			}
		}

		$sql = sprintf(
			'INSERT INTO arbres (%s) VALUES (%s)',
			implode(', ', $columns),
			implode(', ', $placeholders)
		);

		$this->db->execute($sql, $values);
		return $this->getArbre($this->db->lastInsertId());
	}

	public function updateArbre($id, $payload) {
		if (!$this->db->fetchOne('SELECT id_arbre FROM arbres WHERE id_arbre = ?', [$id])) {
			Response::notFound("Tree not found");
		}

		if (empty($payload)) {
			return $this->getArbre($id);
		}

		$fields = ['id_espece', 'id_etat', 'id_stade', 'id_port', 'id_pied', 'est_remarquable', 
		           'hauteur_totale', 'hauteur_tronc', 'diametre_tronc', 'latitude', 'longitude'];
		$updates = [];
		$values = [];

		foreach ($fields as $field) {
			if (isset($payload[$field])) {
				if ($field === 'latitude' || $field === 'longitude') {
					$payload[$field] = $this->normalizeCoordinateValue($payload[$field], $field);
				}

				$updates[] = "$field = ?";
				$values[] = $payload[$field];
			}
		}

		if (empty($updates)) {
			return $this->getArbre($id);
		}

		$values[] = $id;
		$sql = sprintf(
			'UPDATE arbres SET %s WHERE id_arbre = ?',
			implode(', ', $updates)
		);

		$this->db->execute($sql, $values);
		return $this->getArbre($id);
	}

	public function deleteArbre($id) {
		if (!$this->db->fetchOne('SELECT id_arbre FROM arbres WHERE id_arbre = ?', [$id])) {
			Response::notFound("Tree not found");
		}

		$this->db->execute('DELETE FROM arbres WHERE id_arbre = ?', [$id]);
	}
}
