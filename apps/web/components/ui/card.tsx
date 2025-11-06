import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"rounded-xl border border-primary/20 bg-background/40 backdrop-blur-md p-6",
				"shadow-[0_0_30px_rgba(0,255,255,0.1)]",
				"transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(0,255,255,0.2)]",
				className
			)}
			{...props}
		/>
	)
);

Card.displayName = "Card";

export { Card };