import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
	id: string;
	email: string;
	username: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	setAuth: (user: User, token: string) => void;
	logout: () => void;
	initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			setAuth: (user, token) => {
				if (typeof window !== 'undefined') {
					localStorage.setItem('token', token);
					localStorage.setItem('user', JSON.stringify(user));
				}
				set({ user, token });
			},
			logout: () => {
				if (typeof window !== 'undefined') {
					localStorage.removeItem('token');
					localStorage.removeItem('user');
				}
				set({ user: null, token: null });
			},
			initialize: () => {
				if (typeof window !== 'undefined') {
					const token = localStorage.getItem('token');
					const userStr = localStorage.getItem('user');
					if (token && userStr) {
						try {
							set({ token, user: JSON.parse(userStr) });
						} catch (e) {
							console.error('Failed to parse user from localStorage');
						}
					}
				}
			},
		}),
		{
			name: 'auth-storage',
		}
	)
);