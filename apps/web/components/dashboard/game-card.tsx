'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserGame } from '@/lib/api';
import { Trash2, Star, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface GameCardProps {
	userGame: UserGame;
	onDelete: (gameId: string) => void;
	onUpdate: () => void;
}

const statusColors = {
	BACKLOG: 'bg-yellow-500/20 text-yellow-500',
	PLAYING: 'bg-primary/20 text-primary',
	COMPLETED: 'bg-green-500/20 text-green-500',
	DROPPED: 'bg-red-500/20 text-red-500',
};

const STATUS_OPTIONS = [
	{ value: 'BACKLOG', label: '📚 Backlog' },
	{ value: 'PLAYING', label: '🎮 Playing' },
	{ value: 'COMPLETED', label: '✅ Completed' },
	{ value: 'DROPPED', label: '❌ Dropped' },
];

export function GameCard({ userGame, onDelete, onUpdate }: GameCardProps) {
	const [showReview, setShowReview] = useState(false);
	const [rating, setRating] = useState(5);
	const [content, setContent] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleStatusChange = async (newStatus: string) => {
		try {
			const token = localStorage.getItem('token');
			await api.patch(
				`/api/collection/${userGame.gameId}`,
				{ status: newStatus },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			onUpdate();
		} catch (error) {
			console.error('Failed to update status:', error);
		}
	};

	const handleSubmitReview = async () => {
		setSubmitting(true);
		try {
			const token = localStorage.getItem('token');
			await api.post(
				'/api/reviews',
				{
					gameId: userGame.gameId,
					rating,
					content: content || null,
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setShowReview(false);
			setContent('');
			onUpdate();
		} catch (error) {
			console.error('Failed to submit review:', error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Card className="flex flex-col">
			{userGame.game.imageUrl && (
				<img
					src={userGame.game.imageUrl}
					alt={userGame.game.name}
					className="w-full h-40 object-cover rounded-t-xl mb-4"
				/>
			)}

			<h3 className="font-bold text-lg mb-2">{userGame.game.name}</h3>

			{/* Status Dropdown */}
			<select
				value={userGame.status}
				onChange={(e) => handleStatusChange(e.target.value)}
				className={`w-full mb-3 px-3 py-2 rounded-lg ${statusColors[userGame.status]} border-none cursor-pointer font-medium`}
			>
				{STATUS_OPTIONS.map((opt) => (
					<option key={opt.value} value={opt.value} className="bg-background text-foreground">
						{opt.label}
					</option>
				))}
			</select>

			{/* Playtime */}
			{userGame.playtime && (
				<div className="flex items-center gap-1 text-sm text-foreground/60 mb-3">
					<Clock className="w-4 h-4" />
					{userGame.playtime}h played
				</div>
			)}

			{/* Genres */}
			<div className="flex gap-2 flex-wrap mb-4">
				{userGame.game.genres.slice(0, 3).map((genre) => (
					<span key={genre} className="text-xs px-2 py-1 rounded bg-secondary/20 text-secondary">
						{genre}
					</span>
				))}
			</div>

			{/* Actions */}
			<div className="flex gap-2 mt-auto">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setShowReview(!showReview)}
					className="flex-1"
				>
					<Star className="w-4 h-4 mr-2" />
					Review
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDelete(userGame.gameId)}
					className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
				>
					<Trash2 className="w-4 h-4" />
				</Button>
			</div>

			{/* Review Form */}
			{showReview && (
				<div className="mt-4 pt-4 border-t border-foreground/10 space-y-3">
					<div>
						<label className="block text-sm font-medium mb-2">
							Rating: {rating}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={rating}
							onChange={(e) => setRating(Number(e.target.value))}
							className="w-full"
						/>
						<div className="flex gap-1 mt-2">
							{[...Array(10)].map((_, i) => (
								<Star
									key={i}
									className={`w-4 h-4 ${i < rating ? 'fill-primary text-primary' : 'text-foreground/20'}`}
								/>
							))}
						</div>
					</div>

					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Write your review (optional)..."
						className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none"
						rows={3}
					/>

					<div className="flex gap-2">
						<Button
							onClick={handleSubmitReview}
							disabled={submitting}
							variant="primary"
							size="sm"
							className="flex-1"
						>
							{submitting ? 'Submitting...' : 'Submit Review'}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowReview(false)}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
}