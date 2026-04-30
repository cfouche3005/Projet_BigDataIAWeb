<?php

// SQLite configuration
define('DB_PATH', getenv('DB_PATH') ?: __DIR__ . '/data/trees.sqlite');

// Python CLI configuration
define('PYTHON_CLI_PATH', __DIR__ . '/python/app.py');
define('PYTHON_BIN', getenv('PYTHON_BIN') ?: '/home/cfouche/Documents/Code/Projet_BigDataIAWeb/.venv/bin/python3');

// Error logging configuration
define('LOG_DIR', __DIR__ . '/logs');
define('ERROR_LOG', LOG_DIR . '/error.log');
define('PYTHON_LOG', LOG_DIR . '/python.log');
define('API_LOG', LOG_DIR . '/api.log');

// Enable error logging
@mkdir(LOG_DIR, 0755, true);
ini_set('log_errors', 1);
ini_set('error_log', ERROR_LOG);
ini_set('display_errors', 0);  // Don't display errors to users in production
