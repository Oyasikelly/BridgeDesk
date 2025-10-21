import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
	try {
		// Get the authorization header
		const authHeader = req.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const token = authHeader.substring(7);

		// Verify the token with Supabase
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = user.id;

		// Verify user exists in our database
		const dbUser = await prisma.user.findUnique({ where: { id: userId } });
		if (!dbUser) {
			return NextResponse.json({ error: "User not found." }, { status: 404 });
		}

		// Delete related data (student, attempts, etc.)
		await prisma.student.deleteMany({ where: { userId } });
		// Add more related deletions as needed

		// Delete the user from our database
		await prisma.user.delete({ where: { id: userId } });

		// Note: Supabase user deletion would require admin privileges
		// For now, we'll just delete from our database
		// The user will be signed out and redirected to login

		return NextResponse.json({ message: "Account deleted successfully." });
	} catch (error) {
		console.error("Error deleting account:", error);
		return NextResponse.json(
			{ error: "Failed to delete account" },
			{ status: 500 }
		);
	}
}
