'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api, Stats, UserGame } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/stats-card';
import { GameSearch } from '@/components/dashboard/game-search';
import { GameCard } from '@/components/dashboard/game-card';
import { Card } from '@/components/ui/card';
import { Gamepad2, Star, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
	const router = useRouter();
	const { user, initialize } = useAuthStore();
	const [stats, setStats] = useState<Stats | null>(null);
	const [collection, setCollection] = useState<UserGame[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'collection' | 'search'>('collection');

	useEffect(() => {
		initialize();
	}, []);

	useEffect(() => {
		if (!user && !loading) {
			router.push('/login');
			return;
		}

		if (user && loading) {
			loadData();
		}
	}, [user]);

	const loadData = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				router.push('/login');
				return;
			}

			const [statsRes, collectionRes] = await Promise.all([
				api.get('/api/stats/me', {
					headers: { Authorization: `Bearer ${token}` }
				}),
				api.get('/api/collection', {
					headers: { Authorization: `Bearer ${token}` }
				}),
			]);

			setStats(statsRes.data);
			setCollection(collectionRes.data.games);
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteGame = async (gameId: string) => {
		try {
			const token = localStorage.getItem('token');
			await api.delete(`/api/collection/${gameId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setCollection(collection.filter((g) => g.gameId !== gameId));
			const statsRes = await api.get('/api/stats/me', {
				headers: { Authorization: `Bearer ${token}` }
			});
			setStats(statsRes.data);
		} catch (error) {
			console.error('Failed to delete game:', error);
		}
	};

	const handleUpdate = async () => {
		try {
			const token = localStorage.getItem('token');

			const [statsRes, collectionRes] = await Promise.all([
				api.get('/api/stats/me', {
					headers: { Authorization: `Bearer ${token}` }
				}),
				api.get('/api/collection', {
					headers: { Authorization: `Bearer ${token}` }
				}),
			]);

			setStats(statsRes.data);
			setCollection(collectionRes.data.games);
		} catch (error) {
			console.error('Failed to update data:', error);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Gamepad2 className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
					<p className="text-foreground/60">Loading your vault...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-2">
					Welcome back, <span className="text-primary">{user?.username}</span>
				</h1>
				<p className="text-foreground/60">Manage your game collection</p>
			</div>

			{/* Stats */}
			{stats && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<StatsCard
						title="Total Games"
						value={stats.totalGames}
						icon={Gamepad2}
						color="primary"
					/>
					<StatsCard
						title="Playtime"
						value={`${stats.totalPlaytime}h`}
						icon={Clock}
						color="secondary"
					/>
					<StatsCard
						title="Reviews"
						value={stats.totalReviews}
						icon={Star}
						color="primary"
					/>
					<StatsCard
						title="Avg Rating"
						value={stats.averageRating.toFixed(1)}
						icon={TrendingUp}
						color="secondary"
					/>
				</div>
			)}

			{/* Status Breakdown */}
			{stats && (
				<Card className="mb-8">
					<h2 className="text-xl font-bold mb-4">Collection Status</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<p className="text-foreground/60 text-sm mb-1">Backlog</p>
							<p className="text-2xl font-bold text-yellow-500">{stats.statusCount.BACKLOG}</p>
						</div>
						<div>
							<p className="text-foreground/60 text-sm mb-1">Playing</p>
							<p className="text-2xl font-bold text-primary">{stats.statusCount.PLAYING}</p>
						</div>
						<div>
							<p className="text-foreground/60 text-sm mb-1">Completed</p>
							<p className="text-2xl font-bold text-green-500">{stats.statusCount.COMPLETED}</p>
						</div>
						<div>
							<p className="text-foreground/60 text-sm mb-1">Dropped</p>
							<p className="text-2xl font-bold text-red-500">{stats.statusCount.DROPPED}</p>
						</div>
					</div>
				</Card>
			)}

			{/* Tabs */}
			<div className="flex gap-2 mb-6">
				<button
					onClick={() => setActiveTab('collection')}
					className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'collection'
						? 'bg-primary text-black'
						: 'bg-foreground/10 text-foreground/60 hover:bg-foreground/20'
						}`}
				>
					My Collection ({collection.length})
				</button>
				<button
					onClick={() => setActiveTab('search')}
					className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'search'
						? 'bg-secondary text-white'
						: 'bg-foreground/10 text-foreground/60 hover:bg-foreground/20'
						}`}
				>
					Add Games
				</button>
			</div>

			{/* Content */}
			{activeTab === 'collection' ? (
				collection.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{collection.map((userGame) => (
							<GameCard
								key={userGame.id}
								userGame={userGame}
								onDelete={handleDeleteGame}
								onUpdate={handleUpdate}
							/>
						))}
					</div>
				) : (
					<Card className="text-center py-12">
						<Gamepad2 className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
						<h3 className="text-xl font-bold mb-2">No games yet</h3>
						<p className="text-foreground/60 mb-4">Start building your collection!</p>
						<button
							onClick={() => setActiveTab('search')}
							className="text-primary hover:underline"
						>
							Search for games →
						</button>
					</Card>
				)
			) : (
				<GameSearch onGameAdded={handleUpdate} />
			)}
		</div>
	);
}