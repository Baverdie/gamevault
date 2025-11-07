#!/bin/sh
set -e

# Debug DB URL
echo "Using DATABASE_URL: $DATABASE_URL"

# Push Prisma schema vers la DB
echo "Pushing Prisma schema..."
npx prisma db push --accept-data-loss

# Start server
echo "Starting server..."
node dist/server.js
