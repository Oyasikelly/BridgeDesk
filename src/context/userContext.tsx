"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { UserData, checkProfileCompletion } from "@/lib/auth/userData";
import { toast } from "react-hot-toast";

interface UserContextType {
	userData: UserData | null;
	loading: boolean;
	refreshUserData: () => Promise<UserData | null>;
	logout: () => Promise<void>;
	handlePostLoginRedirection: (userData: UserData) => Promise<void>;
	setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export const UserContext = createContext<UserContextType | undefined>(
	undefined
);

export function UserProvider({ children }: { children: ReactNode }) {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [isClient, setIsClient] = useState(false);
	const [isWindowFocused, setIsWindowFocused] = useState(true);
	const router = useRouter();

	// Ensure client-side rendering to prevent hydration mismatch
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Track window focus state to prevent unnecessary auth state changes
	useEffect(() => {
		if (!isClient) return;

		const handleFocus = () => {
			setIsWindowFocused(true);
		};

		const handleBlur = () => {
			setIsWindowFocused(false);
		};

		window.addEventListener("focus", handleFocus);
		window.addEventListener("blur", handleBlur);

		return () => {
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("blur", handleBlur);
		};
	}, [isClient]);

	// Helper function to get redirect path based on role
	const getRedirectPath = (userData: UserData): string => {
		switch (userData.role.toLowerCase()) {
			case "student":
				return "/student";
			case "admin":
				return "/admin";
			default:
				return "/login";
		}
	};

	// Function to handle post-login redirection based on profile completion
	const handlePostLoginRedirection = useCallback(
		async (userData: UserData) => {
			try {
				// Check if profile is completed
				const isProfileComplete = checkProfileCompletion(userData);

				if (isProfileComplete) {
					// Profile is complete, redirect to dashboard
					const dashboardPath = getRedirectPath(userData);
					console.log(
						"Profile complete, redirecting to dashboard:",
						dashboardPath
					);
					router.push(dashboardPath);
				} else {
					// Profile is incomplete, redirect to complete-profile page
					const completeProfilePath =
						userData.role.toLowerCase() === "student"
							? "/student/complete-profile"
							: "/admin/complete-profile";
					console.log(
						"Profile incomplete, redirecting to:",
						completeProfilePath
					);
					router.push(completeProfilePath);
				}
			} catch (error) {
				console.error("Error in post-login redirection:", error);
				// Fallback to dashboard
				const dashboardPath = getRedirectPath(userData);
				router.push(dashboardPath);
			}
		},
		[router]
	);

	// Function to refresh user data
	const refreshUserData = useCallback(async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				// Call the API endpoint instead of using Prisma directly
				const response = await fetch("/api/user/data", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"x-user-id": user.id,
					},
				});

				if (response.ok) {
					const data = await response.json();
					const completeUserData = data.user;
					setUserData(completeUserData);
					return completeUserData;
				} else {
					console.error("Failed to fetch user data:", response.status);
					setUserData(null);
					return null;
				}
			} else {
				setUserData(null);
				return null;
			}
		} catch (error) {
			console.error("Error refreshing user data:", error);
			setUserData(null);
			return null;
		}
	}, []);

	// Initialize user data on mount (client-side only)
	useEffect(() => {
		if (!isClient) return; // Only run on client side

		const initializeUser = async () => {
			try {
				console.log("Initializing user data...");
				const {
					data: { user },
				} = await supabase.auth.getUser();

				console.log("Supabase user:", user);

				if (user) {
					console.log("User found, fetching complete data...");
					// Call the API endpoint instead of using Prisma directly
					const response = await fetch("/api/user/data", {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							"x-user-id": user.id,
						},
					});

					console.log("API response status:", response.status);

					if (response.ok) {
						const data = await response.json();
						console.log("API response data:", data);
						const completeUserData = data.user;
						setUserData(completeUserData);
					} else {
						console.error(
							"API response not ok:",
							response.status,
							response.statusText
						);
						const errorText = await response.text();
						console.error("API error details:", errorText);
					}
				} else {
					console.log("No user found in Supabase");
				}
			} catch (error) {
				console.error("Error initializing user:", error);
			} finally {
				setLoading(false);
			}
		};

		initializeUser();
	}, [isClient]);

	// Listen for auth state changes (client-side only)
	useEffect(() => {
		if (!isClient) return; // Only run on client side

		let isProcessing = false;
		let lastAuthEvent = "";

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			// Prevent multiple simultaneous auth state changes
			if (isProcessing) return;

			// Prevent auth state changes when window regains focus (common cause of re-renders)
			if (
				event === "TOKEN_REFRESHED" &&
				isWindowFocused &&
				lastAuthEvent === "TOKEN_REFRESHED"
			) {
				console.log("Skipping token refresh on focus return");
				return;
			}

			isProcessing = true;
			lastAuthEvent = event;

			console.log(
				"Auth state changed:",
				event,
				session?.user?.id,
				"Window focused:",
				isWindowFocused
			);

			try {
				if (event === "SIGNED_IN" && session?.user) {
					// Call the API endpoint instead of using Prisma directly
					const response = await fetch("/api/user/data", {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							"x-user-id": session.user.id,
						},
					});

					if (response.ok) {
						const data = await response.json();
						const completeUserData = data.user;
						setUserData(completeUserData);

						if (completeUserData) {
							await handlePostLoginRedirection(completeUserData);
						}
					}
				} else if (event === "SIGNED_OUT") {
					setUserData(null);
					router.push("/login");
				}
			} finally {
				// Reset processing flag after a delay to prevent rapid successive calls
				setTimeout(() => {
					isProcessing = false;
				}, 1000);
			}
		});

		return () => subscription.unsubscribe();
	}, [router, handlePostLoginRedirection, isClient, isWindowFocused]);

	// Prevent logged-in users from accessing auth pages (client-side only)
	useEffect(() => {
		if (!isClient) return; // Only run on client side

		if (userData && !loading) {
			const currentPath = window.location.pathname;
			if (currentPath === "/login" || currentPath === "/register") {
				handlePostLoginRedirection(userData);
			}
		}
	}, [userData, loading, handlePostLoginRedirection, isClient]);

	const logout = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				throw error;
			}
			setUserData(null);
			router.push("/login");
			toast.success("Successfully logged out");
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Failed to logout. Please try again.");
		}
	};

	const value = React.useMemo(
		() => ({
			userData,
			loading,
			refreshUserData,
			logout,
			handlePostLoginRedirection,
			setUserData,
		}),
		[userData, loading, refreshUserData, handlePostLoginRedirection, logout]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
