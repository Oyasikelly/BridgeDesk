// src/app/api/admin/chat/messages/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "@/lib/cloudinary";
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const adminId = searchParams.get("adminId");
		const complaintId = searchParams.get("complaintId");

		if (!adminId) {
			return NextResponse.json({ error: "Missing adminId" }, { status: 400 });
		}

		if (!complaintId) {
			return NextResponse.json(
				{ error: "Missing complaintId" },
				{ status: 400 }
			);
		}

		// ✅ Verify that the complaint belongs to a category managed by this admin
		const complaint = await prisma.complaint.findUnique({
			where: { id: complaintId },
			include: { category: true },
		});

		// If complaint not found or category is null or not managed by this admin -> unauthorized
		if (!complaint || complaint.category?.adminId !== adminId) {
			return NextResponse.json(
				{ error: "Unauthorized or invalid complaint" },
				{ status: 403 }
			);
		}

		// ✅ Fetch messages under this complaint
		const messages = await prisma.chatMessage.findMany({
			where: { complaintId },
			include: {
				senderAdmin: true,
				senderStudent: true,
			},
			orderBy: { timestamp: "asc" },
		});

		return NextResponse.json(messages);
	} catch (error) {
		console.error("❌ Error fetching messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}

// ✅ Handle admin sending messages (supports file upload)
export async function POST(req: NextRequest) {
	try {
		const contentType = req.headers.get("content-type");

		if (contentType?.includes("multipart/form-data")) {
			const formData = await req.formData();
			const adminId = formData.get("adminId") as string;
			const studentId = formData.get("studentId") as string;
			const complaintId = formData.get("complaintId") as string;
			const message = (formData.get("message") as string) || "";
			const files = formData.getAll("file") as File[];

			if (!adminId || !studentId) {
				return NextResponse.json(
					{ error: "Missing adminId or studentId" },
					{ status: 400 }
				);
			}

			let fileUrl: string | null = null;
			let fileName: string | null = null;

			// ✅ Upload file if present
			if (files.length > 0) {
				const file = files[0];
				const bytes = await file.arrayBuffer();
				const buffer = Buffer.from(bytes);
				const originalName = file.name;
				const publicId = `${originalName.split(".")[0]}-${uuidv4()}`;

				const uploadResponse = await new Promise((resolve, reject) => {
					const stream = cloudinary.uploader.upload_stream(
						{
							folder: "complaint_uploads",
							public_id: publicId,
							resource_type: "auto",
						},
						(error, result) => {
							if (error) reject(error);
							else resolve(result);
						}
					);
					stream.end(buffer);
				});

				const { secure_url } = uploadResponse as { secure_url: string };
				fileUrl = secure_url;
				fileName = originalName;
			}

			// ✅ Ensure valid complaint
			let activeComplaintId = complaintId || null;
			if (!activeComplaintId) {
				const latestComplaint = await prisma.complaint.findFirst({
					where: {
						studentId,
						category: { adminId },
						status: { in: ["PENDING", "IN_PROGRESS", "REJECTED", "RESOLVED"] },
					},
					orderBy: { dateSubmitted: "desc" },
				});
				if (!latestComplaint) {
					return NextResponse.json(
						{ error: "No valid complaint found" },
						{ status: 404 }
					);
				}
				activeComplaintId = latestComplaint.id;
			}

			// ✅ Save message in DB
			const newMessage = await prisma.chatMessage.create({
				data: {
					message: fileUrl ? "📎 File uploaded" : message,
					fileUrl,
					fileName,
					status: "SENT",
					complaintId: activeComplaintId,
					senderAdminId: adminId,
					receiverStudentId: studentId,
				},
			});

			return NextResponse.json({ message: newMessage }, { status: 201 });
		}

		// ❌ Unsupported request
		return NextResponse.json(
			{ error: "Unsupported content type" },
			{ status: 415 }
		);
	} catch (error) {
		console.error("❌ Error sending message:", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 }
		);
	}
}
