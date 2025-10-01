import type { Metadata } from "next";
import RegisterPageContent from "@/components/auth/reigisterPageContent";

export const metadata: Metadata = {
	title: "register",
};

export default function RegisterPage() {
	return <RegisterPageContent />;
}
