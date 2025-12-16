"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/toggleMode-switch";
import {
	BookOpen,
	Mail,
	Lock,
	Eye,
	EyeOff,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // Updated import
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function LoginPageContent() {
	const { login } = useAuth();
	const searchParams = useSearchParams();
    const isLoading = login.isPending;
	// const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	// Check for email verification message from registration
	useEffect(() => {
		const message = searchParams.get("message");
		if (message) {
			toast.success(message);
		}
	}, [searchParams]);

	// Email validation
	const isValidEmail = (email: string) =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	const handleInputChange = (field: "email" | "password", value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Only validate email and password
	const validateForm = (): boolean => {
		if (!formData.email) {
			toast.error("Email is required");
			return false;
		}
		if (!isValidEmail(formData.email)) {
			toast.error("Please enter a valid email address");
			return false;
		}
		if (!formData.password) {
			toast.error("Password is required");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		await login.mutateAsync({
			email: formData.email,
			password: formData.password,
		});
		// Redirect handled in useAuth onSuccess or AuthContext
	};

	return (
		<ThemeProvider>
			<div className="min-h-screen bg-background dark:bg-black/95">
				{/* Header */}
				<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-2 sm:px-6 lg:px-20">
					<div className="flex h-16 items-center justify-between w-full max-w-8xl mx-auto">
						<div className="flex items-center gap-2">
							<div className="bg-primary rounded-lg p-2">
								<BookOpen className="w-6 h-6 text-primary-foreground" />
							</div>
							<h1 className="text-xl font-bold">BridgeDesk.</h1>
						</div>
						{/* Theme Toggle */}
						<ModeToggle />
					</div>
				</header>

				<div className="px-5 md:px-20 py-4">
					<Link href="/">
						<button className="flex items-center gap-2 mb-8 text-sm font-medium hover:text-primary transition">
							<ArrowLeft className="w-4 h-4" />
							Go Back Home
						</button>
					</Link>
				</div>
				{/* Main Content */}
				<div className="flex-1 flex items-center justify-center px-4 py-12">
					<div className="w-full max-w-md space-y-8">
						{/* Welcome Section */}
						<div className="text-center space-y-4">
							<div>
								<h2 className="text-3xl font-bold tracking-tight">
									Welcome back
								</h2>
								<p className="text-muted-foreground mt-2">
									Sign in to your BridgeDesk account
								</p>
							</div>
						</div>

						{/* Login Form */}
						<Card>
							<CardHeader>
								<CardTitle className="text-center">Sign In</CardTitle>
								<CardDescription className="text-center">
									Choose your role and enter your credentials
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Login Form */}
								<form
									onSubmit={handleSubmit}
									className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="email"
												type="email"
												placeholder="Enter your email"
												value={formData.email}
												onChange={(e) =>
													handleInputChange("email", e.target.value)
												}
												className="pl-10"
												disabled={isLoading}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												placeholder="Enter your password"
												value={formData.password}
												onChange={(e) =>
													handleInputChange("password", e.target.value)
												}
												className="pl-10 pr-10"
												disabled={isLoading}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
												disabled={isLoading}>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										<div className="text-left py-2">
											<Link
												href="/request-reset"
												className="text-sm text-primary hover:underline">
												Forgot password?
											</Link>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full"
										disabled={isLoading}>
										{isLoading ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Signing in...
											</>
										) : (
											"Sign In"
										)}
									</Button>
								</form>

								{/* Sign Up Link */}
								<div className="text-center text-sm">
									Don&apos;t have an account?{" "}
									<Link
										href="/register"
										className="font-medium text-primary hover:underline">
										Sign up
									</Link>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
