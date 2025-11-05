import Bull from 'bull';
import { config } from './env.js';
import { logger } from './logger.js';

export const emailQueue = new Bull('email', config.redisUrl);
export const cacheQueue = new Bull('cache', config.redisUrl);

// Email processor
emailQueue.process(async (job) => {
	const { to, subject, body } = job.data;
	logger.info(`📧 Sending email to ${to}: ${subject}`);

	// Simulate email sending
	await new Promise(resolve => setTimeout(resolve, 1000));

	logger.info(`✅ Email sent to ${to}`);
	return { success: true };
});

// Cache refresh processor
cacheQueue.process(async (job) => {
	const { type } = job.data;
	logger.info(`🔄 Refreshing cache: ${type}`);

	// Simulate cache refresh
	await new Promise(resolve => setTimeout(resolve, 500));

	logger.info(`✅ Cache refreshed: ${type}`);
	return { success: true };
});

// Error handling
emailQueue.on('failed', (job, err) => {
	logger.error(`❌ Email job failed: ${err.message}`);
});

cacheQueue.on('failed', (job, err) => {
	logger.error(`❌ Cache job failed: ${err.message}`);
});

logger.info('📦 Background queues initialized');