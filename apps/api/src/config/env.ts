import dotenv from 'dotenv';

dotenv.config();

export const config = {
	port: parseInt(process.env.PORT || '3001', 10),
	nodeEnv: process.env.NODE_ENV || 'development',
	databaseUrl: process.env.DATABASE_URL!,
	redisUrl: process.env.REDIS_URL!,
	jwtSecret: process.env.JWT_SECRET!,
	rawgApiKey: process.env.RAWG_API_KEY!,
	frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};