import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		storage: typeof window !== "undefined" ? window.localStorage : undefined,
		storageKey: "supabase.auth.token",
	},
});

// Helper function to get user from session
export const getUser = async () => {
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();
	if (error) {
		console.error("Error getting user:", error);
		return null;
	}
	return user;
};

// Helper function to get session
export const getSession = async () => {
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();
	if (error) {
		console.error("Error getting session:", error);
		return null;
	}
	return session;
};
