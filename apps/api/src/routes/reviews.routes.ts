import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const createReviewSchema = z.object({
	gameId: z.string(),
	rating: z.number().min(1).max(10),
	content: z.string().max(2000).optional(),
});

const updateReviewSchema = z.object({
	rating: z.number().min(1).max(10).optional(),
	content: z.string().max(2000).optional(),
});

export async function reviewsRoutes(server: FastifyInstance) {
	// Get reviews for a game
	server.get('/game/:gameId', {
		schema: {
			tags: ['reviews'],
			params: {
				type: 'object',
				properties: {
					gameId: { type: 'string' },
				},
			},
			querystring: {
				type: 'object',
				properties: {
					limit: { type: 'string' },
					offset: { type: 'string' },
				},
			},
		},
		handler: async (request, reply) => {
			const { gameId } = request.params as { gameId: string };
			const query = request.query as any;

			const limit = parseInt(query.limit || '20', 10);
			const offset = parseInt(query.offset || '0', 10);

			const [reviews, total] = await Promise.all([
				prisma.review.findMany({
					where: { gameId },
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
					take: limit,
					skip: offset,
				}),
				prisma.review.count({ where: { gameId } }),
			]);

			return {
				reviews,
				pagination: {
					total,
					limit,
					offset,
					hasMore: offset + limit < total,
				},
			};
		},
	});

	// Get user's reviews
	server.get('/me', {
		schema: {
			tags: ['reviews'],
			security: [{ Bearer: [] }],
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			const userId = (request.user as any).userId;

			const reviews = await prisma.review.findMany({
				where: { userId },
				include: {
					game: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			return { reviews };
		},
	});

	// Create review
	server.post('/', {
		schema: {
			tags: ['reviews'],
			security: [{ Bearer: [] }],
			body: {
				type: 'object',
				required: ['gameId', 'rating'],
				properties: {
					gameId: { type: 'string' },
					rating: { type: 'number', minimum: 1, maximum: 10 },
					content: { type: 'string' },
				},
			},
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			try {
				const userId = (request.user as any).userId;
				const { gameId, rating, content } = createReviewSchema.parse(request.body);

				// Check if game exists
				const game = await prisma.game.findUnique({ where: { id: gameId } });
				if (!game) {
					return reply.status(404).send({ error: 'Game not found' });
				}

				// Check if already reviewed
				const existing = await prisma.review.findUnique({
					where: {
						userId_gameId: { userId, gameId },
					},
				});

				if (existing) {
					return reply.status(400).send({ error: 'Already reviewed this game' });
				}

				const review = await prisma.review.create({
					data: {
						userId,
						gameId,
						rating,
						content,
					},
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
						game: true,
					},
				});

				return review;
			} catch (error) {
				if (error instanceof z.ZodError) {
					return reply.status(400).send({ error: error.errors });
				}
				throw error;
			}
		},
	});

	// Update review
	server.patch('/:reviewId', {
		schema: {
			tags: ['reviews'],
			security: [{ Bearer: [] }],
			params: {
				type: 'object',
				properties: {
					reviewId: { type: 'string' },
				},
			},
			body: {
				type: 'object',
				properties: {
					rating: { type: 'number', minimum: 1, maximum: 10 },
					content: { type: 'string' },
				},
			},
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			try {
				const userId = (request.user as any).userId;
				const { reviewId } = request.params as { reviewId: string };
				const data = updateReviewSchema.parse(request.body);

				const review = await prisma.review.findUnique({
					where: { id: reviewId },
				});

				if (!review) {
					return reply.status(404).send({ error: 'Review not found' });
				}

				if (review.userId !== userId) {
					return reply.status(403).send({ error: 'Forbidden' });
				}

				const updated = await prisma.review.update({
					where: { id: reviewId },
					data,
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
						game: true,
					},
				});

				return updated;
			} catch (error) {
				if (error instanceof z.ZodError) {
					return reply.status(400).send({ error: error.errors });
				}
				throw error;
			}
		},
	});

	// Delete review
	server.delete('/:reviewId', {
		schema: {
			tags: ['reviews'],
			security: [{ Bearer: [] }],
			params: {
				type: 'object',
				properties: {
					reviewId: { type: 'string' },
				},
			},
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			const userId = (request.user as any).userId;
			const { reviewId } = request.params as { reviewId: string };

			const review = await prisma.review.findUnique({
				where: { id: reviewId },
			});

			if (!review) {
				return reply.status(404).send({ error: 'Review not found' });
			}

			if (review.userId !== userId) {
				return reply.status(403).send({ error: 'Forbidden' });
			}

			await prisma.review.delete({
				where: { id: reviewId },
			});

			return { success: true };
		},
	});
}