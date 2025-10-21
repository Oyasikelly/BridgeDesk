"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/userContext";
import { toast } from "react-hot-toast";

type Department = { id: string; name: string };

export default function AdminCompleteProfilePage() {
	const router = useRouter();
	const { userData, refreshUserData } = useUser();
	const [departments, setDepartments] = useState<Department[]>([]);
	const [departmentsLoading, setDepartmentsLoading] = useState(false);
	const [formData, setFormData] = useState({
		phone: "",
		email: "",
		department: "",

		fullName: userData?.name || "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Check if user is authenticated and is a admin
		if (!userData) {
			router.push("/login");
			return;
		}

		if (userData.role.toLowerCase() !== "admin") {
			router.push("/student/complete-profile");
			return;
		}

		// Fetch departments and subjects for the user's organization
		if (userData.organizationId) {
			fetchDepartments(userData.organizationId);
		}
	}, [userData, router]);

	// Check if profile is already complete
	useEffect(() => {
		const checkProfileCompletion = async () => {
			if (!userData) return;

			try {
				const response = await fetch(
					`/api/profile/complete?userId=${userData.id}`
				);
				const data = await response.json();

				if (data.isComplete) {
					console.log(
						"Profile already complete, redirecting to admin dashboard"
					);
					router.push("/admin");
				}
			} catch (error) {
				console.error("Error checking profile completion:", error);
			}
		};

		checkProfileCompletion();
	}, [userData, router]);

	const fetchDepartments = async (organizationId: string) => {
		setDepartmentsLoading(true);
		try {
			const res = await fetch(
				`/api/departments?organizationId=${organizationId}`
			);
			const data = await res.json();
			setDepartments(data.departments || []);
		} catch (error) {
			console.error("Error fetching departments:", error);
			setDepartments([]);
		} finally {
			setDepartmentsLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/profile/complete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					role: "ADMIN",
					userId: userData?.id,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Profile update failed. Please try again.");
				return;
			}

			// Refresh user data in context
			await refreshUserData();

			toast.success("Profile completed successfully!");

			// Add a small delay to ensure context is updated
			setTimeout(() => {
				router.push("/admin");
			}, 100);
		} catch (error) {
			console.error("Error updating profile:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!userData) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center">Complete Your Profile</CardTitle>
					<p className="text-center text-sm text-muted-foreground">
						Please provide the following information to complete your admin
						profile.
					</p>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="fullName">FullName</Label>
							<Input
								id="fullName"
								type="text"
								placeholder="Enter your fullName"
								value={formData.fullName}
								onChange={(e) => handleInputChange("fullName", e.target.value)}
								disabled={true}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="unitId">Department</Label>
							<Select
								value={formData.department}
								onValueChange={(value) =>
									handleInputChange("department", value)
								}
								disabled={departmentsLoading}>
								<SelectTrigger>
									<SelectValue
										placeholder={
											departmentsLoading
												? "Loading departments..."
												: "Select your unit"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{departments.map((unit) => (
										<SelectItem
											key={unit.id}
											value={unit.id}>
											{unit.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="Enter your phone number"
								value={formData.phone}
								onChange={(e) => handleInputChange("phone", e.target.value)}
								disabled={isLoading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="tel"
								placeholder="Enter your Email"
								value={formData.email}
								onChange={(e) => handleInputChange("email", e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}>
							{isLoading ? "Updating Profile..." : "Complete Profile"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
