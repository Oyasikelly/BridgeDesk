import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
	try {
		const contentType = req.headers.get("content-type");

		// ✅ Unified handler for both text and file messages
		if (contentType?.includes("multipart/form-data")) {
			const formData = await req.formData();
			const senderRole = formData.get("senderRole") as string;
			const senderId = formData.get("senderId") as string;
			const receiverId = formData.get("receiverId") as string;
			const complaintId = formData.get("complaintId") as string;
			const message = (formData.get("message") as string) || "";
			const files = formData.getAll("file") as File[];

			if (!senderRole || !senderId || !receiverId) {
				return NextResponse.json(
					{ error: "Missing required fields" },
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

			// ✅ Determine active complaint
			let activeComplaintId = complaintId || null;
			if (!activeComplaintId) {
				const latestComplaint = await prisma.complaint.findFirst({
					where: {
						studentId: senderRole === "STUDENT" ? senderId : receiverId,
						status: { in: ["PENDING", "IN_PROGRESS", "REJECTED", "RESOLVED"] },
					},
					orderBy: { dateSubmitted: "desc" },
				});

				if (!latestComplaint) {
					return NextResponse.json(
						{ error: "No active complaint found for this conversation." },
						{ status: 404 }
					);
				}
				activeComplaintId = latestComplaint.id;
			}

			// ✅ Save the chat message
			const newMessage = await prisma.chatMessage.create({
				data: {
					message: fileUrl ? "📎 File uploaded" : message,
					fileUrl,
					fileName,
					status: "SENT",
					complaintId: activeComplaintId,
					...(senderRole === "STUDENT"
						? { senderStudentId: senderId, receiverAdminId: receiverId }
						: { senderAdminId: senderId, receiverStudentId: receiverId }),
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
		console.error("Error sending message:", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const studentId = searchParams.get("studentId");
		const adminId = searchParams.get("adminId");
		const complaintId = searchParams.get("complaintId");

		if (!studentId || !adminId || !complaintId) {
			return NextResponse.json(
				{ error: "Missing required query parameters" },
				{ status: 400 }
			);
		}

		const messages = await prisma.chatMessage.findMany({
			where: {
				complaintId,
				OR: [
					{ senderStudentId: studentId, receiverAdminId: adminId },
					{ senderAdminId: adminId, receiverStudentId: studentId },
				],
			},
			orderBy: { timestamp: "asc" },
		});

		return NextResponse.json({ messages }, { status: 200 });
	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json(
			{ error: "Failed to load messages" },
			{ status: 500 }
		);
	}
}
