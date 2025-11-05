import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';

const registerSchema = z.object({
	email: z.string().email(),
	username: z.string().min(3).max(20),
	password: z.string().min(8),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export async function authRoutes(server: FastifyInstance) {
	// Register
	server.post('/register', {
		schema: {
			tags: ['auth'],
			body: {
				type: 'object',
				required: ['email', 'username', 'password'],
				properties: {
					email: { type: 'string', format: 'email' },
					username: { type: 'string' },
					password: { type: 'string' },
				},
			},
		},
		handler: async (request, reply) => {
			try {
				const { email, username, password } = registerSchema.parse(request.body);

				// Check if user exists
				const existingUser = await prisma.user.findFirst({
					where: { OR: [{ email }, { username }] },
				});

				if (existingUser) {
					return reply.status(400).send({ error: 'User already exists' });
				}

				// Hash password
				const hashedPassword = await bcrypt.hash(password, 10);

				// Create user
				const user = await prisma.user.create({
					data: {
						email,
						username,
						password: hashedPassword,
					},
					select: {
						id: true,
						email: true,
						username: true,
						createdAt: true,
					},
				});

				// Generate token
				const token = server.jwt.sign({ userId: user.id });

				return { user, token };
			} catch (error) {
				if (error instanceof z.ZodError) {
					return reply.status(400).send({ error: error.errors });
				}
				throw error;
			}
		},
	});

	// Login
	server.post('/login', {
		schema: {
			tags: ['auth'],
			body: {
				type: 'object',
				required: ['email', 'password'],
				properties: {
					email: { type: 'string', format: 'email' },
					password: { type: 'string' },
				},
			},
		},
		handler: async (request, reply) => {
			try {
				const { email, password } = loginSchema.parse(request.body);

				// Find user
				const user = await prisma.user.findUnique({ where: { email } });

				if (!user) {
					return reply.status(401).send({ error: 'Invalid credentials' });
				}

				// Check password
				const validPassword = await bcrypt.compare(password, user.password);

				if (!validPassword) {
					return reply.status(401).send({ error: 'Invalid credentials' });
				}

				// Generate token
				const token = server.jwt.sign({ userId: user.id });

				return {
					user: {
						id: user.id,
						email: user.email,
						username: user.username,
					},
					token,
				};
			} catch (error) {
				if (error instanceof z.ZodError) {
					return reply.status(400).send({ error: error.errors });
				}
				throw error;
			}
		},
	});

	// Get current user
	server.get('/me', {
		schema: {
			tags: ['auth'],
			security: [{ Bearer: [] }],
		},
		onRequest: [server.authenticate],
		handler: async (request, reply) => {
			const user = await prisma.user.findUnique({
				where: { id: (request.user as any).userId },
				select: {
					id: true,
					email: true,
					username: true,
					createdAt: true,
				},
			});

			if (!user) {
				return reply.status(404).send({ error: 'User not found' });
			}

			return { user };
		},
	});
}