import FAQPage from "@/components/pages/FAQ";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "FAQ",
};

export default function AboutUsPage() {
	return (
		<section>
			<FAQPage />
		</section>
	);
}
