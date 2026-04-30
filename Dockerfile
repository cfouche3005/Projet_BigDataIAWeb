FROM php:8.2-apache

# Install required system packages, Python 3, and SQLite
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Setup Python Virtual Environment and install dependencies
# We use a venv to avoid PEP 668 "externally managed environment" errors
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Set the working directory to Apache DocumentRoot
WORKDIR /var/www/html

# Copy the application files
COPY . /var/www/html/

# Set environment variables for the application
ENV PYTHON_BIN=/opt/venv/bin/python3
ENV DB_PATH=/var/www/html/WEB/data/trees.sqlite

# Ensure appropriate permissions for the database and logs
# SQLite requires write permissions on both the file and its containing directory
RUN mkdir -p /var/www/html/WEB/data /var/www/html/WEB/logs \
    && chown -R www-data:www-data /var/www/html/WEB/data /var/www/html/WEB/logs \
    && chmod -R 775 /var/www/html/WEB/data /var/www/html/WEB/logs

EXPOSE 80
