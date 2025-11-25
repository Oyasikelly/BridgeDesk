import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to fetch complaints for a student or category
 */
export function useComplaints(params: {
	studentId?: string;
	categoryId?: string;
}) {
	return useQuery({
		queryKey: ["complaints", params],
		queryFn: async () => {
			const searchParams = new URLSearchParams();
			if (params.studentId) searchParams.set("studentId", params.studentId);
			if (params.categoryId) searchParams.set("categoryId", params.categoryId);

			const res = await fetch(`/api/complaints?${searchParams}`);
			if (!res.ok) throw new Error("Failed to fetch complaints");
			return await res.json();
		},
		enabled: !!(params.studentId || params.categoryId),
		staleTime: 30 * 1000, // 30 seconds
	});
}

/**
 * Custom hook to fetch complaint summary for a student
 */
export function useComplaintSummary(studentId?: string) {
	return useQuery({
		queryKey: ["complaintSummary", studentId],
		queryFn: async () => {
			if (!studentId) throw new Error("No student ID");
			const res = await fetch(`/api/complaints/summary?studentId=${studentId}`);
			if (!res.ok) throw new Error("Failed to fetch summary");
			return await res.json();
		},
		enabled: !!studentId,
		staleTime: 30 * 1000, // 30 seconds
	});
}

/**
 * Custom hook to create a new complaint
 */
export function useCreateComplaint() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			title: string;
			description: string;
			categoryId: string;
			studentId: string;
		}) => {
			const res = await fetch("/api/complaints", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Failed to create complaint");
			return await res.json();
		},
		onSuccess: () => {
			// Invalidate and refetch complaints queries
			queryClient.invalidateQueries({ queryKey: ["complaints"] });
			queryClient.invalidateQueries({ queryKey: ["complaintSummary"] });
			queryClient.invalidateQueries({ queryKey: ["complaintBarChart"] });
		},
	});
}

/**
 * Custom hook to fetch all categories
 */
export function useCategories() {
	return useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await fetch("/api/categories");
			if (!res.ok) throw new Error("Failed to fetch categories");
			return await res.json();
		},
		staleTime: 5 * 60 * 1000, // 5 minutes (categories don't change often)
	});
}
