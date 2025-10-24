import PrivacyPolicy from "@/components/pages/PrivacyPolicy";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy",
};

export default function AboutUsPage() {
	return (
		<section>
			<PrivacyPolicy />
		</section>
	);
}
