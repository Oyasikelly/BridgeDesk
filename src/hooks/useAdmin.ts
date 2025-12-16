import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("No active session");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
    };
}

export function useAdmin() {
    // 1. Admin Analytics (Dashboard)
    const useAnalytics = () => {
        return useQuery({
            queryKey: ["admin", "analytics"],
            queryFn: async () => {
                const headers = await getAuthHeaders();
                const res = await fetch("/api/admin/analytics", { headers });
                if (!res.ok) throw new Error("Failed to fetch analytics");
                return await res.json();
            },
        });
    };

    // 2. Fetch Students (List)
    const useStudents = () => {
        return useQuery({
            queryKey: ["admin", "students"],
            queryFn: async () => {
                const headers = await getAuthHeaders();
                const res = await fetch("/api/admin/students", { headers });
                if (!res.ok) throw new Error("Failed to fetch students");
                return await res.json();
            },
        });
    };

    // 3. Fetch Single Student
    const useStudent = (id: string) => {
        return useQuery({
            queryKey: ["admin", "student", id],
            queryFn: async () => {
                const headers = await getAuthHeaders();
                const res = await fetch(`/api/admin/students/${id}`, { headers });
                if (!res.ok) throw new Error("Failed to fetch student details");
                return await res.json();
            },
            enabled: !!id,
        });
    };

    // 4. Chat - Fetch Students
    const useChatStudents = (adminId?: string) => {
        return useQuery({
            queryKey: ["admin", "chat", "students", adminId],
            queryFn: async () => {
                if (!adminId) return { students: [] };
                const headers = await getAuthHeaders();
                const res = await fetch(`/api/admin/chat/students?adminId=${adminId}`, { headers });
                if (!res.ok) throw new Error("Failed to fetch students");
                return await res.json();
            },
            enabled: !!adminId,
        });
    };

    // 5. Chat - Fetch Complaints
    const useChatComplaints = (adminId?: string, studentId?: string) => {
        return useQuery({
            queryKey: ["admin", "chat", "complaints", adminId, studentId],
            queryFn: async () => {
                if (!adminId || !studentId) return { complaints: [] };
                const headers = await getAuthHeaders();
                const res = await fetch(
                    `/api/admin/chat/complaints?adminId=${adminId}&studentId=${studentId}`,
                    { headers }
                );
                if (!res.ok) throw new Error("Failed to fetch complaints");
                return await res.json();
            },
            enabled: !!adminId && !!studentId,
        });
    };

    // 6. Chat - Fetch Messages
    const useChatMessages = (adminId?: string, complaintId?: string) => {
        return useQuery({
            queryKey: ["admin", "chat", "messages", adminId, complaintId],
            queryFn: async () => {
                if (!adminId || !complaintId) return [];
                const headers = await getAuthHeaders();
                const res = await fetch(
                    `/api/admin/chat/messages?adminId=${adminId}&complaintId=${complaintId}`,
                    { headers }
                );
                if (!res.ok) throw new Error("Failed to fetch messages");
                const data = await res.json();
                return data; 
            },
            enabled: !!adminId && !!complaintId,
            refetchInterval: 5000,
        });
    };

    // 7. Admin Sidebar Stats
    const useAdminComplaints = (adminId?: string) => {
        return useQuery({
            queryKey: ["admin", "sidebar", "complaints", adminId],
            queryFn: async () => {
                 if (!adminId) return { complaints: [] };
                 const headers = await getAuthHeaders();
                 const res = await fetch(`/api/admin/complaints?adminId=${adminId}`, { headers });
                 if (!res.ok) throw new Error("Failed to fetch admin stats");
                 return await res.json();
            },
            enabled: !!adminId,
            staleTime: 30000
        });
    }

    return {
        useAnalytics,
        useStudents,
        useStudent,
        useChatStudents,
        useChatComplaints,
        useChatMessages,
        useAdminComplaints
    };
}
