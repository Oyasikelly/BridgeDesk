import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function generateTicketNumber() {
	return "QM-" + Math.random().toString(36).substr(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
	try {
		const {
			name,
			email,
			subject,
			message,
			screenshotUrl,
			issueType,
			urgency,
			sendCopy,
		} = await req.json();
		if (!name || !email || !subject || !message) {
			return NextResponse.json(
				{ error: "Missing required fields." },
				{ status: 400 }
			);
		}
		const ticket = generateTicketNumber();
		let fullMessage = `Ticket: ${ticket}\nName: ${name}\nEmail: ${email}\n`;
		if (issueType) fullMessage += `Issue Type: ${issueType}\n`;
		if (urgency) fullMessage += `Urgency: ${urgency}\n`;
		fullMessage += `\n${message}`;
		if (screenshotUrl) fullMessage += `\n\nScreenshot: ${screenshotUrl}`;

		// Configure transporter (use environment variables for real credentials)
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user:
					process.env.QUIZMENTOR_SUPPORT_EMAIL || "quizmentorhelp@gmail.com",
				pass: process.env.QUIZMENTOR_SUPPORT_PASS || "YOUR_APP_PASSWORD",
			},
		});

		const mailOptions = {
			from: email,
			to: "quizmentorhelp@gmail.com",
			subject: `[QuizMentor Support] ${subject} [${ticket}]`,
			text: fullMessage,
		};
		await transporter.sendMail(mailOptions);

		// Auto-reply to user
		await transporter.sendMail({
			from: "quizmentorhelp@gmail.com",
			to: email,
			subject: `QuizMentor Support Ticket Received [${ticket}]`,
			text: `Hi ${name},\n\nWe have received your support request. Your ticket number is ${ticket}. Our team will get back to you as soon as possible.\n\nSummary:\nSubject: ${subject}\n${
				issueType ? `Issue Type: ${issueType}\n` : ""
			}${urgency ? `Urgency: ${urgency}\n` : ""}\n${message}${
				screenshotUrl ? `\n\nScreenshot: ${screenshotUrl}` : ""
			}\n\nThank you,\nQuizMentor Support Team`,
		});

		// Optionally, send a copy to user if requested
		if (sendCopy) {
			await transporter.sendMail({
				from: "quizmentorhelp@gmail.com",
				to: email,
				subject: `Copy of your QuizMentor Support Request [${ticket}]`,
				text: fullMessage,
			});
		}

		return NextResponse.json({ success: true, ticket });
	} catch (error) {
		console.error("Support email error:", error);
		return NextResponse.json(
			{ error: "Failed to send support request." },
			{ status: 500 }
		);
	}
}
