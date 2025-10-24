import HelpCentre from "@/components/pages/helpCenter";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Help Centre",
};

export default function AboutUsPage() {
	return (
		<section>
			<HelpCentre />
		</section>
	);
}
