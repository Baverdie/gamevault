'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gamepad2, BarChart3, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Home() {
	const [stats, setStats] = useState<any>(null);

	useEffect(() => {
		api.get('/api/stats/global').then((res) => setStats(res.data));
	}, []);

	return (
		<div className="container mx-auto px-4 py-16">
			{/* Hero Section */}
			<section className="text-center py-20 flex flex-col items-center">
				<div className="flex items-center gap-4 mb-4">
					<div className="inline-block animate-float">
						<Gamepad2 className="w-20 h-20 text-[#00ffff]" />
					</div>
					<h1
						className="text-8xl font-bold mb-6 inline-block"
						style={{
							background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ffff 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
							filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.5))',
						}}
					>
						GameVault
					</h1>
				</div>
				<p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
					Your ultimate gaming companion. Track your collection, review games, and discover what's next to play.
				</p>
				<div className="flex gap-4 justify-center">
					<Link href="/register">
						<Button variant="primary" size="lg">
							Get Started
							<Zap className="ml-2 w-5 h-5" />
						</Button>
					</Link>
					<Link href="/login">
						<Button variant="ghost" size="lg">
							Sign In
						</Button>
					</Link>
				</div>
			</section>

			{/* Stats */}
			{stats && (
				<section className="py-16">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<Card className="text-center">
							<Gamepad2 className="w-12 h-12 text-primary mx-auto mb-4" />
							<h3 className="text-3xl font-bold text-primary">{stats.totalGames}</h3>
							<p className="text-foreground/60">Games Tracked</p>
						</Card>
						<Card className="text-center">
							<Star className="w-12 h-12 text-secondary mx-auto mb-4" />
							<h3 className="text-3xl font-bold text-secondary">{stats.totalReviews}</h3>
							<p className="text-foreground/60">Reviews Written</p>
						</Card>
						<Card className="text-center">
							<BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
							<h3 className="text-3xl font-bold text-primary">{stats.totalUsers}</h3>
							<p className="text-foreground/60">Active Users</p>
						</Card>
						<Card className="text-center">
							<Gamepad2 className="w-12 h-12 text-secondary mx-auto mb-4" />
							<h3 className="text-3xl font-bold text-secondary">{stats.totalCollections}</h3>
							<p className="text-foreground/60">Collections</p>
						</Card>
					</div>
				</section>
			)}

			{/* Features */}
			<section className="py-16">
				<h2 className="text-4xl font-bold text-center mb-12">
					Everything You Need
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<Card>
						<Gamepad2 className="w-12 h-12 text-primary mb-4" />
						<h3 className="text-xl font-bold mb-2">Track Your Games</h3>
						<p className="text-foreground/70">
							Organize your collection with custom statuses: Backlog, Playing, Completed, or Dropped.
						</p>
					</Card>
					<Card>
						<Star className="w-12 h-12 text-secondary mb-4" />
						<h3 className="text-xl font-bold mb-2">Rate & Review</h3>
						<p className="text-foreground/70">
							Share your thoughts with ratings and detailed reviews for every game you play.
						</p>
					</Card>
					<Card>
						<BarChart3 className="w-12 h-12 text-primary mb-4" />
						<h3 className="text-xl font-bold mb-2">Analytics & Stats</h3>
						<p className="text-foreground/70">
							Get insights into your gaming habits with detailed statistics and analytics.
						</p>
					</Card>
				</div>
			</section>
		</div>
	);
}