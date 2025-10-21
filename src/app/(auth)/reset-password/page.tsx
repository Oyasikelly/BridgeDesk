"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Loader2,
	Lock,
	Eye,
	EyeOff,
	CheckCircle,
	ArrowLeft,
} from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/toggleMode-switch";
import { BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";

function ResetPasswordPageContent() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [done, setDone] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const params = useSearchParams();
	const router = useRouter();
	const token = params.get("token");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		// Validate passwords
		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			setLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			// Use Supabase's updateUser method
			const { createClient } = await import("@supabase/supabase-js");
			const supabase = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL!,
				process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
			);

			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) {
				setError(error.message || "Failed to reset password");
				return;
			}

			setDone(true);
			toast.success("Password reset successfully!");

			// Redirect to login after 2 seconds
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (error) {
			console.error("Error resetting password:", error);
			setError("Failed to reset password. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	if (!token)
		return (
			<ThemeProvider>
				<div className="min-h-screen bg-background">
					{/* Header */}
					<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-2 sm:px-6 lg:px-8">
						<div className="flex h-16 items-center justify-between w-full max-w-5xl mx-auto">
							<div className="flex items-center gap-2">
								<div className="bg-primary rounded-lg p-2">
									<BookOpen className="w-6 h-6 text-primary-foreground" />
								</div>
								<h1 className="text-xl font-bold">QuizMentor</h1>
							</div>
							{/* Theme Toggle */}
							<ModeToggle />
						</div>
					</header>

					{/* Main Content */}
					<div className="flex-1 flex items-center justify-center px-4 py-12">
						<div className="w-full max-w-md space-y-8">
							{/* Back to Login */}
							<div className="flex items-center">
								<Link
									href="/login"
									className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
									<ArrowLeft className="w-4 h-4" />
									Back to login
								</Link>
							</div>

							{/* Error Card */}
							<Card>
								<CardHeader>
									<CardTitle className="text-center text-red-600">
										Invalid Reset Link
									</CardTitle>
									<CardDescription className="text-center">
										The password reset link is invalid or has expired.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-center text-muted-foreground">
										Please request a new password reset link.
									</p>
									<Button
										asChild
										className="w-full">
										<Link href="/request-reset">Request New Reset Link</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</ThemeProvider>
		);

	return (
		<ThemeProvider>
			<div className="min-h-screen bg-background">
				{/* Header */}
				<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-2 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between w-full max-w-5xl mx-auto">
						<div className="flex items-center gap-2">
							<div className="bg-primary rounded-lg p-2">
								<BookOpen className="w-6 h-6 text-primary-foreground" />
							</div>
							<h1 className="text-xl font-bold">QuizMentor</h1>
						</div>
						{/* Theme Toggle */}
						<ModeToggle />
					</div>
				</header>

				{/* Main Content */}
				<div className="flex-1 flex items-center justify-center px-4 py-12">
					<div className="w-full max-w-md space-y-8">
						{/* Back to Login */}
						<div className="flex items-center">
							<Link
								href="/login"
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
								<ArrowLeft className="w-4 h-4" />
								Back to login
							</Link>
						</div>

						{/* Welcome Section */}
						<div className="text-center space-y-4">
							<div>
								<h2 className="text-3xl font-bold tracking-tight">
									Reset your password
								</h2>
								<p className="text-muted-foreground mt-2">
									Enter your new password below
								</p>
							</div>
						</div>

						{/* Reset Form */}
						<Card>
							<CardHeader>
								<CardTitle className="text-center">New Password</CardTitle>
								<CardDescription className="text-center">
									Choose a strong password for your account
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{done ? (
									<div className="text-center space-y-4">
										<div className="flex justify-center">
											<CheckCircle className="w-12 h-12 text-green-500" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-green-600">
												Password reset successfully!
											</h3>
											<p className="text-muted-foreground mt-2">
												You can now sign in with your new password.
											</p>
										</div>
										<Button
											asChild
											className="w-full">
											<Link href="/login">Go to login</Link>
										</Button>
									</div>
								) : (
									<form
										onSubmit={handleSubmit}
										className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="password">New password</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													id="password"
													type={showPassword ? "text" : "password"}
													placeholder="Enter your new password"
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													className="pl-10 pr-10"
													required
													disabled={loading}
													minLength={8}
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
													disabled={loading}>
													{showPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="confirmPassword">Confirm password</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													id="confirmPassword"
													type={showConfirmPassword ? "text" : "password"}
													placeholder="Confirm your new password"
													value={confirmPassword}
													onChange={(e) => setConfirmPassword(e.target.value)}
													className="pl-10 pr-10"
													required
													disabled={loading}
													minLength={8}
												/>
												<button
													type="button"
													onClick={() =>
														setShowConfirmPassword(!showConfirmPassword)
													}
													className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
													disabled={loading}>
													{showConfirmPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
											</div>
										</div>

										{error && (
											<div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
												{error}
											</div>
										)}

										<Button
											type="submit"
											className="w-full"
											disabled={loading}>
											{loading ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Resetting password...
												</>
											) : (
												"Reset password"
											)}
										</Button>
									</form>
								)}

								{/* Back to Login */}
								<div className="text-center text-sm">
									Remember your password?{" "}
									<Link
										href="/login"
										className="font-medium text-primary hover:underline">
										Sign in
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

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			}>
			<ResetPasswordPageContent />
		</Suspense>
	);
}
