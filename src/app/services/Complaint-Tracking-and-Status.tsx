"use client";

import { FadeInWhenVisible } from "@/components/animations/fadeInWhenVisible";
import {
	SlideInLeftWhenVisible,
	SlideInRightWhenVisible,
} from "@/components/animations/slideInAnimations";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function ComplaintTrackingAndStatus() {
	return (
		<section className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 py-12">
			<div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-10">
				{/* Left: Text Section */}
				<div className="flex-1 space-y-6">
					<FadeInWhenVisible>
						<h1 className="text-3xl md:text-5xl font-bold text-primary">
							Complaint Tracking & Status
						</h1>
					</FadeInWhenVisible>

					<SlideInLeftWhenVisible>
						<p className="text-gray-600 leading-relaxed">
							Ever submitted a complaint and wondered what’s happening next?
							With{" "}
							<span className="font-semibold text-primary">BridgeDeck</span>,
							you’ll never be left in the dark again! Our complaint tracking
							system lets you follow each step of your complaint — from the
							moment it’s received until it’s fully resolved.
						</p>
					</SlideInLeftWhenVisible>

					<SlideInRightWhenVisible>
						<p className="text-gray-600 leading-relaxed">
							Get instant updates, see real-time progress, and feel confident
							knowing that your concerns are being handled with care and
							transparency. Whether you’re a user checking your submission or an
							admin managing multiple cases, our system ensures everything stays
							organized and up-to-date.
						</p>
					</SlideInRightWhenVisible>

					<FadeInWhenVisible>
						<div className="flex flex-wrap gap-4 mt-6">
							<Link href="/contact">
								<Button className="bg-primary text-white hover:bg-primary/80 transition px-6 py-3 rounded-md">
									Get Started
								</Button>
							</Link>

							<Link href="/services/Complaint-Management">
								<Button
									variant="outline"
									className="border-primary text-primary hover:bg-primary hover:text-white transition px-6 py-3 rounded-md">
									Explore Complaint Management
								</Button>
							</Link>
						</div>
					</FadeInWhenVisible>
				</div>

				{/* Right: Image Section */}
				<SlideInRightWhenVisible>
					<div className="flex-1 flex justify-center md:justify-end">
						<Image
							src="/assets/services/complaint-tracking.png"
							alt="Complaint Tracking Illustration"
							width={500}
							height={400}
							className="rounded-2xl shadow-lg object-cover"
						/>
					</div>
				</SlideInRightWhenVisible>
			</div>

			{/* Additional Section */}
			<div className="max-w-5xl mt-16 space-y-8 text-center">
				<FadeInWhenVisible>
					<h2 className="text-2xl md:text-3xl font-semibold text-primary">
						Why You’ll Love Our Tracking System
					</h2>
				</FadeInWhenVisible>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700">
					<SlideInLeftWhenVisible>
						<div className="bg-white/10 border border-white/20 rounded-xl p-6 hover:shadow-lg transition">
							<h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
							<p className="text-sm">
								Stay informed at every stage — from complaint submission to
								resolution.
							</p>
						</div>
					</SlideInLeftWhenVisible>

					<FadeInWhenVisible>
						<div className="bg-white/10 border border-white/20 rounded-xl p-6 hover:shadow-lg transition">
							<h3 className="text-lg font-semibold mb-2">
								Transparency & Trust
							</h3>
							<p className="text-sm">
								We believe in openness. Track exactly what’s happening, when,
								and who’s handling your case.
							</p>
						</div>
					</FadeInWhenVisible>

					<SlideInRightWhenVisible>
						<div className="bg-white/10 border border-white/20 rounded-xl p-6 hover:shadow-lg transition">
							<h3 className="text-lg font-semibold mb-2">
								Smart Notifications
							</h3>
							<p className="text-sm">
								Get automatic alerts and reminders so you never miss an update
								or deadline.
							</p>
						</div>
					</SlideInRightWhenVisible>
				</div>
			</div>
		</section>
	);
}
