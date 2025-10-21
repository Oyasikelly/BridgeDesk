import { NextResponse } from "next/server";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
	try {
		const { token, secret } = await req.json();

		const verified = speakeasy.totp.verify({
			secret,
			encoding: "base32",
			token,
		});

		if (!verified) {
			return NextResponse.json({ error: "Invalid token" }, { status: 400 });
		}

		return NextResponse.json({ message: "2FA verified successfully" });
	} catch (error) {
		console.error("2FA verify error:", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
