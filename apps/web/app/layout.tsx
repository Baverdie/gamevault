import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "GameVault - Manage Your Game Collection",
	description: "Track, review, and manage your video game collection",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Header />
				<main className="pt-16 min-h-screen">
					{children}
				</main>
			</body>
		</html>
	);
}