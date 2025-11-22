export interface Service {
	id: number;
	title: string;
	url: string;
	img: string;
	description: string;
	heroImg?: string;
	heading?: string;
	subheading?: string;
	subtext?: string;
	gallery?: string[];
	features?: { title: string; text: string }[];
	testimonials?: { quote: string; author: string }[];
	footerImg?: string;
}

export const services: Service[] = [
	{
		id: 1,
		title: "Complaint Management",
		url: "complaint-management",
		img: "/testing-img.jpg",
		description:
			"Efficiently log and manage user complaints with an intuitive and easy-to-navigate dashboard that ensures no issue goes unnoticed.",
		heroImg: "/assets/complaint-hero.jpg",
		heading: "Streamline Complaint Handling",
		subheading: "Faster. Smarter. More Transparent.",
		subtext:
			"BridgeDeck’s Complaint Management system ensures user feedback is recorded, tracked, and resolved efficiently, promoting better communication and accountability.",
		gallery: [
			"/assets/complaint1.jpg",
			"/assets/complaint2.jpg",
			"/assets/complaint3.jpg",
			"/assets/complaint4.jpg",
		],
		features: [
			{
				title: "Centralized Dashboard",
				text: "Monitor, assign, and manage all complaints from a unified interface.",
			},
			{
				title: "Smart Categorization",
				text: "Automatically group complaints based on type, urgency, and source.",
			},
			{
				title: "Analytics Reports",
				text: "Get valuable insights on resolution times, response rates, and trends.",
			},
		],
		testimonials: [
			{
				quote:
					"Our support team became 3x more efficient after integrating BridgeDeck’s Complaint Management system.",
				author: "Ada, Customer Relations Officer",
			},
			{
				quote:
					"The automated tracking and clean UI make it incredibly easy to resolve issues fast.",
				author: "James, IT Support Lead",
			},
		],
		footerImg: "/assets/footer-complaint.jpg",
	},
	{
		id: 2,
		title: "Complaint Tracking and Status",
		url: "complaint-tracking-and-status",
		img: "/testing-img.jpg",
		description:
			"Monitor the progress of submitted complaints in real time, ensuring users stay informed at every stage of the resolution process.",
		heroImg: "/assets/tracking-hero.webp",
		heading: "Track Complaints in Real Time",
		subheading: "Transparency That Builds Trust",
		subtext:
			"With BridgeDeck’s Complaint Tracking and Status module, users can check updates, follow progress, and receive timely notifications as their issues move toward resolution.",
		gallery: [
			"/assets/tracking1.jpg",
			"/assets/tracking2.png",
			"/assets/tracking3.jpg",
			"/assets/tracking4.jpg",
		],
		features: [
			{
				title: "Live Progress Updates",
				text: "Stay informed with real-time status changes and notifications.",
			},
			{
				title: "User Dashboard",
				text: "View all submitted complaints with details and progress timelines.",
			},
			{
				title: "Resolution Alerts",
				text: "Get notified immediately once a complaint is resolved.",
			},
		],
		testimonials: [
			{
				quote:
					"Tracking issues has never been this seamless. We love the transparency BridgeDeck offers.",
				author: "Ruth, Operations Supervisor",
			},
			{
				quote:
					"Our clients appreciate being able to monitor progress themselves — huge time saver.",
				author: "Michael, Customer Experience Lead",
			},
		],
		footerImg: "/assets/footer-tracking.png",
	},
	{
		id: 3,
		title: "Administrative",
		url: "administrative",
		img: "/testing-img.jpg",
		description:
			"Empower admins to manage users, assign tasks, and oversee complaint resolution workflows with control and accountability.",
		heroImg: "/assets/admin-hero.jpg",
		heading: "Manage and Empower Your Team",
		subheading: "Seamless Oversight and Efficiency",
		subtext:
			"BridgeDeck’s Administrative tools help teams assign roles, monitor performance, and ensure compliance while maintaining high efficiency.",
		gallery: [
			"/assets/admin1.jpg",
			"/assets/admin2.jpg",
			"/assets/admin3.jpg",
			"/assets/admin4.jpg",
		],
		features: [
			{
				title: "Role Management",
				text: "Easily assign roles, privileges, and permissions to your team members.",
			},
			{
				title: "Activity Logs",
				text: "Maintain full visibility of user actions and changes in the system.",
			},
			{
				title: "Performance Insights",
				text: "Generate detailed reports to evaluate resolution efficiency and workload distribution.",
			},
		],
		testimonials: [
			{
				quote:
					"The admin module helped us track our team’s performance like never before.",
				author: "Victor, Head of Support",
			},
			{
				quote:
					"We now manage our workflow end-to-end within BridgeDeck — it’s seamless.",
				author: "Mary, Admin Manager",
			},
		],
		footerImg: "/assets/footer-admin.jpg",
	},
	{
		id: 4,
		title: "System Utility",
		url: "system-utility",
		img: "/testing-img.jpg",
		description:
			"Provides core tools for maintaining, updating, and optimizing the performance of the BridgeDeck platform.",
		heroImg: "/assets/utility-hero.jpg",
		heading: "Maintain Peak System Performance",
		subheading: "Reliability Meets Innovation",
		subtext:
			"BridgeDeck’s System Utility module offers tools for configuration, backups, and maintenance — ensuring smooth performance always.",
		gallery: [
			"/assets/utility1.jpg",
			"/assets/utility2.jpg",
			"/assets/utility3.jpg",
			"/assets/utility4.jpg",
		],
		features: [
			{
				title: "System Health Monitoring",
				text: "Track platform uptime and performance metrics in real time.",
			},
			{
				title: "Automated Backups",
				text: "Schedule and manage data backups securely and efficiently.",
			},
			{
				title: "Update Management",
				text: "Deploy system updates smoothly without downtime.",
			},
		],
		testimonials: [
			{
				quote:
					"The utility module keeps our system running flawlessly — even during peak loads.",
				author: "Emeka, Technical Engineer",
			},
			{
				quote:
					"Automation tools like backups and monitoring have saved us countless hours.",
				author: "Sarah, Systems Admin",
			},
		],
		footerImg: "/assets/footer-utility.jpg",
	},
];
