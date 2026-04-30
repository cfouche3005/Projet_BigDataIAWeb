# Tree API (PHP Implementation)

Full-stack PHP API for the tree database and model predictions.

## Installation

### Prerequisites

- PHP 7.4+
- SQLite 3+
- Python 3.8+ (for the CLI models)

### Setup Steps

1. **Database Setup**

  Create the SQLite database file and tables using the provided schema:

   ```bash
  mkdir -p ../data
  sqlite3 ../data/trees.sqlite < /path/to/schema.sql
   ```

2. **PHP Configuration**

  Edit `../config.php` (root `WEB/config.php`) or set environment variables:

   ```bash
  export DB_PATH=/home/cfouche/Documents/Code/Projet_BigDataIAWeb/WEB/data/trees.sqlite
   export PYTHON_BIN=/path/to/venv/bin/python
   ```

3. **Web Server Setup**

  The API router is now at `php/api.php`. You can call it either directly or use server-level rewrites.

  **Option A: Direct Calls (Simplest)**

  Call endpoints directly on `php/api.php` with `PATH_INFO`:

   ```bash
   curl http://localhost/php/api.php/arbres
   curl http://localhost/php/api.php/predictions
   ```

  **Option B: Apache VirtualHost Rewrite**

  Rewrite `/api/` requests to `php/api.php` in your VirtualHost:

   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       DocumentRoot /var/www/yourdomain/WEB

       <Directory /var/www/yourdomain/WEB>
           RewriteEngine On
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule ^api/(.*)$ php/api.php [QSA,L]
       </Directory>
   </VirtualHost>
   ```

  Then call with the `/api/` path:

   ```bash
   curl http://localhost/api/arbres
   ```

  **Option C: Nginx**

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/yourdomain/WEB;

       location /api {
           rewrite ^/api/(.*)$ /php/api.php last;
       }
   }
   ```

4. **Test the API**

   Direct call (no rewrite needed):

   ```bash
   curl -X POST http://localhost/php/api.php/predictions \
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

All endpoints are accessible at `/php/api.php/{endpoint}` (direct call) or `/api/{endpoint}` (if server rewrites configured).

### Predictions

**POST /php/api.php/predictions** (or `/api/predictions` with rewrite)

Run a model prediction. Returns the model output wrapped in a response object.

**Example:**

```bash
curl -X POST http://localhost/php/api.php/predictions \
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

**GET /php/api.php/arbres** (or `/api/arbres` with rewrite)

List all trees.

**GET /php/api.php/arbres/{id_arbre}** (or `/api/arbres/{id_arbre}` with rewrite)

Get a tree by ID.

**POST /php/api.php/arbres** (or `/api/arbres` with rewrite)

Create a new tree record.

**Example:**

```bash
curl -X POST http://localhost/php/api.php/arbres \
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

**PATCH /php/api.php/arbres/{id_arbre}** (or `/api/arbres/{id_arbre}` with rewrite)

Update a tree record.

**DELETE /php/api.php/arbres/{id_arbre}** (or `/api/arbres/{id_arbre}` with rewrite)

Delete a tree record.

### Reference Data

**GET /php/api.php/especes** (or `/api/especes` with rewrite)

List all species.

**GET /php/api.php/especes/{id_espece}** (or `/api/especes/{id_espece}` with rewrite)

Get a species by ID.

**GET /php/api.php/etats** (or `/api/etats` with rewrite)

List all tree states.

**GET /php/api.php/stades-developpement** (or `/api/stades-developpement` with rewrite)

List all development stages.

**GET /php/api.php/types-port** (or `/api/types-port` with rewrite)

List all port types.

**GET /php/api.php/types-pied** (or `/api/types-pied` with rewrite)

List all pied types.

## File Structure

```
WEB/
├── .htaccess                          # Apache rewrite entrypoint
├── config.php                         # Root deployment configuration
├── php/
│   ├── api.php                        # Entry point and router
│   ├── models/
│   │   └── Database.php               # Database abstraction layer
│   ├── controllers/
│   │   ├── PredictionController.php   # Predictions endpoint
│   │   ├── ArbreController.php        # Trees CRUD
│   │   └── ReferenceController.php    # Reference data (lookup tables)
│   ├── utils/
│   │   ├── Response.php               # HTTP response helpers
│   │   └── PythonCLI.php              # Python CLI wrapper
│   └── README.md                      # This file
└── python/
  └── app.py                         # Python CLI entrypoint
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

Ensure `PYTHON_BIN` and `DB_PATH` environment variables or configuration point to the correct paths:

```bash
export PYTHON_BIN=/home/cfouche/Documents/Code/Projet_BigDataIAWeb/.venv/bin/python
export DB_PATH=/home/cfouche/Documents/Code/Projet_BigDataIAWeb/WEB/data/trees.sqlite
```

### Database Connection Failed

Verify the SQLite file exists and is writable:

```bash
ls -l /home/cfouche/Documents/Code/Projet_BigDataIAWeb/WEB/data/trees.sqlite
```

### 404 Errors

Ensure your web server is correctly routing requests to `php/api.php`. Test with direct calls:

```bash
curl http://localhost/php/api.php/arbres
```

If using server rewrites, verify the rewrite rules are active and PATH_INFO is enabled.
