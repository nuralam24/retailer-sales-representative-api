#!/bin/bash

echo "🛑 Stopping existing containers..."
docker-compose down

echo ""
echo "🏗️  Rebuilding Docker images..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if DATABASE_URL contains 'postgres' service (Docker) or 'localhost' (Local)
if grep -q "DATABASE_URL.*postgres:5432" .env 2>/dev/null || grep -q "DATABASE_URL.*postgres:5432" example.env 2>/dev/null; then
    echo ""
    echo "🐳 Docker database detected! Setting up database..."
    echo ""
    
    echo "📦 Generating Prisma client..."
    docker-compose exec -T app npx prisma generate
    
    echo ""
    echo "🔄 Running database migrations..."
    docker-compose exec -T app npx prisma migrate deploy
    
    echo ""
    echo "🌱 Seeding database with Bangladeshi names..."
    docker-compose exec -T app npm run seed
    
    echo ""
    echo "✅ Docker database setup complete!"
elif grep -q "DATABASE_URL.*localhost:5432" .env 2>/dev/null || grep -q "DATABASE_URL.*localhost:5432" example.env 2>/dev/null; then
    echo ""
    echo "💻 Local database detected! Using existing local database..."
    echo "   (Make sure your local PostgreSQL is running)"
    echo ""
else
    echo ""
    echo "⚠️  Could not determine database type from .env"
    echo "   Please check your DATABASE_URL in .env file"
    echo ""
fi

echo ""
echo "📋 Viewing application logs..."
echo "   Press Ctrl+C to stop viewing logs (containers will keep running)"
echo ""
docker-compose logs -f app

