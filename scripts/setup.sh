#!/bin/bash

# Exit on any error
set -e

echo "🚀 Setting up Mawaqit Masjid development environment..."

# Check if Docker is installed
echo "🔍 Checking for Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Determine docker compose command
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building Docker images..."
$COMPOSE_CMD build

echo "🚀 Starting services..."
$COMPOSE_CMD up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "📊 Running database migrations..."
$COMPOSE_CMD exec app npm run migrate

echo "✅ Setup complete! Application is running at http://localhost:3000"
echo "📝 To stop: $COMPOSE_CMD down"
echo "📋 To view logs: $COMPOSE_CMD logs -f"