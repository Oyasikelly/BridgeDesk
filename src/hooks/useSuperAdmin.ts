import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface OrgStats {
	totalComplaints: number;
	totalStudents: number;
	totalAdmins: number;
	activeComplaints: number;
	resolvedCount: number;
	pendingCount: number;
	inReviewCount: number;
	rejectedCount: number;
	complaintStats: { name: string; value: number }[];
	monthlyData: { month: string; complaints: number }[];
	departmentData: { name: string; complaints: number }[];
}

export interface Category {
	id: string;
	name: string;
	description?: string;
	admin?: {
		id: string;
		fullName: string;
	}[];
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

	// 5. Fetch All Admins (to assign them)
	const useAllAdmins = () => {
		return useQuery({
			queryKey: ["admins", "all"],
			queryFn: async () => {
				const res = await fetch("/api/admin/list?role=ADMIN_ALL");
				if (!res.ok) throw new Error("Failed to fetch admins");
				const data = await res.json();
				return data.admins as { id: string; fullName: string; email: string }[];
			},
		});
	};

	// 6. Fetch Departments (Scoped to Org)
	const useDepartments = () => {
		return useQuery({
			queryKey: ["departments", "org-view"],
			queryFn: async () => {
				const res = await fetch("/api/departments");
				if (!res.ok) throw new Error("Failed to fetch departments");
				const data = await res.json();
				return data.departments as { id: string; name: string; description?: string }[];
			},
		});
	};

	// 7. Create Department
	const useCreateDepartment = () => {
		return useMutation({
			mutationFn: async (data: { name: string; description?: string }) => {
				const res = await fetch("/api/departments", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
				if (!res.ok) throw new Error("Failed to create department");
				return await res.json();
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["departments"] });
			},
		});
	};

	// 8. Fetch Users (Admins or Students)
	const useUsers = (role: "ADMIN" | "STUDENT" | "ALL" = "ALL") => {
		return useQuery({
			queryKey: ["users", "list", role],
			queryFn: async () => {
				const res = await fetch(`/api/admin/list?role=${role === "ALL" ? "ADMIN_ALL" : role}`);
				if (!res.ok) throw new Error("Failed to fetch users");
				const data = await res.json();
				return data.users as { 
                    id: string; 
                    userId: string; 
                    fullName: string; 
                    email: string; 
                    role: string;
                    status: string;
                }[];
			},
		});
	};

	// 9. Fetch Activity Logs
	const useActivityLogs = () => {
		return useQuery({
			queryKey: ["activity", "logs"],
			queryFn: async () => {
				const res = await fetch("/api/admin/activity");
				if (!res.ok) throw new Error("Failed to fetch activity logs");
				const data = await res.json();
				return data.logs as {
					id: string;
					action: string;
					timestamp: string;
					ipAddress?: string;
					admin?: { fullName: string; email: string };
					student?: { fullName: string; email: string };
				}[];
			},
		});
	};

	// 10. Send Broadcast Notification
	const useSendBroadcast = () => {
		return useMutation({
			mutationFn: async (data: { title: string; message: string; type: string; target: string }) => {
				const res = await fetch("/api/admin/broadcast", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
				if (!res.ok) throw new Error("Failed to send broadcast");
				return await res.json();
			},
		});
	};

	// 11. Fetch Organization Details
	const useOrgDetails = () => {
		return useQuery({
			queryKey: ["organization", "details"],
			queryFn: async () => {
				const res = await fetch("/api/admin/settings");
				if (!res.ok) throw new Error("Failed to fetch organization details");
				const data = await res.json();
				return data.organization as {
					id: string;
					name: string;
					email?: string;
					phone?: string;
					address?: string;
					isActive: boolean;
				};
			},
		});
	};

	// 12. Update Organization Details
	const useUpdateOrg = () => {
		return useMutation({
			mutationFn: async (data: { name?: string; email?: string; phone?: string; address?: string }) => {
				const res = await fetch("/api/admin/settings", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
				if (!res.ok) throw new Error("Failed to update organization");
				return await res.json();
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["organization"] });
			},
		});
	};

	return {
		useOrgStats,
		useCategories,
		useAssignAdmin,
		useCreateCategory,
		useAllAdmins,
		useDepartments,
		useCreateDepartment,
		useUsers,
		useActivityLogs,
		useSendBroadcast,
		useOrgDetails,
		useUpdateOrg,
	};
}
