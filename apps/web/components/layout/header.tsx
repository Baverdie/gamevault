'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Gamepad2, LogOut, User } from 'lucide-react';

export function Header() {
	const { user, logout } = useAuthStore();

	return (
		<header className="fixed top-0 w-full z-50 border-b border-primary/20 bg-background/80 backdrop-blur-md">
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2 group">
					<Gamepad2 className="w-8 h-8 text-primary group-hover:animate-pulse" />
					<span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						GameVault
					</span>
				</Link>

				<nav className="flex items-center gap-4">
					{user ? (
						<>
							<Link href="/dashboard">
								<Button variant="ghost" size="sm">
									<User className="w-4 h-4 mr-2" />
									{user.username}
								</Button>
							</Link>
							<Button variant="ghost" size="sm" onClick={logout}>
								<LogOut className="w-4 h-4 mr-2" />
								Logout
							</Button>
						</>
					) : (
						<>
							<Link href="/login">
								<Button variant="ghost" size="sm">Login</Button>
							</Link>
							<Link href="/register">
								<Button variant="primary" size="sm">Sign Up</Button>
							</Link>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}