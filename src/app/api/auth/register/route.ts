import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
	try {
		const { name, email, password, role } = await request.json();

		// Validate required fields
		if (!name || !email || !password || !role) {
			return NextResponse.json(
				{ error: "All fields are required." },
				{ status: 400 }
			);
		}

		// Validate role
		const validRoles = ["student", "admin"];
		if (!validRoles.includes(role)) {
			return NextResponse.json(
				{ error: 'Invalid role. Must be either "student" or "admin".' },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Please enter a valid email address." },
				{ status: 400 }
			);
		}

		// Validate password strength
		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters long." },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{
					error:
						"An account with this email already exists. Please try logging in instead.",
				},
				{ status: 409 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user in database with organization (email not verified initially)
		const user = await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
				role: role === "STUDENT" ? "STUDENT" : "ADMIN",
				emailVerified: false, // Set as not verified initially
				organization: {
					create: {
						name: "Default Organization",
					},
				},
			},
			include: {
				student: true,
				admin: true,
			},
		});

		console.log(
			"Registration successful for user:",
			user.id,
			"Role:",
			user.role
		);

		// Send confirmation email using Supabase
		const { error: emailError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
					role,
					user_id: user.id, // Link to our database user
				},
				emailRedirectTo: `${
					process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
				}/auth/callback`,
			},
		});

		if (emailError) {
			console.error("Email confirmation error:", emailError);
			// Don't fail registration, just log the error
			// User can still log in and verify email later
		}

		// Return user data (profile not complete yet, email not verified)
		return NextResponse.json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name || name,
				role: role, // Keep as lowercase for frontend
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				profileComplete: false, // New users need to complete profile
				emailVerified: false, // Email not verified yet
				organizationId: user.organizationId,
				isActive: user.isActive,
			},
			message:
				"Registration successful! Please check your email to confirm your account.",
		});
	} catch (error) {
		console.error("Registration error:", error);

		if (error instanceof Error && error.message.includes("Unique constraint")) {
			return NextResponse.json(
				{
					error:
						"An account with this email already exists. Please try logging in instead.",
				},
				{ status: 409 }
			);
		}

		return NextResponse.json(
			{ error: "Registration failed. Please try again." },
			{ status: 500 }
		);
	}
}
