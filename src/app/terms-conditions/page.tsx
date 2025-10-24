import TermsAndConditions from "@/components/pages/TermsAndCondition";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Terms and Conditions",
};

export default function AboutUsPage() {
	return (
		<section>
			<TermsAndConditions />
		</section>
	);
}
