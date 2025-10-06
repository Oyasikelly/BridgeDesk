import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ServiceItem {
	title: string;
	url: string;
}

const services: ServiceItem[] = [
	{ title: "Complaint Management", url: "Complaint-Management" },
	{
		title: "Complaint Tracking and Status",
		url: "Complaint-Tracking-and-Status",
	},
	{ title: "Administrative", url: "Administrative" },
	{ title: "System Utility", url: "System-Utility" },
];

type Props = {
	params: Promise<{ slug: string }>;
};

// Generate metadata dynamically based on the slug
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;

	const service = services.find(
		(item) => item.url.toLowerCase() === slug.toLowerCase()
	);

	if (!service) return notFound();

	return {
		title: `${service.title} | Complaint Management System`,
		description: `Learn more about our ${service.title} service and how it helps improve user experience.`,
	};
}

// Layout component for each service page
export default function ServiceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
