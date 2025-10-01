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
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
// import { loginUser } from '@/lib/auth';
// import { useAuth } from '@/context/AuthContext';
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";

export default function LoginPageContent() {
	//   const { setUser } = useAuth();
	const searchParams = useSearchParams();
	// const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
	const [isLoading, setIsLoading] = useState(false);
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
		setIsLoading(true);

		try {
			// STRICT ROLE VALIDATION: Only allow login if selected role matches user's actual role
			//   const response = await loginUser({
			//     email: formData.email,
			//     password: formData.password,
			//     role: activeTab, // Send the selected role
			//   });
			//   setUser(response.user);
			//   toast.success(`Welcome back, ${response.user.name}!`);
			// The redirect will be handled automatically by AuthContext
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Invalid email or password. Please try again.";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ThemeProvider>
			<div className="min-h-screen bg-background">
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

				<div className="px-20 py-4">
					<Link
						href="/"
						className="text-primary hover:underline-md transition-all duration-300">
						<button className="text-primary group underline-offset-4 hover:underline flex items-center gap-2">
							<FaChevronLeft className="group-hover:translate-x-2 transition-all duration-300 " />
							Go to home
						</button>
					</Link>
				</div>
				{/* Main Content */}
				<div className="flex-1 flex items-center justify-center px-4 py-12">
					<div className="w-full max-w-md space-y-8">
						{/* Welcome Section */}
						<div className="text-center space-y-4">
							{/* <div className="flex justify-center">
                <div className="bg-primary rounded-full p-3">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
              </div> */}
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

								{/* Demo Login Buttons */}
								{/* <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or try demo
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleDemoLogin('student')}
                      disabled={isLoading}
                      className="text-sm"
                    >
                      Demo Student
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDemoLogin('teacher')}
                      disabled={isLoading}
                      className="text-sm"
                    >
                      Demo Teacher
                    </Button>
                  </div>
                </div> */}

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
