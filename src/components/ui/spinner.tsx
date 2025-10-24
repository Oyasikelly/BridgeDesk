import React from "react";

export function Spinner({
	size = "md",
	color = "primary",
}: {
	size?: "sm" | "md" | "lg";
	color?: "primary" | "background" | "white";
}) {
	const sizeClasses =
		size === "sm"
			? "h-4 w-4 border-2"
			: size === "lg"
			? "h-10 w-10 border-4"
			: "h-6 w-6 border-4";

	const colorClasses =
		color === "primary"
			? "border-primary/30 border-t-primary"
			: color === "background"
			? "border-background/40 border-t-background"
			: "border-white/30 border-t-white";

	return (
		<div
			className={`${sizeClasses} ${colorClasses} rounded-full animate-spin`}
			role="status"
			aria-label="loading"
		/>
	);
}
