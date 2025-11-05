import Fastify, { FastifyInstance } from 'fastify';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { authRoutes } from '../../routes/auth.routes.js';
import jwt from '@fastify/jwt';
import { config } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';

describe('Auth Routes', () => {
	let server: FastifyInstance;

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
		await server.ready();
	});

	afterAll(async () => {
		await server.close();
		await prisma.$disconnect();
	});

	it('should register a new user', async () => {
		const id = Math.random().toString(36).substring(7); // Short random string
		const response = await server.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				email: `test${id}@example.com`,
				username: `user${id}`,
				password: 'password123',
			},
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body).toHaveProperty('token');
		expect(body).toHaveProperty('user');
		expect(body.user).toHaveProperty('email');
		expect(body.user.email).toBe(`test${id}@example.com`);
	});

	it('should not register user with invalid email', async () => {
		const response = await server.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				email: 'invalid-email',
				username: 'testuser',
				password: 'password123',
			},
		});

		expect(response.statusCode).toBe(400);
	});

	it('should not register duplicate user', async () => {
		const id = Math.random().toString(36).substring(7);
		const email = `dup${id}@example.com`;

		// First registration
		await server.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				email,
				username: `usr${id}`,
				password: 'password123',
			},
		});

		// Try to register again
		const response = await server.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				email,
				username: `usr${id}2`,
				password: 'password123',
			},
		});

		expect(response.statusCode).toBe(400);
	});

	it('should login existing user', async () => {
		const id = Math.random().toString(36).substring(7);
		const email = `login${id}@example.com`;
		const password = 'password123';

		// First register
		await server.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				email,
				username: `log${id}`,
				password,
			},
		});

		// Then login
		const response = await server.inject({
			method: 'POST',
			url: '/api/auth/login',
			payload: {
				email,
				password,
			},
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.body);
		expect(body).toHaveProperty('token');
		expect(body.user.email).toBe(email);
	});

	it('should not login with wrong password', async () => {
		const id = Math.random().toString(36).substring(7);
		const email = `wrong${id}@example.com`;

		// Register first
		await server.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				email,
				username: `wrg${id}`,
				password: 'correctpassword',
			},
		});

		// Try login with wrong password
		const response = await server.inject({
			method: 'POST',
			url: '/api/auth/login',
			payload: {
				email,
				password: 'wrongpassword',
			},
		});

		expect(response.statusCode).toBe(401);
	});
});