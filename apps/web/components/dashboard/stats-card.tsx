import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	color?: 'primary' | 'secondary';
}

export function StatsCard({ title, value, icon: Icon, color = 'primary' }: StatsCardProps) {
	const colorClass = color === 'primary' ? 'text-primary' : 'text-secondary';

	return (
		<Card className="text-center">
			<Icon className={`w-10 h-10 ${colorClass} mx-auto mb-3`} />
			<h3 className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</h3>
			<p className="text-foreground/60 text-sm">{title}</p>
		</Card>
	);
}