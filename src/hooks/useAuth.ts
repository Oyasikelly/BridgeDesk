import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, logoutUser } from "@/lib/auth";
import { LoginCredentials, RegisterCredentials } from "@/types/auth";
import toast from "react-hot-toast";

export function useAuth() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const loginMutation = useMutation({
		mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
		onSuccess: (data) => {
			toast.success("Login successful!");
			queryClient.setQueryData(["user"], data.user);
			// Redirect is handled by the component or context usually, but we can do it here if standard
		},
		onError: (error: Error) => {
			toast.error(error.message || "Login failed");
		},
	});

	const registerMutation = useMutation({
		mutationFn: (credentials: RegisterCredentials) => registerUser(credentials),
		onSuccess: () => {
			toast.success("Registration successful! Please check email.");
			// Usually redirect to verify email or login
		},
		onError: (error: Error) => {
			toast.error(error.message || "Registration failed");
		},
	});

	const logoutMutation = useMutation({
		mutationFn: logoutUser,
		onSuccess: () => {
			queryClient.clear(); // Clear all cache on logout
			toast.success("Logged out successfully");
			router.push("/login");
		},
	});

	const completeProfileMutation = useMutation({
		mutationFn: async (data: Record<string, unknown>) => {
			const res = await fetch("/api/profile/complete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error || "Failed to complete profile");
			}
			return await res.json();
		},
		onSuccess: () => {
			toast.success("Profile completed!");
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	return {
		login: loginMutation,
		register: registerMutation,
		logout: logoutMutation,
		completeProfile: completeProfileMutation,
	};
}
