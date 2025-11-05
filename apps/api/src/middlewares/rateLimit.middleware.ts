import { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../config/redis.js';

interface RateLimitOptions {
	maxRequests: number;
	windowMs: number;
}

export function rateLimit(options: RateLimitOptions) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const ip = request.ip;
		const key = `ratelimit:${ip}:${request.routeOptions.url}`;

		const current = await redis.get(key);

		if (current && parseInt(current, 10) >= options.maxRequests) {
			return reply.status(429).send({
				error: 'Too many requests',
				retryAfter: Math.ceil(options.windowMs / 1000),
			});
		}

		if (current) {
			await redis.incr(key);
		} else {
			await redis.setex(key, Math.ceil(options.windowMs / 1000), '1');
		}
	};
}