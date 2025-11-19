#!/bin/sh
set -e

echo "🔍 Waiting for database to be ready..."
# Wait for PostgreSQL to accept connections
max_attempts=30
attempt=0

# Simple connection check - wait for postgres healthcheck
while [ $attempt -lt $max_attempts ]; do
  if nc -z postgres 5432 2>/dev/null; then
    break
  fi
  attempt=$((attempt + 1))
  echo "⏳ Database is unavailable - attempt $attempt/$max_attempts - sleeping"
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Database failed to become ready after $max_attempts attempts"
  exit 1
fi

echo "✅ Database is ready!"

echo "🔄 Running Prisma migrations..."
# Try to run migrations, if it fails because schema is not empty, use db push instead
if ! npx prisma migrate deploy 2>/dev/null; then
  echo "⚠️  Migration deploy failed, using db push to sync schema..."
  npx prisma db push --skip-generate --accept-data-loss
fi

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🌱 Seeding database with initial data..."
npm run seed || echo "⚠️  Seed script failed or data already exists"

echo "🚀 Starting application..."
exec "$@"

