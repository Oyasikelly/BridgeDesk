"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
	return (
		<div className="min-h-screen bg-background dark:bg-black text-foreground/90 py-10 px-6 sm:px-12 md:px-24">
			<div className="max-w-4xl mx-auto">
				{/* Back Button */}
				<Link
					href="/"
					className="inline-flex items-center hover:text-primary mb-6 transition-all">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Link>

				{/* Header */}
				<h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
				<p className="text-center dark:text-foreground/80 mb-10">
					Your privacy is important to us. This Privacy Policy explains how
					BridgeDeck collects, uses, and protects your information.
				</p>

				{/* Content */}
				<div className="space-y-6 dark:text-foreground/70 leading-relaxed">
					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80  mb-2">
							1. Information We Collect
						</h2>
						<p>
							BridgeDeck collects personal and institutional information such as
							names, email addresses, student IDs, and complaint details when
							you use our platform. This data helps us improve complaint
							tracking and resolution efficiency.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							2. How We Use Your Information
						</h2>
						<p>
							The information you provide is used to create user accounts, log
							complaints, manage user access, and generate administrative
							reports. We may also use anonymized data for system analysis and
							improvement purposes.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							3. Data Protection
						</h2>
						<p>
							BridgeDeck implements industry-standard security measures to
							safeguard your personal data from unauthorized access, alteration,
							or destruction. All data is encrypted and stored securely on
							cloud-based servers.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							4. Data Sharing
						</h2>
						<p>
							We do not share your personal data with third parties except where
							required by law or with your explicit consent. For institutional
							users, access is restricted to verified administrative personnel
							only.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							5. Cookies and Tracking
						</h2>
						<p>
							BridgeDeck uses cookies and analytics tools to enhance user
							experience and monitor platform performance. You can control
							cookie settings through your browser preferences.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							6. User Rights
						</h2>
						<p>
							You have the right to request access, correction, or deletion of
							your personal information. Requests can be made through the{" "}
							<Link
								href="/contact"
								className="text-primary hover:text-primary/80 underline">
								Contact Page
							</Link>
							.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							7. Data Retention
						</h2>
						<p>
							We retain user data only as long as necessary to provide services
							and comply with institutional or legal obligations. After this
							period, your data is securely deleted.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							8. Updates to This Policy
						</h2>
						<p>
							We may periodically update this Privacy Policy to reflect system
							improvements or legal changes. All updates will be communicated
							through the platform or via email.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-800 dark:text-foreground/80 mb-2">
							9. Contact Us
						</h2>
						<p>
							For any concerns or inquiries about your privacy, please reach out
							through the{" "}
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
