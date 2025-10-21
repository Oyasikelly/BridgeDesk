import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // adjust path if needed

/**
 * PATCH /api/auth/change-password
 * Body: { currentPassword: string, newPassword: string }
 */
export async function PATCH(req: Request) {
	try {
		const { currentPassword, newPassword } = await req.json();

		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{ error: "Current and new password are required." },
				{ status: 400 }
			);
		}

		// Get current session (user must be logged in)
		const {
			data: { user },
			error: sessionError,
		} = await supabase.auth.getUser();

		if (sessionError || !user) {
			return NextResponse.json(
				{ error: "Unauthorized or session expired." },
				{ status: 401 }
			);
		}

		// Step 1: Reauthenticate user (confirm the old password)
		const { error: reauthError } = await supabase.auth.signInWithPassword({
			email: user.email!,
			password: currentPassword,
		});

		if (reauthError) {
			return NextResponse.json(
				{ error: "Current password is incorrect." },
				{ status: 400 }
			);
		}

		// Step 2: Update the password
		const { error: updateError } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (updateError) {
			return NextResponse.json(
				{ error: "Failed to update password." },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			message: "Password changed successfully.",
		});
	} catch (error) {
		console.error("Change password error:", error);
		return NextResponse.json(
			{ error: "Internal server error." },
			{ status: 500 }
		);
	}
}
