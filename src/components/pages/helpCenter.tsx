"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	ArrowLeft,
	Search,
	BookOpen,
	Settings,
	User,
	Activity,
} from "lucide-react";

export default function HelpCentre() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");

	const guides = [
		{
			icon: BookOpen,
			title: "Getting Started",
			description:
				"Learn the basics of using BridgeDeck — from signing up to submitting your first complaint.",
			link: "/faq",
		},
		{
			icon: User,
			title: "Account & Profile",
			description:
				"Manage your account details, update your password, and keep your profile up-to-date.",
			link: "/faq",
		},
		{
			icon: Activity,
			title: "Tracking Complaints",
			description:
				"Understand how to monitor the progress of your complaints and receive timely updates.",
			link: "/faq",
		},
		{
			icon: Settings,
			title: "Technical & Support",
			description:
				"Having issues or need help? Find technical support resources and troubleshooting tips.",
			link: "/contact",
		},
	];

	const filteredGuides = guides.filter((g) =>
		g.title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="bg-background dark:bg-black text-foreground/90 ">
			<section className="w-full h-screen max-w-6xl mx-auto py-16 px-4">
				{/* Back button */}
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 mb-8 text-sm font-medium text-gray-700 hover:text-primary transition">
					<ArrowLeft className="w-4 h-4" />
					Back
				</button>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="text-center mb-10">
					<h2 className="text-3xl font-bold mb-3">Help Centre</h2>
					<p className="text-gray-500">
						Find answers, guides, and resources to make the most of BridgeDeck.
					</p>
				</motion.div>

				{/* Search */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="flex justify-center mb-12">
					<div className="relative w-full max-w-md">
						<Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search help topics..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</motion.div>

				{/* Help Topics */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{filteredGuides.length > 0 ? (
						filteredGuides.map((guide, i) => (
							<motion.a
								href={guide.link}
								key={guide.title}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.1 }}
								className="group border border-gray-200 dark:border-primary bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 transition rounded-2xl p-6 flex flex-col items-start">
								<guide.icon className="w-8 h-8 text-primary mb-3" />
								<h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
								<p className="text-gray-500 text-sm flex-1">
									{guide.description}
								</p>
								<span className="mt-4 text-primary text-sm font-medium group-hover:underline">
									Learn more →
								</span>
							</motion.a>
						))
					) : (
						<p className="text-gray-500 col-span-full text-center">
							No results found for "{searchTerm}"
						</p>
					)}
				</motion.div>
			</section>
		</div>
	);
}
