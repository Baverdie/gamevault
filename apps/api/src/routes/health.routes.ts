import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { config } from '../config/env.js';

export async function healthRoutes(server: FastifyInstance) {
	// Basic health check
	server.get('/health', async () => {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		};
	});

	// Detailed health check
	server.get('/health/detailed', async (request, reply) => {
		const checks = {
			database: 'unknown',
			redis: 'unknown',
			rawgApi: 'unknown',
			memory: process.memoryUsage(),
			uptime: process.uptime(),
		};

		// Check PostgreSQL
		try {
			await prisma.$queryRaw`SELECT 1`;
			checks.database = 'healthy';
		} catch (error) {
			checks.database = 'unhealthy';
		}

		// Check Redis
		try {
			await redis.ping();
			checks.redis = 'healthy';
		} catch (error) {
			checks.redis = 'unhealthy';
		}

		// Check RAWG API
		try {
			const response = await fetch(
				`https://api.rawg.io/api/games?key=${config.rawgApiKey}&page_size=1`
			);
			checks.rawgApi = response.ok ? 'healthy' : 'unhealthy';
		} catch (error) {
			checks.rawgApi = 'unhealthy';
		}

		const isHealthy =
			checks.database === 'healthy' &&
			checks.redis === 'healthy' &&
			checks.rawgApi === 'healthy';

		return reply
			.status(isHealthy ? 200 : 503)
			.send({
				status: isHealthy ? 'healthy' : 'degraded',
				checks,
				timestamp: new Date().toISOString(),
			});
	});
}