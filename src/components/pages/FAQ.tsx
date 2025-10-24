"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const faqs = [
	{
		question: "What is BridgeDeck?",
		answer:
			"BridgeDeck is a digital platform that allows students to submit complaints, track progress, and get feedback directly from school administrators — ensuring transparency and accountability.",
	},
	{
		question: "How much does it cost to use BridgeDeck?",
		answer:
			"Students subscribe per section at ₦1000 only. Organisations (Universities) also pay a set-up and maintenance fee to access the admin dashboard.",
	},
	{
		question: "Can I track my complaint after submission?",
		answer:
			"Yes. Every student can track their complaint’s status in real-time — from submission to resolution.",
	},
	{
		question: "Who can access the admin panel?",
		answer:
			"Only authorised university officials and designated staff can access the admin panel for managing and responding to student complaints.",
	},
	{
		question: "How secure is my information?",
		answer:
			"We take data privacy seriously. All information is securely encrypted and stored in compliance with data protection regulations.",
	},
];

export default function FAQPage() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const router = useRouter();
	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<div className="min-h-screen bg-background dark:bg-black text-foreground/90  py-10 px-6 sm:px-12 md:px-24">
			<div className="max-w-3xl mx-auto">
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 mb-8 text-sm font-medium text-gray-700 hover:text-primary transition">
					<ArrowLeft className="w-4 h-4" />
					Back
				</button>

				<h1 className="text-4xl font-bold text-center mb-8">
					Frequently Asked Questions
				</h1>
				<p className="text-center text-foreground/80 mb-12">
					Find answers to some of the most common questions about BridgeDeck.
				</p>

				<div className="space-y-4">
					{faqs.map((faq, index) => (
						<div
							key={index}
							className="bg-foreground/90 shadow-md rounded-2xl p-5 cursor-pointer transition hover:shadow-lg"
							onClick={() => toggleFAQ(index)}>
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-semibold text-gray-200 dark:text-gray-800">
									{faq.question}
								</h3>
								{openIndex === index ? (
									<ChevronUp className="text-primary" />
								) : (
									<ChevronDown className="text-primary" />
								)}
							</div>
							{openIndex === index && (
								<p className="mt-3 text-gray-200 dark:text-gray-600 text-sm leading-relaxed">
									{faq.answer}
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
