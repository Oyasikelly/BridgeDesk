import Pricing from "@/components/pages/pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Pricing",
};

export default function AboutUsPage() {
	return (
		<section>
			<Pricing />
		</section>
	);
}
