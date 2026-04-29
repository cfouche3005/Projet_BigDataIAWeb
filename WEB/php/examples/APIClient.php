<?php

/**
 * Example API Client
 * 
 * This is a simple example of how to use the API from PHP code.
 * In production, you would typically use this from your application code
 * rather than calling the endpoints directly.
 */

class TreeAPIClient {
	private $base_url;

	public function __construct($base_url = 'http://localhost/api') {
		$this->base_url = rtrim($base_url, '/');
	}

	/**
	 * Make a prediction using one of the models
	 */
	public function predict($model, $params) {
		$payload = array_merge(['model' => $model], $params);
		return $this->request('POST', '/predictions', $payload);
	}

	/**
	 * Predict tree clustering based on height characteristics
	 */
	public function predictHeightClassification($haut_tot, $tronc_diam, $age_estim, $fk_stadedev_encoded, $num_clusters = 2) {
		return $this->predict('height_classification', [
			'haut_tot' => $haut_tot,
			'tronc_diam' => $tronc_diam,
			'age_estim' => $age_estim,
			'fk_stadedev_encoded' => $fk_stadedev_encoded,
			'num_clusters' => $num_clusters,
		]);
	}

	/**
	 * Predict tree age from physical characteristics
	 */
	public function predictAge($haut_tronc, $haut_tot, $tronc_diam, $species = null, $gridsearch = false) {
		$params = [
			'haut_tronc' => $haut_tronc,
			'haut_tot' => $haut_tot,
			'tronc_diam' => $tronc_diam,
			'gridsearch' => $gridsearch,
		];
		if ($species) {
			$params['species'] = $species;
		}
		return $this->predict('age_prediction', $params);
	}

	/**
	 * Predict storm risk for a tree
	 */
	public function predictStormRisk($haut_tronc, $haut_tot, $tronc_diam, $clc_nbr_diag) {
		return $this->predict('storm_prevention', [
			'haut_tronc' => $haut_tronc,
			'haut_tot' => $haut_tot,
			'tronc_diam' => $tronc_diam,
			'clc_nbr_diag' => $clc_nbr_diag,
		]);
	}

	/**
	 * Get all species
	 */
	public function listEspeces() {
		return $this->request('GET', '/especes');
	}

	/**
	 * Get a species by ID
	 */
	public function getEspece($id) {
		return $this->request('GET', "/especes/$id");
	}

	/**
	 * Get all trees
	 */
	public function listArbres() {
		return $this->request('GET', '/arbres');
	}

	/**
	 * Get a tree by ID
	 */
	public function getArbre($id) {
		return $this->request('GET', "/arbres/$id");
	}

	/**
	 * Create a new tree
	 */
	public function createArbre($data) {
		return $this->request('POST', '/arbres', $data);
	}

	/**
	 * Update a tree
	 */
	public function updateArbre($id, $data) {
		return $this->request('PATCH', "/arbres/$id", $data);
	}

	/**
	 * Delete a tree
	 */
	public function deleteArbre($id) {
		return $this->request('DELETE', "/arbres/$id");
	}

	/**
	 * Get all development stages
	 */
	public function listStadesDeveloppement() {
		return $this->request('GET', '/stades-developpement');
	}

	/**
	 * Get all tree states
	 */
	public function listEtats() {
		return $this->request('GET', '/etats');
	}

	/**
	 * Make an HTTP request to the API
	 */
	private function request($method, $path, $data = null) {
		$url = $this->base_url . $path;

		$context_options = [
			'http' => [
				'method' => $method,
				'header' => 'Content-Type: application/json',
			],
		];

		if ($data !== null) {
			$context_options['http']['content'] = json_encode($data);
		}

		$context = stream_context_create($context_options);
		$response = file_get_contents($url, false, $context);

		if ($response === false) {
			throw new Exception("API request failed: $method $path");
		}

		$decoded = json_decode($response, true);
		if ($decoded === null) {
			throw new Exception("Invalid JSON response from API");
		}

		return $decoded;
	}
}

// Example usage:
/*
$client = new TreeAPIClient('http://localhost/api');

try {
	// Predict tree height classification
	$result = $client->predictHeightClassification(15, 130, 45, 0.0, 2);
	var_dump($result);

	// Predict age
	$result = $client->predictAge(2.5, 15.0, 45.0, 'QUE-ROB', false);
	var_dump($result);

	// Get all species
	$species = $client->listEspeces();
	var_dump($species);

	// Create a new tree
	$new_tree = $client->createArbre([
		'id_espece' => 1,
		'latitude' => 48.8566,
		'longitude' => 2.3522,
		'hauteur_totale' => 15.0,
		'hauteur_tronc' => 2.5,
		'diametre_tronc' => 45.0,
	]);
	var_dump($new_tree);
} catch (Exception $e) {
	echo "Error: " . $e->getMessage();
}
*/
