'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
	const router = useRouter();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [form, setForm] = useState({
		email: '',
		password: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const { data } = await api.post('/api/auth/login', form);
			setAuth(data.user, data.token);
			router.push('/dashboard');
		} catch (err: any) {
			setError(err.response?.data?.error || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<div className="text-center mb-8">
					<LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
					<h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
					<p className="text-foreground/60">Sign in to your account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
							{error}
						</div>
					)}

					<div>
						<label className="block text-sm font-medium mb-2">Email</label>
						<Input
							type="email"
							placeholder="you@example.com"
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Password</label>
						<Input
							type="password"
							placeholder="••••••••"
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
							required
						/>
					</div>

					<Button type="submit" variant="primary" className="w-full" disabled={loading}>
						{loading ? 'Signing in...' : 'Sign In'}
					</Button>

					<p className="text-center text-sm text-foreground/60">
						Don't have an account?{' '}
						<Link href="/register" className="text-primary hover:underline">
							Sign up
						</Link>
					</p>
				</form>
			</Card>
		</div>
	);
}