import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";

// ✅ GET Admin Profile
export async function GET(
	req: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params; // ✅ must await
		const admin = await prisma.admin.findUnique({
			where: { id },
			include: { user: true },
		});

		if (!admin) {
			return NextResponse.json({ error: "Admin not found" }, { status: 404 });
		}

		const profile = {
			id: admin.id,
			fullName: admin.fullName || "N/A",
			email: admin.email || "N/A",
			phone: admin.phone || "N/A",
			role: admin.role,
			department: admin.department || "N/A",
			avatar: admin.avatarUrl || "/default-avatar.png",
			dateJoined: admin.dateJoined,
			lastLogin: admin.lastLogin,
			position: admin.user?.organizationId
				? "ICT & Complaints Management"
				: "Admin",
		};

		return NextResponse.json(profile, { status: 200 });
	} catch (error) {
		console.error("❌ Error fetching admin profile:", error);
		return NextResponse.json(
			{ error: "Failed to fetch profile" },
			{ status: 500 }
		);
	}
}

// ✅ UPDATE Admin Profile (with FormData + Cloudinary)
export async function PUT(
	req: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params; // ✅ await the params
		const formData = await req.formData();

		const fullName = formData.get("fullName")?.toString();
		const email = formData.get("email")?.toString();
		const phone = formData.get("phone")?.toString();
		const department = formData.get("department")?.toString();
		const avatarFile = formData.get("avatar") as File | null;

		let avatarUrl: string | undefined;

		// ✅ Upload new avatar if provided
		if (avatarFile) {
			const arrayBuffer = await avatarFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const uploadResponse = await new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{ folder: "admin_avatars" },
					(err, result) => {
						if (err) reject(err);
						else resolve(result);
					}
				);
				stream.end(buffer);
			});

			// @ts-expect-error - Type 'string' is not assignable to type 'string | null'
			avatarUrl = uploadResponse.secure_url;
		}

		const updatedAdmin = await prisma.admin.update({
			where: { id },
			data: {
				fullName,
				email,
				phone,
				department,
				...(avatarUrl && { avatarUrl }),
			},
		});

		return NextResponse.json({ admin: updatedAdmin }, { status: 200 });
	} catch (error) {
		console.error("❌ Error updating admin profile:", error);
		return NextResponse.json(
			{ error: "Failed to update profile" },
			{ status: 500 }
		);
	}
}
