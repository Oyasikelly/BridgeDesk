// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// RATE LIMIT: 5 requests / 10 seconds
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, "10 s"),
});

// Protected routes
const authProtectedRoutes = [
	"/dashboard",
	"/complete-profile",
	"/chat-with-admin",
	"/all-complaints",
	"/my-complaints",
	"/chat-with-student",
	"/students",
	"/analytics",
	"/admin",
	"/profile",
	"/settings",
];

// Admin-only
const adminRoutes = ["/admin", "/chat-with-student", "/students", "/analytics"];

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();

	const supabase = createMiddlewareClient({ req, res });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const pathname = req.nextUrl.pathname;

	// ===== RATE LIMIT =====
	const ip =
		req.headers.get("x-forwarded-for") ??
		req.headers.get("x-real-ip") ??
		"local";

	const { success } = await ratelimit.limit(ip);
	if (!success) return new NextResponse("Too many requests", { status: 429 });

	// ===== AUTH PROTECT =====
	const isAuthRoute = authProtectedRoutes.some((path) =>
		pathname.startsWith(path)
	);

	if (isAuthRoute && !user) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	// ===== BLOCK UNVERIFIED EMAILS =====
	if (user && !user.email_confirmed_at) {
		return NextResponse.redirect(new URL("/verify-email", req.url));
	}

	// ===== GET ROLE FROM METADATA =====
	const role = user?.user_metadata?.role;

	// ===== FIX FLICKERING: SAVE ROLE TO COOKIE =====
	if (role) {
		res.cookies.set("role", role, {
			httpOnly: false,
			secure: true,
			path: "/",
		});
	}

	// ===== ADMIN PROTECTION =====
	const isAdminRoute = adminRoutes.some((path) => pathname.startsWith(path));

	if (isAdminRoute && role !== "ADMIN") {
		return new NextResponse("Forbidden: Admins only", { status: 403 });
	}

	return res;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
