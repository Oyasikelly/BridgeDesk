"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Contact() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			toast("✅ Your message has been sent successfully!");
		}, 1500);
	};

	return (
		<div className="bg-background dark:bg-black/95 text-foreground/90">
			<section className="w-full max-w-5xl mx-auto py-16 px-4">
				{/* Back button */}
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 mb-8 text-sm font-medium hover:text-primary transition">
					<ArrowLeft className="w-4 h-4" />
					Back
				</button>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-3">Contact Us</h2>
					<p className="text-gray-500 dark:text-foreground/80">
						We’d love to hear from you! Reach out with questions, feedback, or
						support requests.
					</p>
				</motion.div>

				{/* Content */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
					{/* Contact Info */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4 }}
						className="space-y-6">
						<div className="flex items-center gap-4">
							<Mail className="text-primary w-5 h-5" />
							<p className="text-foreground/80">support@bridgedeck.com</p>
						</div>
						<div className="flex items-center gap-4">
							<Phone className="text-primary w-5 h-5" />
							<p className="text-foreground/80">+234 800 000 0000</p>
						</div>
						<div className="flex items-center gap-4">
							<MapPin className="text-primary w-5 h-5" />
							<p className="text-foreground/80">
								Jakpa Road, Warri, Delta State
							</p>
						</div>

						<p className="text-gray-500 dark:text-foreground/70 mt-8 text-sm">
							Our support team is available{" "}
							<span className="font-medium text-gray-700 dark:text-foreground/80">
								Mon–Fri, 9AM–5PM
							</span>
							.
						</p>
					</motion.div>

					{/* Contact Form */}
					<motion.form
						onSubmit={handleSubmit}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4 }}
						className="bg-primary/10 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
						<div className="mb-4">
							<label className="block text-sm font-medium mb-2">
								Full Name
							</label>
							<input
								type="text"
								required
								className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/95 focus:outline-none focus:ring-2 focus:ring-primary/60"
							/>
						</div>
						<div className="mb-4">
							<label className="block text-sm font-medium mb-2">
								Email Address
							</label>
							<input
								type="email"
								required
								className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/95 focus:outline-none focus:ring-2 focus:ring-primary/60"
							/>
						</div>
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2">Message</label>
							<textarea
								required
								rows={4}
								className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/95 focus:outline-none focus:ring-2 focus:ring-primary/60"></textarea>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/70 transition disabled:opacity-70">
							{loading ? (
								<span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
							) : (
								<>
									<Send className="w-4 h-4" />
									Send Message
								</>
							)}
						</button>
					</motion.form>
				</div>
			</section>
		</div>
	);
}
