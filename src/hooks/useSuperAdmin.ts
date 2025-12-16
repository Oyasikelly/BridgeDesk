import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface OrgStats {
	totalComplaints: number;
	totalStudents: number;
	totalAdmins: number;
	activeComplaints: number;
}

interface Category {
	id: string;
	name: string;
	description?: string;
	adminId?: string;
	admin?: {
		id: string;
		fullName: string;
	};
}

export function useSuperAdmin() {
	const queryClient = useQueryClient();

	// 1. Global Analytics
	const useOrgStats = () => {
		return useQuery({
			queryKey: ["super-admin", "stats"],
			queryFn: async () => {
				const res = await fetch("/api/admin/analytics?scope=global");
				if (!res.ok) throw new Error("Failed to fetch global stats");
				return (await res.json()) as OrgStats;
			},
		});
	};

	// 2. Fetch All Categories (with assigned admins)
	const useCategories = () => {
		return useQuery({
			queryKey: ["categories", "admin-view"],
			queryFn: async () => {
				const res = await fetch("/api/categories?includeAdmins=true");
				if (!res.ok) throw new Error("Failed to fetch categories");
				const data = await res.json();
				return data.categories as Category[];
			},
		});
	};

	// 3. Assign Admin to Category
	const useAssignAdmin = () => {
		return useMutation({
			mutationFn: async ({
				categoryId,
				adminId,
			}: {
				categoryId: string;
				adminId: string | null;
			}) => {
				const res = await fetch(`/api/categories`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ categoryId, adminId }),
				});
				if (!res.ok) throw new Error("Failed to assign admin");
				return await res.json();
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["categories"] });
			},
		});
	};

    // 4. Create Category
    const useCreateCategory = () => {
        return useMutation({
            mutationFn: async (data: { name: string; description?: string }) => {
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error("Failed to create category");
                return await res.json();
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["categories"] });
            }
        });
    };

	return {
		useOrgStats,
		useCategories,
		useAssignAdmin,
        useCreateCategory
	};
}
