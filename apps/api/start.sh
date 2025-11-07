#!/bin/sh
set -e

echo "===================================="
echo "🚀 Starting GameVault API Container"
echo "===================================="

echo "🔄 Checking database connection..."
npx prisma db push --skip-generate || {
  echo "❌ Prisma failed to push schema to database."
  echo "💡 Check that your DATABASE_URL is correctly set and Postgres is reachable."
  exit 1
}

echo "✅ Database schema synchronized!"
echo "------------------------------------"

echo "🌐 Launching server on port 8080..."
node dist/server.js