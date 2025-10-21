// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// /**
//  * POST → Send a new chat message (linked to an active complaint)
//  * GET → Fetch chat messages between a student and an admin
//  */

// export async function POST(req: NextRequest) {
// 	try {
// 		const { message, senderRole, senderId, receiverId } = await req.json();

// 		if (!message || !senderRole || !senderId || !receiverId) {
// 			return NextResponse.json(
// 				{ error: "All fields are required" },
// 				{ status: 400 }
// 			);
// 		}

// 		let complaintId: string | null = null;

// 		// === 1️⃣ Find the student's active complaint ===
// 		if (senderRole === "STUDENT") {
// 			const activeComplaint = await prisma.complaint.findFirst({
// 				where: {
// 					studentId: senderId,
// 					status: { in: ["PENDING", "IN_PROGRESS", "REJECTED", "RESOLVED"] },
// 				},
// 				orderBy: { id: "desc" },
// 			});

// 			if (!activeComplaint) {
// 				return NextResponse.json(
// 					{ error: "You have no active complaint to chat about." },
// 					{ status: 403 }
// 				);
// 			}

// 			complaintId = activeComplaint.id;
// 		}

// 		// === 2️⃣ For admins, find the student's complaint ===
// 		else if (senderRole === "ADMIN") {
// 			const studentComplaint = await prisma.complaint.findFirst({
// 				where: {
// 					studentId: receiverId,
// 					status: { in: ["PENDING", "IN_PROGRESS", "REJECTED", "RESOLVED"] },
// 				},
// 				orderBy: { id: "desc" },
// 			});

// 			if (!studentComplaint) {
// 				return NextResponse.json(
// 					{
// 						error:
// 							"This student currently has no active complaint to reply to.",
// 					},
// 					{ status: 403 }
// 				);
// 			}

// 			complaintId = studentComplaint.id;
// 		} else {
// 			return NextResponse.json(
// 				{ error: "Invalid sender role" },
// 				{ status: 400 }
// 			);
// 		}

// 		// === 3️⃣ Create the chat message ===
// 		const newMessage = await prisma.chatMessage.create({
// 			data: {
// 				message,
// 				status: "SENT",
// 				complaint: {
// 					connect: { id: complaintId! },
// 				},
// 				...(senderRole === "STUDENT"
// 					? {
// 							senderStudentId: senderId,
// 							receiverAdminId: receiverId,
// 					  }
// 					: {
// 							senderAdminId: senderId,
// 							receiverStudentId: receiverId,
// 					  }),
// 			},
// 			include: { complaint: true },
// 		});

// 		return NextResponse.json({ message: newMessage }, { status: 201 });
// 	} catch (error) {
// 		console.error("Error sending message:", error);
// 		return NextResponse.json(
// 			{ error: "Failed to send message" },
// 			{ status: 500 }
// 		);
// 	}
// }

// export async function GET(req: NextRequest) {
// 	try {
// 		const { searchParams } = new URL(req.url);
// 		const studentId = searchParams.get("studentId");
// 		const adminId = searchParams.get("adminId");

// 		if (!studentId || !adminId) {
// 			return NextResponse.json(
// 				{ error: "Both studentId and adminId are required" },
// 				{ status: 400 }
// 			);
// 		}

// 		const messages = await prisma.chatMessage.findMany({
// 			where: {
// 				OR: [
// 					{
// 						senderStudentId: studentId,
// 						receiverAdminId: adminId,
// 					},
// 					{
// 						senderAdminId: adminId,
// 						receiverStudentId: studentId,
// 					},
// 				],
// 			},
// 			orderBy: { timestamp: "asc" },
// 			include: {
// 				complaint: {
// 					select: {
// 						id: true,
// 						title: true,
// 						status: true,
// 						category: { select: { name: true } },
// 					},
// 				},
// 			},
// 		});

// 		return NextResponse.json({ messages });
// 	} catch (error) {
// 		console.error("Error fetching messages:", error);
// 		return NextResponse.json(
// 			{ error: "Failed to fetch messages" },
// 			{ status: 500 }
// 		);
// 	}
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST → Send a new chat message (linked to an active complaint)
 * GET → Fetch chat messages between a student and an admin for a specific complaint
 */

export async function POST(req: NextRequest) {
	try {
		const { message, senderRole, senderId, receiverId, complaintId } =
			await req.json();

		if (!message || !senderRole || !senderId || !receiverId) {
			return NextResponse.json(
				{ error: "Message, senderRole, senderId, and receiverId are required" },
				{ status: 400 }
			);
		}

		// ✅ Automatically find the most recent active complaint if complaintId is not provided
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

		if (!activeComplaintId) {
			return NextResponse.json(
				{ error: "Missing complaintId — unable to associate message." },
				{ status: 400 }
			);
		}

		// ✅ Create the chat message
		const newMessage = await prisma.chatMessage.create({
			data: {
				message,
				status: "SENT",
				complaintId: activeComplaintId,
				...(senderRole === "STUDENT"
					? { senderStudentId: senderId, receiverAdminId: receiverId }
					: { senderAdminId: senderId, receiverStudentId: receiverId }),
			},
			include: { complaint: true },
		});

		return NextResponse.json({ message: newMessage }, { status: 201 });
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
				{ error: "studentId, adminId, and complaintId are required" },
				{ status: 400 }
			);
		}

		const messages = await prisma.chatMessage.findMany({
			where: {
				complaintId: complaintId || undefined,
				OR: [
					{ senderStudentId: studentId },
					{ receiverStudentId: studentId },
					{ senderAdminId: adminId },
					{ receiverAdminId: adminId },
				],
			},
			orderBy: { timestamp: "asc" },
			include: {
				complaint: {
					select: {
						id: true,
						title: true,
						status: true,
						category: { select: { name: true } },
					},
				},
			},
		});

		return NextResponse.json({ messages });
	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}
