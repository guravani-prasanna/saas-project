#!/bin/sh
set -e

echo "Waiting for database at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 2
done
echo "Database is up."

echo "Running migrations..."
node ./scripts/migrate.js

echo "Running seeds..."
node ./scripts/seed.js

echo "Starting server..."
node src/server.js
