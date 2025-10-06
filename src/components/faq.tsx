"use client";
import { useState } from "react";
import { FiPlus, FiMinus, FiArrowRight } from "react-icons/fi";
import { FadeInWhenVisible } from "./animations/fadeInWhenVisible";
import {
	SlideInLeftWhenVisible,
	SlideInRightWhenVisible,
} from "./animations/slideInAnimations";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import Link from "next/link";

const faqs = [
	{
		question: "What is BridgeDeck and how does it work?",
		answer:
			"BridgeDeck is a complaint management and tracking platform that helps organizations streamline issue reporting, monitoring, and resolution in real-time. It connects users, admins, and system utilities for efficient workflow.",
	},
	{
		question: "How can users log a complaint on BridgeDeck?",
		answer:
			"Users can easily log a complaint through the complaint management dashboard. Each submission is tracked automatically, ensuring transparency and accountability from start to finish.",
	},
	{
		question: "Can I track the progress of my complaint?",
		answer:
			"Yes, BridgeDeck allows you to monitor your complaint’s progress. You can view updates, assigned personnel, and resolution timelines through the complaint tracking interface.",
	},
	{
		question: "What role do administrators play on BridgeDeck?",
		answer:
			"Administrators manage all registered complaints, assign responsibilities, oversee resolutions, and maintain data accuracy within the platform. They ensure seamless workflow and accountability.",
	},
	{
		question: "What tools are available in the System Utility section?",
		answer:
			"The System Utility module provides tools for platform configuration, maintenance, updates, and optimization — ensuring that BridgeDeck runs efficiently and securely at all times.",
	},
];

export default function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-start">
			{/* Left Section */}
			<div>
				<FadeInWhenVisible>
					<h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
						Frequently Asked Questions
					</h2>
				</FadeInWhenVisible>
				<SlideInLeftWhenVisible>
					<p className="text-gray-600 mb-6">
						Got questions about BridgeDeck? Explore these FAQs to understand how
						our platform simplifies complaint handling and management.
					</p>
				</SlideInLeftWhenVisible>
				<FadeInWhenVisible>
					<Link href="./contact">
						<Button
							variant="default"
							className="hidden md:flex order-2 md:order-1 items-center gap-3 bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/70 transition group">
							Connect with Us
							<span className="bg-white p-1 rounded-full group-hover:translate-x-3 transition-all duration-300 text-primary">
								<FiArrowRight size={18} />
							</span>
						</Button>
					</Link>
				</FadeInWhenVisible>
			</div>

			{/* Right Section (FAQ List) */}
			<div className="flex flex-col gap-4">
				{faqs.map((faq, index) => (
					<div
						key={index}
						className="border border-gray-200 rounded-lg p-4 cursor-pointer transition"
						onClick={() => toggleFAQ(index)}>
						<SlideInRightWhenVisible>
							<div className="flex justify-between items-center">
								<h3 className="text-primary font-medium">{faq.question}</h3>
								{openIndex === index ? (
									<FiMinus className="text-primary" />
								) : (
									<FiPlus className="text-primary" />
								)}
							</div>

							{/* Animate answer */}
							<AnimatePresence>
								{openIndex === index && (
									<motion.p
										key="content"
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.4, ease: "easeInOut" }}
										className="text-gray-600 mt-3 overflow-hidden">
										{faq.answer}
									</motion.p>
								)}
							</AnimatePresence>
						</SlideInRightWhenVisible>
					</div>
				))}
				<FadeInWhenVisible>
					<div className="flex items-center justify-center">
						<Link href="./contact">
							<Button
								variant="default"
								className="flex md:hidden items-center gap-3 bg-primary text-white mt-8 px-6 py-3 rounded-md font-medium hover:bg-primary/70 transition">
								Connect with Us
								<span className="bg-white p-1 rounded-full hover:translate-x-3 transition-all duration-300 text-primary">
									<FiArrowRight size={18} />
								</span>
							</Button>
						</Link>
					</div>
				</FadeInWhenVisible>
			</div>
		</section>
	);
}
