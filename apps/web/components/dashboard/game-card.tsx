import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserGame } from '@/lib/api';
import { Trash2, Clock } from 'lucide-react';

interface GameCardProps {
	userGame: UserGame;
	onDelete: (id: string) => void;
}

const statusColors = {
	BACKLOG: 'bg-yellow-500/20 text-yellow-500',
	PLAYING: 'bg-primary/20 text-primary',
	COMPLETED: 'bg-green-500/20 text-green-500',
	DROPPED: 'bg-red-500/20 text-red-500',
};

export function GameCard({ userGame, onDelete }: GameCardProps) {
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

			<div className="flex gap-2 mb-4">
				<span className={`text-xs px-2 py-1 rounded ${statusColors[userGame.status]}`}>
					{userGame.status}
				</span>
				{userGame.playtime && (
					<span className="text-xs px-2 py-1 rounded bg-foreground/10 flex items-center gap-1">
						<Clock className="w-3 h-3" />
						{userGame.playtime}h
					</span>
				)}
			</div>

			<div className="flex gap-2 flex-wrap mb-4">
				{userGame.game.genres.slice(0, 3).map((genre) => (
					<span key={genre} className="text-xs px-2 py-1 rounded bg-secondary/20 text-secondary">
						{genre}
					</span>
				))}
			</div>

			<Button
				variant="danger"
				size="sm"
				className="mt-auto"
				onClick={() => onDelete(userGame.gameId)}
			>
				<Trash2 className="w-4 h-4 mr-2" />
				Remove
			</Button>
		</Card>
	);
}