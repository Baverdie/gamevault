import Redis from 'ioredis';
import { config } from './env.js';

export const redis = new Redis(config.redisUrl, {
	maxRetriesPerRequest: 3,
	retryStrategy: (times) => {
		const delay = Math.min(times * 50, 2000);
		return delay;
	},
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('✅ Redis connected'));