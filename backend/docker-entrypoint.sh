
set -e

echo "Running database migrations..."
npx node-pg-migrate up \
  --database-url "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --migrations-dir migrations \
  --direction up

echo "Migrations complete. Starting server..."
exec "$@"
