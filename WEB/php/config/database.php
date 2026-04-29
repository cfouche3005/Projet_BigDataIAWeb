<?php

// Database configuration
const DB_HOST = getenv('DB_HOST') ?: 'localhost';
const DB_PORT = getenv('DB_PORT') ?: 5432;
const DB_NAME = getenv('DB_NAME') ?: 'arbres_db';
const DB_USER = getenv('DB_USER') ?: 'postgres';
const DB_PASS = getenv('DB_PASS') ?: 'password';

// Python CLI configuration
const PYTHON_CLI_PATH = __DIR__ . '/../../python/app.py';
const PYTHON_BIN = getenv('PYTHON_BIN') ?: 'python3';
