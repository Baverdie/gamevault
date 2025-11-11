import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';

export async function statsRoutes(server: FastifyInstance) {
	// Get user stats
	server.get('/me', {
		schema: {
			tags: ['stats'],
			security: [{ Bearer: [] }],
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			const userId = (request.user as any).userId;

			// Check cache
			const cacheKey = `stats:${userId}`;
			const cached = await redis.get(cacheKey);

			if (cached) {
				return JSON.parse(cached);
			}

			// Get all user games with details
			const userGames = await prisma.userGame.findMany({
				where: { userId },
				include: {
					game: true,
				},
			});

			// Calculate stats
			const totalGames = userGames.length;
			const totalPlaytime = userGames.reduce((sum, ug) => sum + (ug.playtime || 0), 0);

			const statusCount = {
				BACKLOG: 0,
				PLAYING: 0,
				COMPLETED: 0,
				DROPPED: 0,
			};

			userGames.forEach((ug) => {
				statusCount[ug.status]++;
			});

			// Top genres
			const genreCounts: Record<string, number> = {};
			userGames.forEach((ug) => {
				ug.game.genres.forEach((genre) => {
					genreCounts[genre] = (genreCounts[genre] || 0) + 1;
				});
			});

			const topGenres = Object.entries(genreCounts)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 5)
				.map(([genre, count]) => ({ genre, count }));

			// Average rating
			const reviews = await prisma.review.findMany({
				where: { userId },
			});

			const avgRating = reviews.length > 0
				? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
				: 0;

			const stats = {
				totalGames,
				totalPlaytime,
				statusCount,
				topGenres,
				totalReviews: reviews.length,
				averageRating: Math.round(avgRating * 10) / 10,
			};

			// Cache for 5 minutes
			await redis.setex(cacheKey, 10, JSON.stringify(stats));

			return stats;
		},
	});

	// Get global stats
	server.get('/global', {
		schema: {
			tags: ['stats'],
		},
		handler: async (request, reply) => {
			// Check cache
			const cacheKey = 'stats:global';
			const cached = await redis.get(cacheKey);

			if (cached) {
				return JSON.parse(cached);
			}

			const [totalUsers, totalGames, totalReviews, totalCollections] = await Promise.all([
				prisma.user.count(),
				prisma.game.count(),
				prisma.review.count(),
				prisma.userGame.count(),
			]);

			// Most popular games
			const popularGamesData = await prisma.userGame.groupBy({
				by: ['gameId'],
				_count: {
					gameId: true,
				},
				orderBy: {
					_count: {
						gameId: 'desc',
					},
				},
				take: 10,
			});

			const popularGamesWithDetails = await Promise.all(
				popularGamesData.map(async (pg) => {
					const game = await prisma.game.findUnique({
						where: { id: pg.gameId },
					});
					return {
						game,
						userCount: pg._count.gameId,
					};
				})
			);

			const stats = {
				totalUsers,
				totalGames,
				totalReviews,
				totalCollections,
				popularGames: popularGamesWithDetails,
			};

			// Cache for 10 minutes
			await redis.setex(cacheKey, 600, JSON.stringify(stats));

			return stats;
		},
	});
}