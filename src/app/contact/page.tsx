import Contact from "@/components/pages/contact";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contact",
};

export default function AboutUsPage() {
	return (
		<section>
			<Contact />
		</section>
	);
}
