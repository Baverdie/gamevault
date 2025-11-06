import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full rounded-md border border-primary/30 bg-background/50 backdrop-blur-sm px-3 py-2 text-sm",
					"placeholder:text-foreground/50",
					"focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"transition-all duration-200",
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);

Input.displayName = "Input";

export { Input };