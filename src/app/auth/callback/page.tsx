"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { checkProfileCompletion } from "@/lib/auth/userData";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
	const router = useRouter();
	const [status, setStatus] = useState<"loading" | "error" | "success">(
		"loading"
	);

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				// Get user from Supabase session
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error || !user) {
					console.error("No authenticated user found:", error);
					setStatus("error");
					router.push("/login");
					return;
				}

				// Fetch complete user data via API endpoint
				const response = await fetch("/api/user/data", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"x-user-id": user.id,
					},
				});

				if (!response.ok) {
					console.error("Failed to fetch user data:", response.status);
					setStatus("error");
					router.push("/login");
					return;
				}

				const data = await response.json();
				const userData = data.user;

				if (!userData) {
					console.error("User profile not found in database");
					setStatus("error");
					router.push("/login");
					return;
				}

				// Check if user is active
				if (!userData.isActive) {
					console.error("User account is deactivated");
					setStatus("error");
					router.push("/login");
					return;
				}

				// Check if email is verified
				if (!userData.emailVerified) {
					console.error("Email not verified");
					setStatus("error");
					router.push("/login");
					return;
				}

				// Check if organization is active
				if (userData.organization && !userData.organization.isActive) {
					console.error("Organization is deactivated");
					setStatus("error");
					router.push("/login");
					return;
				}

				setStatus("success");

				// Handle redirection based on profile completion
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
			} catch {
				console.error("Error in auth callback");
				setStatus("error");
				router.push("/login");
			}
		};

		handleAuthCallback();
	}, [router]);

	// Helper function to get redirect path based on role
	const getRedirectPath = (userData: { role: string }): string => {
		switch (userData.role.toLowerCase()) {
			case "student":
				return "/student";
			case "admin":
				return "/admin";
			case "super_admin":
				return "/admin";
			default:
				return "/login";
		}
	};

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto" />
					<p className="text-muted-foreground">Verifying your account...</p>
				</div>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<p className="text-destructive">
						Authentication failed. Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center space-y-4">
				<Loader2 className="h-8 w-8 animate-spin mx-auto" />
				<p className="text-muted-foreground">
					Redirecting to your dashboard...
				</p>
			</div>
		</div>
	);
}
