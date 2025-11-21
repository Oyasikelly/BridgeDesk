"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Pricing() {
	const [activeTab, setActiveTab] = useState<"student" | "institution">(
		"student"
	);
	const Router = useRouter();

	const plans = {
		student: [
			{
				name: "Free",
				price: "₦0",
				duration: "per section",
				description: "Get started with basic access to BridgeDeck.",
				buttonText: "Your current plan",
				features: [
					"Submit up to 3 complaints per section",
					"Basic tracking dashboard",
					"Email notifications",
					"Limited support",
				],
				highlight: true,
			},
			{
				name: "Premium",
				price: "₦1,000",
				duration: "per section",
				description: "Unlock full access and priority support.",
				buttonText: "Subscribe Now",
				features: [
					"Unlimited complaints and tracking",
					"Real-time updates & notifications",
					"Full complaint history access",
					"Priority support response",
				],
			},
		],
		institution: [
			{
				name: "Starter",
				price: "₦50,000",
				duration: "per semester",
				description: "Ideal for small universities with up to 1,000 students.",
				buttonText: "Get Starter Plan",
				features: [
					"Admin dashboard access",
					"Department-level complaint management",
					"Basic analytics and reports",
					"Email support",
				],
				highlight: true,
			},
			{
				name: "Professional",
				price: "₦100,000",
				duration: "per semester",
				description:
					"Perfect for medium-sized institutions (1,000–3,000 students).",
				buttonText: "Get Professional Plan",
				features: [
					"Advanced analytics dashboard",
					"Multi-admin management",
					"Priority technical support",
					"Custom branding (logo & colors)",
				],
			},
			{
				name: "Enterprise",
				price: "Custom",
				duration: "per semester",
				description:
					"For large institutions needing full customization and support.",
				buttonText: "Contact Sales",
				features: [
					"Unlimited admin accounts",
					"Dedicated account manager",
					"Full system customization",
					"24/7 support & maintenance",
				],
			},
		],
	};

	return (
		<div className="bg-background dark:bg-black text-foreground/90 ">
			<section className="w-full max-w-6xl mx-auto py-16 px-4 text-center">
				<button
					onClick={() => Router.back()}
					className="flex items-center gap-2 mb-8 text-sm font-medium hover:text-primary transition">
					<ArrowLeft className="w-4 h-4" />
					Back
				</button>

				<h2 className="text-3xl font-bold mb-3">BridgeDeck Pricing</h2>
				<p className="text-gray-500 dark:text-foreground/80 mb-8">
					Choose the plan that fits your role — whether you’re a student or an
					institution.
				</p>

				{/* Toggle */}
				<div className="flex justify-center mb-10">
					<div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full flex space-x-2">
						<button
							onClick={() => setActiveTab("student")}
							className={`px-6 py-2 rounded-full text-sm font-medium transition ${
								activeTab === "student"
									? "bg-white shadow text-gray-900"
									: "text-gray-500"
							}`}>
							Student
						</button>
						<button
							onClick={() => setActiveTab("institution")}
							className={`px-6 py-2 rounded-full text-sm font-medium transition ${
								activeTab === "institution"
									? "bg-white shadow text-gray-900"
									: "text-gray-500"
							}`}>
							Institution
						</button>
					</div>
				</div>

				{/* Plans */}
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
						{plans[activeTab].map((plan) => (
							<div
								key={plan.name}
								className={`rounded-2xl border p-6 flex flex-col items-center text-left ${
									plan.highlight
										? "border-primary/50 bg-primary/10 dark:bg-primary/30 shadow-lg"
										: "border-gray-200 dark:border-gray-700"
								}`}>
								<h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
								<p className="text-3xl font-bold mb-1">{plan.price}</p>
								<p className="text-gray-500 text-sm mb-4">{plan.duration}</p>
								<p className="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm">
									{plan.description}
								</p>
								<button
									className={`w-full py-2.5 rounded-lg font-medium mb-6 transition ${
										plan.highlight
											? "bg-primary/50 text-white hover:bg-primary/60"
											: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
									}`}>
									{plan.buttonText}
								</button>
								<ul className="space-y-2 w-full text-sm text-gray-600 dark:text-gray-400">
									{plan.features.map((feature) => (
										<li
											key={feature}
											className="flex items-center gap-2">
											<Check
												size={16}
												className="text-blue-600"
											/>
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</motion.div>
				</AnimatePresence>
			</section>
		</div>
	);
}
