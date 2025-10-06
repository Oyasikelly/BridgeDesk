import AboutUs from "@/components/pages/AboutUs";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "About Us",
};

export default function AboutUsPage() {
	return (
		<section>
			<AboutUs />
		</section>
	);
}
