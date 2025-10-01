import { Loader2 } from "lucide-react";

import { Suspense } from "react";
import type { Metadata } from "next";
import LoginPageContent from "@/components/auth/loginPageContent";

export const metadata: Metadata = {
	title: "login",
};

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			}>
			<LoginPageContent />
		</Suspense>
	);
}
