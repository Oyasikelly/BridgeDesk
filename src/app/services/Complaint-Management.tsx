"use client";

import { motion } from "framer-motion";
import { FadeInWhenVisible } from "@/components/animations/fadeInWhenVisible";
import { SlideInLeftWhenVisible } from "@/components/animations/slideInAnimations";
import { Button } from "@/components/ui/button";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function ComplaintManagement() {
	return (
		<section className="max-w-7xl mx-auto px-6 py-16 space-y-16">
			{/* Hero Section */}
			<FadeInWhenVisible>
				<div className="text-center">
					<h1 className="text-3xl md:text-5xl font-semibold text-primary mb-4">
						Complaint Management
					</h1>
					<p className="text-gray-600 max-w-2xl mx-auto">
						BridgeDeck’s Complaint Management service empowers organizations to
						handle customer feedback, resolve issues promptly, and enhance
						satisfaction through a structured, transparent process.
					</p>
				</div>
			</FadeInWhenVisible>

			{/* Key Features */}
			<div className="grid md:grid-cols-2 gap-10 items-center">
				<SlideInLeftWhenVisible>
					<div className="space-y-4">
						<h2 className="text-2xl font-semibold text-primary">
							Key Features
						</h2>
						<ul className="list-disc list-inside text-gray-700 space-y-2">
							<li>Automated complaint logging and tracking</li>
							<li>Real-time notification and response system</li>
							<li>Priority categorization and escalation workflow</li>
							<li>Performance analytics and reporting dashboard</li>
							<li>User-friendly interface for customers and administrators</li>
						</ul>
					</div>
				</SlideInLeftWhenVisible>

				<FadeInWhenVisible>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="bg-primary/5 rounded-2xl p-8 shadow-md">
						<h3 className="text-lg font-medium text-primary mb-2">
							Why It Matters
						</h3>
						<p className="text-gray-700">
							An efficient complaint management process ensures accountability
							and continuous improvement, turning customer concerns into
							opportunities for growth and trust-building.
						</p>
					</motion.div>
				</FadeInWhenVisible>
			</div>

			{/* CTA Section */}
			<FadeInWhenVisible>
				<div className="text-center mt-10">
					<p className="text-gray-600 mb-6">
						Want to integrate our Complaint Management system into your
						workflow? Let’s help you streamline your processes.
					</p>
					<Link href="/contact">
						<Button className="bg-primary text-white flex items-center gap-3 px-6 py-3 rounded-md font-medium hover:bg-primary/70 transition">
							Get Started
							<span className="bg-white text-primary p-1 rounded-full transition-transform group-hover:translate-x-2">
								<FiArrowRight size={18} />
							</span>
						</Button>
					</Link>
				</div>
			</FadeInWhenVisible>
		</section>
	);
}
