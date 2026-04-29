# Tree API (PHP Implementation)

Full-stack PHP API for the tree database and model predictions.

## Installation

### Prerequisites

- PHP 7.4+
- PostgreSQL 12+
- Python 3.8+ (for the CLI models)

### Setup Steps

1. **Database Setup**

   Create the PostgreSQL database and tables using the provided schema:

   ```bash
   psql -U postgres -d your_database < /path/to/schema.sql
   ```

2. **PHP Configuration**

   Edit `config/database.php` or set environment variables:

   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=arbres_db
   export DB_USER=postgres
   export DB_PASS=password
   export PYTHON_BIN=/path/to/venv/bin/python
   ```

3. **Web Server Setup**

   For Apache, ensure `.htaccess` rewrites or configure the VirtualHost to route all requests to `index.php`:

   ```apache
   <Directory /path/to/WEB/php>
       RewriteEngine On
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule ^(.*)$ index.php [QSA,L]
   </Directory>
   ```

   For Nginx:

   ```nginx
   location /api {
       try_files $uri $uri/ /index.php?$query_string;
   }
   ```

4. **Test the API**

   ```bash
   curl -X POST http://localhost/api/predictions \
     -H 'Content-Type: application/json' \
     -d '{
       "model": "height_classification",
       "num_clusters": 2,
       "haut_tot": 15,
       "tronc_diam": 130,
       "age_estim": 45,
       "fk_stadedev_encoded": 0.0
     }'
   ```

## API Endpoints

All endpoints are under `/api`.

### Predictions

**POST /api/predictions**

Run a model prediction. Returns the model output wrapped in a response object.

**Example:**

```bash
curl -X POST http://localhost/api/predictions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "age_prediction",
    "haut_tronc": 2.5,
    "haut_tot": 15.0,
    "tronc_diam": 45.0
  }'
```

**Response:**

```json
{
  "ok": true,
  "client": "age_prediction",
  "input": { ... },
  "result": {
    "predicted_age": 27.52,
    "model_file": "regression_RandomForestRegressor.pkl",
    "model_name": "RandomForestRegressor",
    "gridsearch": false
  }
}
```

### Trees

**GET /api/arbres**

List all trees.

**GET /api/arbres/{id_arbre}**

Get a tree by ID.

**POST /api/arbres**

Create a new tree record.

**Example:**

```bash
curl -X POST http://localhost/api/arbres \
  -H 'Content-Type: application/json' \
  -d '{
    "id_espece": 1,
    "id_etat": 1,
    "latitude": 48.8566,
    "longitude": 2.3522,
    "hauteur_totale": 15.0,
    "hauteur_tronc": 2.5,
    "diametre_tronc": 45.0
  }'
```

**PATCH /api/arbres/{id_arbre}**

Update a tree record.

**DELETE /api/arbres/{id_arbre}**

Delete a tree record.

### Reference Data

**GET /api/especes**

List all species.

**GET /api/especes/{id_espece}**

Get a species by ID.

**GET /api/etats**

List all tree states.

**GET /api/stades-developpement**

List all development stages.

**GET /api/types-port**

List all port types.

**GET /api/types-pied**

List all pied types.

## File Structure

```
php/
├── index.php                          # Entry point and router
├── config/
│   └── database.php                   # Database configuration
├── models/
│   └── Database.php                   # Database abstraction layer
├── controllers/
│   ├── PredictionController.php       # Predictions endpoint
│   ├── ArbreController.php            # Trees CRUD
│   └── ReferenceController.php        # Reference data (lookup tables)
├── utils/
│   ├── Response.php                   # HTTP response helpers
│   └── PythonCLI.php                  # Python CLI wrapper
└── README.md                          # This file
```

## Error Handling

All errors are returned as JSON with the following structure:

```json
{
  "ok": false,
  "error": {
    "type": "ErrorType",
    "message": "Human-readable error description"
  }
}
```

Common error codes:
- `400 Bad Request` - Invalid input or missing required fields
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server or database error

## Database Schema

The API expects the following tables to exist:

- `especes` - Species reference table
- `etats` - Tree state reference table
- `stades_developpement` - Development stage reference table
- `types_port` - Port type reference table
- `types_pied` - Pied type reference table
- `arbres` - Main tree registry table with foreign keys

See the Swagger specification at `../docs/swagger.json` for the full schema documentation.

## Security Notes

- This implementation uses parameterized queries to prevent SQL injection.
- All user input is validated before processing.
- The Python CLI is invoked via shell execution with proper escaping.
- Consider adding authentication/authorization in production.
- Use HTTPS in production environments.

## Troubleshooting

### Python CLI Not Found

Ensure `PYTHON_BIN` environment variable or configuration points to the correct Python executable:

```bash
export PYTHON_BIN=/home/cfouche/Documents/Code/Projet_BigDataIAWeb/.venv/bin/python
```

### Database Connection Failed

Verify PostgreSQL is running and credentials are correct:

```bash
psql -h localhost -U postgres -c "SELECT 1"
```

### 404 Errors

Ensure your web server is correctly routing all requests to `index.php`.
