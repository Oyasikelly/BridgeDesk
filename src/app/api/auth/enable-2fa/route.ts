import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export async function POST() {
	try {
		// Generate a TOTP secret
		const secret = speakeasy.generateSecret({
			name: "YourAppName (2FA)",
		});

		// Generate a QR code for the user to scan
		const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url!);

		return NextResponse.json({
			secret: secret.base32,
			qrCode: qrCodeDataURL,
			message: "Scan this QR code with your authenticator app.",
		});
	} catch (error) {
		console.error("Enable 2FA error:", error);
		return NextResponse.json(
			{ error: "Failed to enable 2FA." },
			{ status: 500 }
		);
	}
}
