import Fastify, { FastifyInstance } from 'fastify';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { authRoutes } from '../../routes/auth.routes.js';
import { collectionRoutes } from '../../routes/collection.routes.js';
import jwt from '@fastify/jwt';
import { config } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';

describe('Collection Routes', () => {
	let server: FastifyInstance;
	let authToken: string;

	beforeAll(async () => {
		server = Fastify();

		await server.register(jwt, { secret: config.jwtSecret });

		server.decorate('authenticate', async function (request, reply) {
			try {
				await request.jwtVerify();
			} catch (err) {
				reply.status(401).send({ error: 'Unauthorized' });
			}
		});

		await server.register(authRoutes, { prefix: '/api/auth' });
		await server.register(collectionRoutes, { prefix: '/api/collection' });
		await server.ready();

		// Create test user and get token
		const id = Math.random().toString(36).substring(7);
		const response = await server.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				email: `coll${id}@example.com`,
				username: `col${id}`,
				password: 'password123',
			},
		});

		const body = JSON.parse(response.body);
		authToken = body.token;
	});

	afterAll(async () => {
		await server.close();
		await prisma.$disconnect();
	});

	it('should require authentication', async () => {
		const response = await server.inject({
			method: 'GET',
			url: '/api/collection',
		});

		expect(response.statusCode).toBe(401);
	});

	it('should get empty collection for new user', async () => {
		const response = await server.inject({
			method: 'GET',
			url: '/api/collection',
			headers: {
				authorization: `Bearer ${authToken}`,
			},
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body.games).toEqual([]);
		expect(body.pagination.total).toBe(0);
	});

	it('should add game to collection', async () => {
		const response = await server.inject({
			method: 'POST',
			url: '/api/collection',
			headers: {
				authorization: `Bearer ${authToken}`,
			},
			payload: {
				rawgId: 3328, // Super Mario Bros
				status: 'PLAYING',
				playtime: 10,
			},
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body).toHaveProperty('gameId');
		expect(body.status).toBe('PLAYING');
		expect(body.playtime).toBe(10);
	});

	it('should not add duplicate game', async () => {
		// Add game first time
		await server.inject({
			method: 'POST',
			url: '/api/collection',
			headers: {
				authorization: `Bearer ${authToken}`,
			},
			payload: {
				rawgId: 3498, // GTA V
				status: 'BACKLOG',
			},
		});

		// Try to add same game again
		const response = await server.inject({
			method: 'POST',
			url: '/api/collection',
			headers: {
				authorization: `Bearer ${authToken}`,
			},
			payload: {
				rawgId: 3498,
				status: 'PLAYING',
			},
		});

		expect(response.statusCode).toBe(400);
	});
});