import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const addGameSchema = z.object({
	rawgId: z.number(),
	status: z.enum(['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED']).default('BACKLOG'),
	playtime: z.number().min(0).optional(),
});

const updateGameSchema = z.object({
	status: z.enum(['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED']).optional(),
	playtime: z.number().min(0).optional(),
});

export async function collectionRoutes(server: FastifyInstance) {
	// Add the authenticate decorator if not already added
	server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			// Replace the following line with your actual authentication logic
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});
	// Get user collection
	server.get('/', {
		schema: {
			tags: ['collection'],
			security: [{ Bearer: [] }],
			querystring: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED'] },
					limit: { type: 'string' },
					offset: { type: 'string' },
				},
			},
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			const userId = (request.user as any).userId;
			const query = request.query as any;

			const limit = parseInt(query.limit || '20', 10);
			const offset = parseInt(query.offset || '0', 10);
			const status = query.status;

			const where: any = { userId };
			if (status) {
				where.status = status;
			}

			const [games, total] = await Promise.all([
				prisma.userGame.findMany({
					where,
					include: {
						game: true,
					},
					orderBy: { addedAt: 'desc' },
					take: limit,
					skip: offset,
				}),
				prisma.userGame.count({ where }),
			]);

			return {
				games,
				pagination: {
					total,
					limit,
					offset,
					hasMore: offset + limit < total,
				},
			};
		},
	});

	// Add game to collection
	server.post('/', {
		schema: {
			tags: ['collection'],
			security: [{ Bearer: [] }],
			body: {
				type: 'object',
				required: ['rawgId'],
				properties: {
					rawgId: { type: 'number' },
					status: { type: 'string', enum: ['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED'] },
					playtime: { type: 'number' },
				},
			},
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			try {
				const userId = (request.user as any).userId;
				const { rawgId, status, playtime } = addGameSchema.parse(request.body);

				// Check if already in collection
				const existing = await prisma.userGame.findFirst({
					where: { userId, game: { rawgId } },
				});

				if (existing) {
					return reply.status(400).send({ error: 'Game already in collection' });
				}

				// Fetch game details from RAWG or cache
				let game = await prisma.game.findUnique({ where: { rawgId } });

				if (!game) {
					// Fetch from RAWG API
					const response = await fetch(
						`https://api.rawg.io/api/games/${rawgId}?key=${process.env.RAWG_API_KEY}`
					);

					if (!response.ok) {
						return reply.status(404).send({ error: 'Game not found' });
					}

					interface RawgGameResponse {
						name: string;
						slug: string;
						description_raw: string;
						released?: string;
						rating: number;
						metacritic: number;
						background_image: string;
						genres?: { name: string }[];
						platforms?: { platform: { name: string } }[];
					}

					const rawgData = (await response.json()) as RawgGameResponse;

					// Save game to DB
					game = await prisma.game.create({
						data: {
							rawgId,
							name: rawgData.name,
							slug: rawgData.slug,
							description: rawgData.description_raw,
							released: rawgData.released ? new Date(rawgData.released) : null,
							rating: rawgData.rating,
							metacritic: rawgData.metacritic,
							imageUrl: rawgData.background_image,
							genres: rawgData.genres?.map((g: any) => g.name) || [],
							platforms: rawgData.platforms?.map((p: any) => p.platform.name) || [],
						},
					});
				}

				// Add to user collection
				const userGame = await prisma.userGame.create({
					data: {
						userId,
						gameId: game.id,
						status,
						playtime,
					},
					include: {
						game: true,
					},
				});

				return userGame;
			} catch (error) {
				if (error instanceof z.ZodError) {
					return reply.status(400).send({ error: error.errors });
				}
				throw error;
			}
		},
	});

	// Update game in collection
	server.patch('/:gameId', {
		schema: {
			tags: ['collection'],
			security: [{ Bearer: [] }],
			params: {
				type: 'object',
				properties: {
					gameId: { type: 'string' },
				},
			},
			body: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED'] },
					playtime: { type: 'number' },
				},
			},
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			try {
				const userId = (request.user as any).userId;
				const { gameId } = request.params as { gameId: string };
				const data = updateGameSchema.parse(request.body);

				const userGame = await prisma.userGame.findFirst({
					where: { userId, gameId },
				});

				if (!userGame) {
					return reply.status(404).send({ error: 'Game not in collection' });
				}

				const updated = await prisma.userGame.update({
					where: { id: userGame.id },
					data,
					include: {
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

	// Remove game from collection
	server.delete('/:gameId', {
		schema: {
			tags: ['collection'],
			security: [{ Bearer: [] }],
			params: {
				type: 'object',
				properties: {
					gameId: { type: 'string' },
				},
			},
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			const userId = (request.user as any).userId;
			const { gameId } = request.params as { gameId: string };

			const userGame = await prisma.userGame.findFirst({
				where: { userId, gameId },
			});

			if (!userGame) {
				return reply.status(404).send({ error: 'Game not in collection' });
			}

			await prisma.userGame.delete({
				where: { id: userGame.id },
			});

			return { success: true };
		},
	});
}