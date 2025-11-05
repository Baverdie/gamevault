import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import './config/queue.js';
import { authRoutes } from './routes/auth.routes.js';
import { gamesRoutes } from './routes/games.routes.js';
import { collectionRoutes } from './routes/collection.routes.js';
import { reviewsRoutes } from './routes/reviews.routes.js';
import { statsRoutes } from './routes/stats.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { rateLimit } from './middlewares/rateLimit.middleware.js';

const server = Fastify({
	logger: false,
});

// Request logging middleware
server.addHook('onRequest', async (request) => {
	logger.info(`📥 ${request.method} ${request.url}`);
});

server.addHook('onResponse', async (request, reply) => {
	logger.info(`📤 ${request.method} ${request.url} - ${reply.statusCode}`);
});

// Error logging
server.setErrorHandler((error, request, reply) => {
	logger.error(`❌ ${request.method} ${request.url} - ${error.message}`);
	reply.status(500).send({ error: 'Internal Server Error' });
});

// CORS
await server.register(cors, {
	origin: config.nodeEnv === 'development' ? '*' : config.frontendUrl,
});

// JWT
await server.register(jwt, {
	secret: config.jwtSecret,
});

// Decorator pour authenticate
server.decorate('authenticate', async function (request, reply) {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply.status(401).send({ error: 'Unauthorized' });
	}
});

// Swagger (JSON spec only, no UI)
await server.register(swagger, {
	swagger: {
		info: {
			title: 'GameVault API',
			description: 'API for managing your game collection',
			version: '1.0.0',
		},
		host: `localhost:${config.port}`,
		schemes: ['http'],
		consumes: ['application/json'],
		produces: ['application/json'],
		tags: [
			{ name: 'auth', description: 'Authentication endpoints' },
			{ name: 'games', description: 'Games management endpoints' },
			{ name: 'collection', description: 'User collection endpoints' },
			{ name: 'reviews', description: 'Reviews endpoints' },
			{ name: 'stats', description: 'Statistics endpoints' },
			{ name: 'health', description: 'Health check endpoints' },
		],
		securityDefinitions: {
			Bearer: {
				type: 'apiKey',
				name: 'Authorization',
				in: 'header',
			},
		},
	},
});

// Global rate limit (100 req / 15min)
server.addHook('onRequest', rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }));

// Routes
await server.register(healthRoutes);
await server.register(authRoutes, { prefix: '/api/auth' });
await server.register(gamesRoutes, { prefix: '/api/games' });
await server.register(collectionRoutes, { prefix: '/api/collection' });
await server.register(reviewsRoutes, { prefix: '/api/reviews' });
await server.register(statsRoutes, { prefix: '/api/stats' });

// Start server
const start = async () => {
	try {
		await server.listen({ port: config.port, host: '0.0.0.0' });
		logger.info(`🚀 Server running on http://localhost:${config.port}`);
		logger.info(`📋 OpenAPI spec at http://localhost:${config.port}/documentation/json`);
		logger.info(`🏥 Health check at http://localhost:${config.port}/health/detailed`);
	} catch (err) {
		logger.error(`❌ Failed to start server: ${err}`);
		process.exit(1);
	}
};

start();