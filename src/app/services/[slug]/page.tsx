"use client";

import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { services } from "@/data/services";
import { motion } from "framer-motion";
import Link from "next/link";
import FAQ from "@/components/faq";
import FooterSection from "@/components/footer";
import Header from "@/components/header";
import { Suspense } from "react";
import { Loader } from "lucide-react";

export default function ServicePage() {
	const { slug } = useParams();

	console.log(slug);
	// Find the service that matches the slug
	const service = services.find(
		(item) => item.url.toLowerCase() === String(slug).toLowerCase()
	);
	console.log(service);
	if (!service) return notFound();

	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader className="animate-spin mx-auto mt-20 text-primary" />
				</div>
			}>
			<div className="bg-background text-foreground w-full">
				{/* HERO SECTION */}
				<section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
					<Image
						src={service.heroImg || "/test-img.jpg"}
						alt={service.title}
						fill
						className="object-cover object-center brightness-60"
						priority
					/>
					<div className="absolute text-center text-white px-6">
						<div className="mt-10">
							<Header />
						</div>{" "}
						<motion.h1
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-4xl md:text-6xl font-bold uppercase mb-6">
							{service.title}
						</motion.h1>
						<Link
							href="/register"
							className="px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary/80 transition-all duration-300">
							Get Started
						</Link>
					</div>
				</section>

				{/* INTRODUCTION SECTION */}

				<section className="bg-background dark:bg-black text-foreground">
					<div className="py-16 px-6 md:px-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
						<div className="space-y-6">
							<h2 className="text-3xl md:text-4xl font-bold">
								{service.heading || "Empowering Solutions, Simplified"}
							</h2>
							<p className="text-gray-500 leading-relaxed">
								{service.description ||
									"At Prosmith, we provide modern, user-centered solutions that help streamline complaints, improve tracking, and enhance service efficiency. Our team is dedicated to ensuring that your users are satisfied, every step of the way."}
							</p>
							<Link
								href="/register"
								className="px-5 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/80 transition-all duration-300">
								Start today
							</Link>
						</div>
						<div className="grid grid-cols-2 gap-4">
							{service.gallery?.slice(0, 4).map((img, index) => (
								<Image
									key={index}
									src={img}
									alt={`${service.title} image ${index}`}
									width={400}
									height={400}
									className="rounded-lg object-cover"
								/>
							))}
						</div>
					</div>
				</section>

				{/* FEATURE HIGHLIGHTS */}
				<section className="py-20 bg-gray-50 dark:bg-ring text-foreground">
					<div className="max-w-6xl mx-auto px-6 md:px-12 text-center space-y-8">
						<h2 className="text-2xl md:text-4xl font-semibold">
							{service.subheading || "Why Choose Us"}
						</h2>
						<p className="text-gray-600 dark:text-foreground max-w-3xl mx-auto">
							{service.subtext ||
								"We combine innovation, reliability, and expertise to create complaint management systems that are fast, transparent, and user-friendly."}
						</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
							{service.features?.map((feature, index) => (
								<div
									key={index}
									className="bg-background dark:bg-foreground/50 shadow-md rounded-lg p-6 hover:shadow-xl transition-all duration-300">
									<h3 className="text-lg font-bold mb-2">{feature.title}</h3>
									<p className="text-gray-600">{feature.text}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* TESTIMONIALS */}
				<section className="bg-black text-white py-20">
					<div className="max-w-6xl mx-auto text-center px-6 space-y-10">
						<h2 className="text-2xl md:text-4xl font-semibold uppercase tracking-wide">
							What Our Clients Say
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
							{service.testimonials?.map((item, index) => (
								<div
									key={index}
									className="space-y-4">
									<p className="text-sm italic text-gray-300">“{item.quote}”</p>
									<div className="flex justify-center md:justify-start items-center gap-4">
										<Image
											src={`https://randomuser.me/api/portraits/women/${index}.jpg`}
											alt={item.author}
											width={100}
											height={100}
											className="w-10 h-10 rounded-full"
										/>
										<p className="font-semibold text-white">– {item.author}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* CONTACT / FOOTER */}
				<FAQ />
				<FooterSection />
			</div>
		</Suspense>
	);
}
