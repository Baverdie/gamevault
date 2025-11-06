import axios from 'axios';

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Intercepteur qui s'exécute à chaque requête
api.interceptors.request.use((config) => {
	// Toujours checker le localStorage au moment de la requête
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
}, (error) => {
	return Promise.reject(error);
});

// Types
export interface User {
	id: string;
	email: string;
	username: string;
	createdAt: string;
}

export interface Game {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	released: string | null;
	rating: number | null;
	metacritic: number | null;
	imageUrl: string | null;
	genres: string[];
	platforms: string[];
}

export interface UserGame {
	id: string;
	gameId: string;
	status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED';
	playtime: number | null;
	addedAt: string;
	game: Game;
}

export interface Review {
	id: string;
	rating: number;
	content: string | null;
	createdAt: string;
	game: Game;
}

export interface Stats {
	totalGames: number;
	totalPlaytime: number;
	statusCount: {
		BACKLOG: number;
		PLAYING: number;
		COMPLETED: number;
		DROPPED: number;
	};
	topGenres: { genre: string; count: number }[];
	totalReviews: number;
	averageRating: number;
}