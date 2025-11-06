import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "primary", size = "md", ...props }, ref) => {
		const variants = {
			primary: "bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,255,0.3)]",
			secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-[0_0_20px_rgba(255,0,255,0.3)]",
			ghost: "bg-transparent border border-primary/30 text-primary hover:bg-primary/10",
			danger: "bg-red-500 text-white hover:bg-red-600",
		};

		const sizes = {
			sm: "px-3 py-1.5 text-sm",
			md: "px-4 py-2",
			lg: "px-6 py-3 text-lg",
		};

		return (
			<button
				ref={ref}
				className={cn(
					"inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
					variants[variant],
					sizes[size],
					"disabled:opacity-50 disabled:cursor-not-allowed",
					className
				)}
				{...props}
			/>
		);
	}
);

Button.displayName = "Button";

export { Button };