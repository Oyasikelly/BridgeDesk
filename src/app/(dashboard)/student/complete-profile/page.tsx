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

type Department = {
	id: string;
	name: string;
};

export default function StudentCompleteProfilePage() {
	const router = useRouter();
	const { userData, refreshUserData } = useUser();

	const [departments, setDepartments] = useState<Department[]>([]);
	const [departmentsLoading, setDepartmentsLoading] = useState(false);

	const [formData, setFormData] = useState({
		matricNo: "",
		fullName: userData?.name,
		email: userData?.email,
		phone: "",
		department: "",
		level: "",
		hostel: "",
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch departments from your backend
	const fetchDepartments = async () => {
		setDepartmentsLoading(true);
		try {
			const res = await fetch("/api/departments");
			const data = await res.json();
			setDepartments(data.departments || []);
		} catch (error) {
			console.error("Error fetching departments:", error);
			setDepartments([]);
		} finally {
			setDepartmentsLoading(false);
		}
	};

	// Check auth and profile completion
	useEffect(() => {
		if (!userData) {
			router.push("/login");
			return;
		}

		if (userData.role !== "STUDENT") {
			router.push("/admin");
			return;
		}

		fetchDepartments();

		const checkProfileCompletion = async () => {
			try {
				const response = await fetch(
					`/api/profile/complete?userId=${userData.id}`
				);
				const data = await response.json();

				if (data.isComplete) {
					toast.success("Profile already completed!");
					router.push("/student");
				}
			} catch (error) {
				console.error("Error checking profile completion:", error);
			}
		};

		checkProfileCompletion();
	}, [userData, router]);

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
					role: "STUDENT",
					userId: userData?.id,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Profile update failed. Please try again.");
				return;
			}

			await refreshUserData();
			toast.success("Profile completed successfully!");

			setTimeout(() => {
				router.push("/student");
			}, 200);
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
						Please provide the following information to complete your student
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
							<Label htmlFor="matricNo">Matric No</Label>
							<Input
								id="matricNo"
								placeholder="Enter your Matric Number"
								value={formData.matricNo}
								onChange={(e) => handleInputChange("matricNo", e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								placeholder="Enter your full name"
								value={formData.fullName || "N/A"}
								disabled={true}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email address"
								value={formData.email}
								// onChange={(e) => handleInputChange("email", e.target.value)}
								disabled={isLoading}
							/>
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
							<Label htmlFor="department">Department</Label>
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
												: "Select your department"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{departments.map((dept) => (
										<SelectItem
											key={dept.id}
											value={dept.name}>
											{dept.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="level">Level</Label>
							<Select
								value={formData.level}
								onValueChange={(value) => handleInputChange("level", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select your level" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="100">100 Level</SelectItem>
									<SelectItem value="200">200 Level</SelectItem>
									<SelectItem value="300">300 Level</SelectItem>
									<SelectItem value="400">400 Level</SelectItem>
									<SelectItem value="500">500 Level</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="hostel">Hostel (Optional)</Label>
							<Input
								id="hostel"
								placeholder="Enter your hostel name"
								value={formData.hostel}
								onChange={(e) => handleInputChange("hostel", e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}>
							{isLoading ? "Saving..." : "Complete Profile"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
