import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
	id: string;
	message: string;
	senderId: string;
	timestamp: string;
	isStaff: boolean; // Computed on server or frontend
}

export function useChat(complaintId: string) {
	const queryClient = useQueryClient();

	const messagesQuery = useQuery({
		queryKey: ["chat", complaintId],
		queryFn: async () => {
			if (!complaintId) return [];
			// This endpoint might need to be adjusted to support both student/admin paths or a unified one
			const res = await fetch(`/api/chat/messages?complaintId=${complaintId}`);
			if (!res.ok) throw new Error("Failed to load messages");
			return (await res.json()) as ChatMessage[];
		},
		enabled: !!complaintId,
		refetchInterval: 5000, // Poll every 5s for now (websocket is better but out of scope)
	});

	const sendMessageMutation = useMutation({
		mutationFn: async (data: { message: string; senderId: string, role: string }) => {
			const res = await fetch("/api/chat/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...data, complaintId }),
			});
			if (!res.ok) throw new Error("Failed to send message");
			return await res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chat", complaintId] });
		},
	});

	return {
		messages: messagesQuery.data ?? [],
		isLoading: messagesQuery.isLoading,
		sendMessage: sendMessageMutation,
	};
}

export function useComplaint(id: string) {
    return useQuery({
        queryKey: ["complaint", id],
        queryFn: async () => {
            const res = await fetch(`/api/complaints/${id}`); // Assumes universal access endpoint or role-checked
            if (!res.ok) throw new Error("Complaint not found");
            return await res.json();
        },
        enabled: !!id,
    });
}

export function useNotifications(userId?: string, role?: "ADMIN" | "STUDENT") {
    const queryClient = useQueryClient();
    const queryKey = ["notifications", userId, role];

    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!userId || !role) return [];
            const param = role === "ADMIN" ? `adminId=${userId}` : `studentId=${userId}`;
            const res = await fetch(`/api/notifications?${param}`);
            if (!res.ok) throw new Error("Failed to load notifications");
            const json = await res.json();
            return (json.notifications || []) as any[];
        },
        enabled: !!userId && !!role,
        refetchInterval: 10000, // Poll every 10s
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const unreadCount = data?.filter((n: any) => !n.isRead).length ?? 0;

    return {
        notifications: data || [],
        isLoading,
        unreadCount,
        markAsRead: markAsReadMutation.mutate,
    };
}
