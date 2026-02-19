"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { User } from "@/types/auth";

interface AuthContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	loading: boolean;
	logout: () => Promise<void>;
	checkAndRedirect: (user: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Helper function to get redirect path based on role
	const getRedirectPath = (user: User) => {
		// Redirect to dashboard based on role
		switch (user.role) {
			case "STUDENT":
				return "/student";
			case "ADMIN":
				return "/admin";
			default:
				return "/login";
		}
	};

	// Function to check and redirect user based on their profile completion
	const checkAndRedirect = useCallback(
		async (user: User) => {
			// Check profile completion first
			try {
				// Optimization: Use already fetched profileComplete status if available
				let isComplete = user.profileComplete;
				
				if (isComplete === undefined) {
					console.log("Profile completion status unknown, checking via API...");
					const response = await fetch(`/api/profile/complete?userId=${user.id}`);
					const data = await response.json();
					isComplete = data.isComplete;
				}

				if (!isComplete) {
					// Profile incomplete, redirect to complete-profile page
					const completeProfilePath =
						user.role === "STUDENT"
							? "/student/complete-profile"
							: "/admin/complete-profile";
					console.log(
						"Profile incomplete, redirecting to:",
						completeProfilePath
					);
					router.push(completeProfilePath);
					return;
				} else {
					// Profile is complete, only redirect to dashboard if on auth pages
					const currentPath = window.location.pathname;
					if (currentPath === "/login" || currentPath === "/register") {
						const dashboardPath = getRedirectPath(user);
						console.log(
							"Profile complete, redirecting to dashboard:",
							dashboardPath
						);
						router.push(dashboardPath);
						return;
					}
					// If not on auth pages, don't redirect - let user stay where they are
				}
			} catch (error) {
				console.error("Error checking profile completion:", error);
				// If error, only redirect to dashboard if on auth pages
				const currentPath = window.location.pathname;
				if (currentPath === "/login" || currentPath === "/register") {
					const dashboardPath = getRedirectPath(user);
					router.push(dashboardPath);
				}
			}
		},
		[router]
	);

	// Function to sync user to database if not found
	const syncUserToDatabase = async (supabaseUser: {
		id: string;
		email?: string;
		user_metadata?: {
			name?: string;
			role?: string;
			organizationId?: string;
		};
		email_confirmed_at?: string | null;
	}): Promise<User | null> => {
		// Early return if email is missing
		if (!supabaseUser.email) {
			console.error("Cannot sync user: email is missing");
			return null;
		}
		try {
			const response = await fetch("/api/auth/sync-user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: supabaseUser.id,
					email: supabaseUser.email,
					name: supabaseUser.user_metadata?.name || supabaseUser.email,
					role: supabaseUser.user_metadata?.role || "student",
					emailVerified: supabaseUser.email_confirmed_at !== null,
					organizationId: supabaseUser.user_metadata?.organizationId || "",
				}),
			});

			if (!response.ok) {
				return null;
			}

			const data = await response.json();
			return data.user;
		} catch (error) {
			console.error("Error syncing user to database:", error);
			return null;
		}
	};

	// Simple function to get user from your database
	const getUserFromDatabase = async (userId: string): Promise<User | null> => {
		try {
			const response = await fetch(`/api/auth/user/${userId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				return null;
			}

			const data = await response.json();
			return data.user;
		} catch (error) {
			console.error("Error getting user from database:", error);
			return null;
		}
	};

	useEffect(() => {
		// Check for existing session on mount
		const checkUser = async () => {
			try {
				// 1. Get session from Supabase
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error("Error getting session:", error);
					setLoading(false);
					return;
				}

				if (session?.user) {
					// 2. Get user from your database
					let userProfile = await getUserFromDatabase(session.user.id);

					// If user profile not found, try to sync from Supabase
					if (!userProfile && session.user.email) {
						console.log("User profile not found, attempting to sync...");
						userProfile = await syncUserToDatabase(session.user);
					}

					if (userProfile) {
						setUser(userProfile);
						// Only redirect if we're on the login page (not register page)
						const pathname = window.location.pathname;
						if (pathname === "/login") {
							const redirectPath = getRedirectPath(userProfile);
							router.push(redirectPath);
						}
					}
				}
			} catch (error) {
				console.error("Error checking user session:", error);
			} finally {
				// Add a small delay to ensure smooth transitions
				setTimeout(() => {
					setLoading(false);
				}, 100);
			}
		};

		// Listen for auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log("Auth state changed:", event, session?.user?.id);

			if (event === "SIGNED_IN" && session?.user) {
				let userProfile = await getUserFromDatabase(session.user.id);

				// If user profile not found, try to sync from Supabase
				if (!userProfile && session.user.email) {
					console.log(
						"User profile not found during sign in, attempting to sync..."
					);
					userProfile = await syncUserToDatabase(session.user);
				}

				if (userProfile) {
					setUser(userProfile);
					await checkAndRedirect(userProfile);
				}
			} else if (event === "SIGNED_OUT") {
				setUser(null);
				router.push("/login");
			}
		});

		checkUser();

		// Cleanup subscription
		return () => subscription.unsubscribe();
	}, [router, checkAndRedirect]);

	// Prevent logged-in users from accessing auth pages
	useEffect(() => {
		if (user && !loading) {
			const currentPath = window.location.pathname;
			if (currentPath === "/login" || currentPath === "/register") {
				checkAndRedirect(user);
			}
		}
	}, [user, loading, checkAndRedirect]);

	// Store user ID in localStorage for API access
	useEffect(() => {
		if (user?.id) {
			localStorage.setItem("currentUserId", user.id);
			sessionStorage.setItem("currentUserId", user.id);
		} else {
			localStorage.removeItem("currentUserId");
			sessionStorage.removeItem("currentUserId");
		}
	}, [user?.id]);

	const logout = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				throw error;
			}
			setUser(null);
			router.push("/login");
			toast.success("Successfully logged out");
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Failed to logout. Please try again.");
		}
	};

	return (
		<AuthContext.Provider
			value={{ user, setUser, loading, logout, checkAndRedirect }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
