FROM php:8.2-apache

# Installation des paquets système requis, Python 3 et SQLite
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Activation de mod_rewrite d'Apache
RUN a2enmod rewrite

# Configuration de l'environnement virtuel Python et installation des dépendances
# Nous utilisons un venv pour éviter les erreurs PEP 668 "environnement géré en externe"
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Définition du répertoire de travail vers le DocumentRoot d'Apache
WORKDIR /var/www/html

# Copie des fichiers de l'application
COPY . /var/www/html/

# Définition des variables d'environnement pour l'application
ENV PYTHON_BIN=/opt/venv/bin/python3
ENV DB_PATH=/var/www/html/data/trees.sqlite

# Assurer des permissions appropriées pour la base de données et les logs
# SQLite nécessite des permissions d'écriture à la fois sur le fichier et sur son répertoire parent
RUN mkdir -p /var/www/html/data /var/www/html/logs \
    && chown -R www-data:www-data /var/www/html/data /var/www/html/logs \
    && chmod -R 775 /var/www/html/data /var/www/html/logs

EXPOSE 80
