<?php

class ReferenceController {
	private $db;

	public function __construct($db) {
		$this->db = $db;
	}

	public function listEspeces() {
		return $this->db->fetchAll('SELECT * FROM especes ORDER BY nom_commun');
	}

	public function getEspece($id) {
		$result = $this->db->fetchOne('SELECT * FROM especes WHERE id_espece = ?', [$id]);
		if (!$result) {
			Response::notFound("Species not found");
		}
		return $result;
	}

	public function listEtats() {
		return $this->db->fetchAll('SELECT * FROM etats ORDER BY libelle');
	}

	public function listStadesDeveloppement() {
		return $this->db->fetchAll('SELECT * FROM stades_developpement ORDER BY libelle');
	}

	public function listTypesPort() {
		return $this->db->fetchAll('SELECT * FROM types_port ORDER BY libelle');
	}

	public function listTypesPied() {
		return $this->db->fetchAll('SELECT * FROM types_pied ORDER BY libelle');
	}
}
