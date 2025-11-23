import { NextRequest, NextResponse } from "next/server";
import { fetchCompleteUserData } from "@/lib/auth/userData";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		console.log("API: Starting user data fetch...");

		// Get the user ID from the request headers (set by client-side)
		const userId = request.headers.get("x-user-id");

		console.log("API: User ID from headers:", userId);

		if (!userId) {
			console.log("API: No user ID in headers");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		console.log("API: Fetching complete user data for user:", userId);

		// Fetch complete user data using the server-side function
		const completeUserData = await fetchCompleteUserData(userId);

		console.log(
			"API: Complete user data result:",
			completeUserData ? "found" : "not found"
		);

		if (!completeUserData) {
			console.log("API: User not found in database");
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// ✅ Update lastLogin timestamp
		console.log("API: Updating lastLogin for user:", userId);
		await prisma.user.update({
			where: { id: userId },
			data: { lastLogin: new Date() },
		});
		console.log("API: Returning user data successfully");
		return NextResponse.json({
			user: completeUserData,
		});
	} catch (error) {
		console.error("API: Error fetching user data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user data" },
			{ status: 500 }
		);
	}
}
