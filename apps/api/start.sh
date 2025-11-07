#!/bin/sh
echo "🗃️ Prisma push..."
npx prisma db push --skip-generate
echo "🚀 Starting server..."
node dist/server.js