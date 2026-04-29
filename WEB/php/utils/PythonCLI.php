<?php

class PythonCLI {
	private static $python_bin = PYTHON_BIN;
	private static $cli_path = PYTHON_CLI_PATH;

	public static function predict($payload) {
		if (!is_array($payload)) {
			throw new Exception('Payload must be an array');
		}

		$json_payload = json_encode($payload);
		$escaped_json = escapeshellarg($json_payload);

		$command = sprintf(
			'%s %s --json %s 2>&1',
			escapeshellarg(self::$python_bin),
			escapeshellarg(self::$cli_path),
			$escaped_json
		);

		$output = shell_exec($command);
		if ($output === null) {
			throw new Exception('Python CLI execution failed');
		}

		$result = json_decode($output, true);
		if ($result === null) {
			throw new Exception('Python CLI returned invalid JSON: ' . $output);
		}

		if (!isset($result['ok']) || !$result['ok']) {
			$error_msg = $result['error']['message'] ?? 'Unknown error';
			throw new Exception('Prediction failed: ' . $error_msg);
		}

		return $result;
	}
}
