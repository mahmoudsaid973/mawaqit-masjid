#!/bin/bash

# Database migration script

echo "🚀 Running database migrations..."

# Determine docker compose command
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Check if we're in a Docker container
if [ -f /.dockerenv ]; then
  # Running inside Docker container
  npm run migrate
else
  # Running on host - execute in Docker container
  $COMPOSE_CMD exec app npm run migrate
fi

echo "✅ Database migrations completed successfully"