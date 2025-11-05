import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { config } from '../config/env.js';

const searchSchema = z.object({
	q: z.string().min(1),
	page: z.string().optional().default('1'),
});

export async function gamesRoutes(server: FastifyInstance) {
	// Search games from RAWG API
	server.get('/search', {
		schema: {
			tags: ['games'],
			querystring: {
				type: 'object',
				properties: {
					q: { type: 'string' },
					page: { type: 'string' },
				},
			},
		},
		handler: async (request, reply) => {
			try {
				const { q, page } = searchSchema.parse(request.query);

				// Check cache
				const cacheKey = `search:${q}:${page}`;
				const cached = await redis.get(cacheKey);

				if (cached) {
					return JSON.parse(cached);
				}

				// Fetch from RAWG
				const response = await fetch(
					`https://api.rawg.io/api/games?key=${config.rawgApiKey}&search=${encodeURIComponent(q)}&page=${page}&page_size=20`
				);

				if (!response.ok) {
					return reply.status(response.status).send({ error: 'Failed to fetch games' });
				}

				const data = await response.json();

				// Cache for 1 hour
				await redis.setex(cacheKey, 3600, JSON.stringify(data));

				return data;
			} catch (error) {
				if (error instanceof z.ZodError) {
					return reply.status(400).send({ error: error.errors });
				}
				throw error;
			}
		},
	});

	// Get game details
	server.get('/:id', {
		schema: {
			tags: ['games'],
			params: {
				type: 'object',
				properties: {
					id: { type: 'string' },
				},
			},
		},
		handler: async (request, reply) => {
			const { id } = request.params as { id: string };

			// Check cache
			const cacheKey = `game:${id}`;
			const cached = await redis.get(cacheKey);

			if (cached) {
				return JSON.parse(cached);
			}

			// Fetch from RAWG
			const response = await fetch(
				`https://api.rawg.io/api/games/${id}?key=${config.rawgApiKey}`
			);

			if (!response.ok) {
				return reply.status(response.status).send({ error: 'Game not found' });
			}

			const data = await response.json();

			// Cache for 24 hours
			await redis.setex(cacheKey, 86400, JSON.stringify(data));

			return data;
		},
	});
}