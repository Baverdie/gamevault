FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json and install deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy Prisma schema & generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY src ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8080

# Start script
COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]