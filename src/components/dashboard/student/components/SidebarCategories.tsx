"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Category {
	id: string;
	name: string;
	description?: string;
}

interface SidebarCategoriesProps {
	onSelectCategory: (category: Category) => void;
	selectedCategoryId: string | null;
}

export default function SidebarCategories({
	onSelectCategory,
	selectedCategoryId,
}: SidebarCategoriesProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchCategories() {
			try {
				const res = await fetch("/api/categories");
				const data = await res.json();

				if (!res.ok)
					throw new Error(data.error || "Failed to fetch categories");
				setCategories(data.categories || []);
			} catch (error) {
				console.error("Error fetching categories:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchCategories();
	}, []);

	return (
		<aside className="w-64 border-r bg-gray-50 dark:bg-primary-foreground h-[85vh] overflow-y-auto rounded-l-xl">
			<div className="p-4 border-b">
				<h2 className="text-lg font-semibold text-gray-800 dark:text-white">
					Complaint Categories
				</h2>
			</div>

			<div className="p-3 space-y-2">
				{loading ? (
					<div className="space-y-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-8 w-full rounded-md"
							/>
						))}
					</div>
				) : categories.length === 0 ? (
					<p className="text-sm text-gray-500 text-center py-4">
						No categories available
					</p>
				) : (
					categories.map((cat) => (
						<button
							key={cat.id}
							onClick={() => onSelectCategory(cat)}
							className={cn(
								"w-full text-left px-3 py-2 rounded-md transition-all duration-200",
								selectedCategoryId === cat.id
									? "bg-primary text-white"
									: "hover:bg-primary/10 dark:hover:bg-accent/20 text-gray-700 dark:text-gray-200"
							)}>
							<p className="font-medium">{cat.name}</p>
							{cat.description && (
								<p className="text-xs opacity-75 truncate">{cat.description}</p>
							)}
						</button>
					))
				)}
			</div>
		</aside>
	);
}
