<?php

class ArbreController {
	private $db;

	public function __construct($db) {
		$this->db = $db;
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
			'INSERT INTO arbres (%s) VALUES (%s) RETURNING *',
			implode(', ', $columns),
			implode(', ', $placeholders)
		);

		$result = $this->db->fetchOne($sql, $values);
		return $result;
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
				$updates[] = "$field = ?";
				$values[] = $payload[$field];
			}
		}

		if (empty($updates)) {
			return $this->getArbre($id);
		}

		$values[] = $id;
		$sql = sprintf(
			'UPDATE arbres SET %s WHERE id_arbre = ? RETURNING *',
			implode(', ', $updates)
		);

		$result = $this->db->fetchOne($sql, $values);
		return $result;
	}

	public function deleteArbre($id) {
		if (!$this->db->fetchOne('SELECT id_arbre FROM arbres WHERE id_arbre = ?', [$id])) {
			Response::notFound("Tree not found");
		}

		$this->db->execute('DELETE FROM arbres WHERE id_arbre = ?', [$id]);
	}
}
