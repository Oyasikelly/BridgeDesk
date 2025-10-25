import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import cloudinary from "@/lib/cloudinary"; // Make sure you've configured this

export async function PUT(req: NextRequest) {
	try {
		const formData = await req.formData();
		const id = formData.get("id")?.toString();
		const fullName = formData.get("fullName")?.toString();
		const email = formData.get("email")?.toString();
		const phone = formData.get("phone")?.toString();
		const hostel = formData.get("hostel")?.toString();
		const avatarFile = formData.get("avatar") as File | null;

		if (!id) {
			return NextResponse.json(
				{ error: "Missing student ID" },
				{ status: 400 }
			);
		}

		let avatarUrl: string | undefined;

		// ✅ Upload to Cloudinary if a file is provided
		if (avatarFile) {
			const arrayBuffer = await avatarFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const uploadResponse = await new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{ folder: "student_avatars" },
					(err, result) => {
						if (err) reject(err);
						else resolve(result);
					}
				);
				stream.end(buffer);
			});

			// @ts-ignore
			avatarUrl = uploadResponse.secure_url;
		}

		const updatedStudent = await prisma.student.update({
			where: { id },
			data: {
				fullName,
				email,
				phone,
				hostel,
				...(avatarUrl && { avatarUrl }),
			},
		});

		return NextResponse.json({ student: updatedStudent }, { status: 200 });
	} catch (error) {
		console.error("Error updating student profile:", error);
		return NextResponse.json(
			{ error: "Failed to update student profile" },
			{ status: 500 }
		);
	}
}
