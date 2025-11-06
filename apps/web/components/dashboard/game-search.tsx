'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Search, Plus, Loader2 } from 'lucide-react';

interface GameSearchProps {
	onGameAdded?: () => void;
}

export function GameSearch({ onGameAdded }: GameSearchProps) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [addingGame, setAddingGame] = useState<number | null>(null);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!query.trim()) return;

		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const { data } = await api.get(`/api/games/search?q=${query}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setResults(data.results || []);
		} catch (error) {
			console.error('Search failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddGame = async (game: any) => {
		setAddingGame(game.id);
		try {
			const token = localStorage.getItem('token');
			await api.post('/api/collection', {
				rawgId: game.id,
				status: 'BACKLOG',
			}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			onGameAdded?.();
			setResults(results.filter((g) => g.id !== game.id));
		} catch (error) {
			console.error('Failed to add game:', error);
		} finally {
			setAddingGame(null);
		}
	};

	return (
		<div className="space-y-6">
			<form onSubmit={handleSearch} className="flex gap-2">
				<Input
					type="text"
					placeholder="Search for games..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="flex-1"
				/>
				<Button type="submit" variant="primary" disabled={loading}>
					{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
				</Button>
			</form>

			{results.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{results.map((game) => (
						<Card key={game.id} className="flex flex-col">
							{game.background_image && (
								<img
									src={game.background_image}
									alt={game.name}
									className="w-full h-40 object-cover rounded-t-xl mb-4"
								/>
							)}
							<h3 className="font-bold text-lg mb-2">{game.name}</h3>
							<div className="flex gap-2 flex-wrap mb-4">
								{game.genres?.slice(0, 2).map((genre: any) => (
									<span
										key={genre.id}
										className="text-xs px-2 py-1 rounded bg-primary/20 text-primary"
									>
										{genre.name}
									</span>
								))}
							</div>
							<Button
								variant="primary"
								size="sm"
								className="mt-auto"
								onClick={() => handleAddGame(game)}
								disabled={addingGame === game.id}
							>
								{addingGame === game.id ? (
									<Loader2 className="w-4 h-4 animate-spin mr-2" />
								) : (
									<Plus className="w-4 h-4 mr-2" />
								)}
								Add to Collection
							</Button>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}