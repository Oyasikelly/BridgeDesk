"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
	return (
		<div className="min-h-screen bg-background dark:bg-black text-foreground/90 py-10 px-6 sm:px-12 md:px-24">
			<div className="max-w-4xl mx-auto">
				<Link
					href="/"
					className="inline-flex items-center hover:text-primary mb-6 transition-all">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Link>

				<h1 className="text-4xl font-bold mb-6 text-center">
					Terms & Conditions
				</h1>
				<p className="text-center text-gray-600 dark:text-foreground/80 mb-10">
					Please read these Terms and Conditions carefully before using
					BridgeDeck.
				</p>

				<div className="space-y-6 text-gray-700 dark:text-foreground/70 leading-relaxed">
					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							1. Acceptance of Terms
						</h2>
						<p>
							By accessing or using BridgeDeck, you agree to be bound by these
							Terms and Conditions. If you do not agree with any part of these
							terms, you may not access the platform.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							2. Use of Platform
						</h2>
						<p>
							BridgeDeck provides students with a digital platform to submit and
							track complaints within their institution. Users must use the
							platform responsibly and only for legitimate academic or
							administrative purposes.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							3. Account Responsibility
						</h2>
						<p>
							You are responsible for maintaining the confidentiality of your
							login credentials. Any activity under your account is your
							responsibility, and BridgeDeck will not be liable for unauthorized
							access due to negligence.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							4. Payment & Subscription
						</h2>
						<p>
							Students are required to subscribe per academic section at a fee
							of ₦1000. Universities or organisations pay an annual maintenance
							and service fee to access the admin dashboard and complaint
							management system.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							5. Data Protection
						</h2>
						<p>
							BridgeDeck respects your privacy and ensures that all personal and
							institutional data are stored securely in accordance with data
							protection laws and regulations.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							6. Limitation of Liability
						</h2>
						<p>
							BridgeDeck is not responsible for any indirect, incidental, or
							consequential damages arising from the use or inability to use the
							platform. Users are expected to provide accurate information at
							all times.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							7. Modifications
						</h2>
						<p>
							BridgeDeck reserves the right to modify these Terms and Conditions
							at any time. Users will be notified of major changes via email or
							through platform updates.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							8. Contact Us
						</h2>
						<p>
							For any questions regarding these Terms and Conditions, please
							contact us through the{" "}
							<Link
								href="/contact"
								className="text-primary hover:text-primary/80 underline">
								Contact Page
							</Link>
							.
						</p>
					</section>

					<p className="text-sm text-gray-500 mt-10 text-center">
						Last updated: October 2025
					</p>
				</div>
			</div>
		</div>
	);
}
