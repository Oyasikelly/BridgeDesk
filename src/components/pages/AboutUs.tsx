"use client";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
	FaChevronLeft,
	FaChevronRight,
	FaUsers,
	FaBullseye,
	FaStar,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { GoDot } from "react-icons/go";
// import Link from "next/link";
import FooterSection from "@/components/footer";
import {
	SlideInLeftWhenVisible,
	SlideInRightWhenVisible,
} from "@/components/animations/slideInAnimations";
import { FadeInWhenVisible } from "@/components/animations/fadeInWhenVisible";
import Link from "next/link";

const values = [
	{
		title: "Transparency",
		description:
			"We believe in open communication and honesty, ensuring our users always know where they stand.",
		imageURL: "/values-transparency.jpg",
	},
	{
		title: "Innovation",
		description:
			"Our solutions are built with cutting-edge technology to simplify complex processes and deliver efficiency.",
		imageURL: "/values-innovation.jpg",
	},
	{
		title: "Commitment",
		description:
			"We’re dedicated to making every interaction meaningful and impactful through consistent service excellence.",
		imageURL: "/values-commitment.jpg",
	},
];

const testimonials = [
	{
		id: 1,
		name: "Tejiri G.",
		role: "User",
		testimony:
			"This platform is incredibly efficient and transparent. I love how quickly I got feedback!",
		image: "https://randomuser.me/api/portraits/women/44.jpg",
	},
	{
		id: 2,
		name: "Alex J.",
		role: "Partner Organization",
		testimony:
			"Their commitment to innovation is unmatched. It’s inspiring to work with a team that truly cares about impact.",
		image: "https://randomuser.me/api/portraits/men/46.jpg",
	},
];

export default function AboutUs() {
	return (
		<div className="w-full">
			<main className="max-w-8xl">
				<section
					id="hero"
					className="w-full h-screen relative">
					<div id="image">
						<Image
							src="/about-hero.jpg"
							alt="about-hero"
							fill
							className="object-cover"
							priority
						/>
					</div>
					<div
						id="overlay"
						className="h-full w-full bg-black/60 absolute top-0 left-0 right-0 bottom-0">
						<div className="mt-10">
							<Header />
						</div>
						<div className="h-screen flex flex-col justify-center px-5 md:px-20 text-background -mt-10 md:-mt-20">
							<SlideInLeftWhenVisible>
								<h1 className="text-4xl lg:text-5xl font-semibold max-w-3xl mb-6">
									Empowering Growth Through Innovation and Transparency
								</h1>
							</SlideInLeftWhenVisible>
							<SlideInLeftWhenVisible>
								<p className="max-w-2xl">
									We are a forward-thinking digital solutions team committed to
									building systems that bridge gaps, enhance communication, and
									foster trust between users and organizations.
								</p>
							</SlideInLeftWhenVisible>
						</div>
					</div>
				</section>

				<section
					id="our-story"
					className="h-screen bg-background bg-background dark:bg-black text-foreground flex flex-col justify-center px-5 md:px-20">
					<div className="grid grid-col-1 md:grid-cols-2 justify-items-center gap-6">
						<div className="flex flex-col justify-center">
							<SlideInLeftWhenVisible>
								<h2 className="text-4xl font-semibold mb-4">Our Story</h2>
							</SlideInLeftWhenVisible>
							<SlideInLeftWhenVisible>
								<p className="leading-relaxed">
									Founded with a vision to simplify processes and promote
									transparency, our team set out to build intuitive systems that
									put users first. Over the years, we’ve grown into a dedicated
									group of innovators, passionate about creating technology that
									solves real-world challenges.
								</p>
							</SlideInLeftWhenVisible>
						</div>
						<SlideInRightWhenVisible>
							<div>
								<Image
									src="/our-story-img.jpg"
									alt="our-story-img"
									width={500}
									height={400}
									className="rounded-xl object-cover shadow-lg"
									priority
								/>
							</div>
						</SlideInRightWhenVisible>
					</div>
				</section>

				<OurValues />
				<MissionVision />
				<Testimonials testimonials={testimonials} />
				<FooterSection />
			</main>
		</div>
	);
}

function OurValues() {
	const [currentIndex, setCurrentIndex] = useState(0);

	function handlePrev() {
		setCurrentIndex((prev) => (prev === 0 ? values.length - 1 : prev - 1));
	}

	function handleNext() {
		setCurrentIndex((next) => (next === values.length - 1 ? 0 : next + 1));
	}

	const handlers = useSwipeable({
		onSwipedLeft: () => handleNext(),
		onSwipedRight: () => handlePrev(),
		preventScrollOnSwipe: true,
		trackMouse: true,
	});

	return (
		<section
			id="our-values"
			className="h-screen bg-ring text-background flex flex-col justify-center px-5 md:px-20 overflow-hidden">
			<div className="grid grid-col-1 md:grid-cols-2 items-center gap-6">
				{/* LEFT IMAGE SLIDE */}
				<div
					{...handlers}
					className="w-full relative">
					<AnimatePresence mode="wait">
						<motion.div
							key={values[currentIndex].imageURL}
							initial={{ opacity: 0, x: 100 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -100 }}
							transition={{ duration: 0.6 }}
							className="flex justify-center items-center">
							<Image
								src={values[currentIndex].imageURL}
								alt={values[currentIndex].title}
								width={500}
								height={400}
								className="rounded-xl object-cover shadow-lg"
							/>
						</motion.div>
					</AnimatePresence>
					{/* Dots + Arrows */}
					<div className="flex justify-center items-center mt-6">
						<div className="flex gap-2">
							{values.map((_, index) => (
								<GoDot
									key={index}
									className={`text-lg ${
										currentIndex === index ? "text-white" : "text-background/40"
									}`}
								/>
							))}
						</div>
						<div className="flex gap-4 text-xl relative left-10 md:left-40">
							<FaChevronLeft
								onClick={handlePrev}
								className="cursor-pointer hover:text-primary/70 transition-all duration-300 hover:scale-110"
							/>
							<FaChevronRight
								onClick={handleNext}
								className="cursor-pointer hover:text-primary/70 transition-all duration-300 hover:scale-110"
							/>
						</div>
					</div>
				</div>

				{/* RIGHT TEXT */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}>
					<h2 className="text-2xl md:text-4xl font-semibold mb-4">
						Our Core Values
					</h2>
					<p className="text-background/90  mb-0 md:mb-4 leading-relaxed">
						<strong>{values[currentIndex].title}</strong>
					</p>
					<p className="text-background/90 mb-10">
						{values[currentIndex].description}
					</p>
					<Link href="/login">
						<Button>Learn More</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}

function MissionVision() {
	return (
		<section className="bg-foreground bg-background dark:bg-black text-background/80 py-20 px-5 md:px-20">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
				<div>
					<SlideInLeftWhenVisible>
						<h4 className="uppercase text-sm font-semibold mb-2">
							Our Mission
						</h4>
					</SlideInLeftWhenVisible>
					<SlideInLeftWhenVisible>
						<h2 className="text-3xl md:text-5xl font-semibold leading-tight mb-4">
							To empower institutions and individuals with smart, transparent,
							and efficient digital tools.
						</h2>
					</SlideInLeftWhenVisible>
				</div>
				<SlideInRightWhenVisible>
					<p className="text-lg leading-relaxed">
						We aim to create meaningful change through innovation — helping
						users communicate, collaborate, and grow with confidence.
					</p>
				</SlideInRightWhenVisible>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-10">
				<div>
					<SlideInLeftWhenVisible>
						<FaUsers className="text-4xl mb-4" />
						<h3 className="text-xl font-semibold mb-2">
							Collaborative Culture
						</h3>
						<p className="text-background/70">
							We believe teamwork drives innovation and lasting impact.
						</p>
					</SlideInLeftWhenVisible>
				</div>

				<div>
					<FadeInWhenVisible>
						<FaBullseye className="text-4xl mb-4" />
						<h3 className="text-xl font-semibold mb-2">Vision-Driven</h3>
						<p className="text-background/70">
							Our vision fuels every idea and keeps us focused on the bigger
							picture.
						</p>
					</FadeInWhenVisible>
				</div>

				<div>
					<SlideInRightWhenVisible>
						<FaStar className="text-4xl mb-4" />
						<h3 className="text-xl font-semibold mb-2">Excellence First</h3>
						<p className="text-background/70">
							We consistently deliver value by maintaining the highest quality
							standards.
						</p>
					</SlideInRightWhenVisible>
				</div>
			</div>
		</section>
	);
}

type Testimonial = {
	id: number;
	name: string;
	role: string;
	testimony: string;
	image: string;
};

interface TestimonialsProps {
	testimonials: Testimonial[];
}

function Testimonials({ testimonials }: TestimonialsProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState<"left" | "right">("right");

	const handlePrev = () => {
		setDirection("left");
		setCurrentIndex((prev) =>
			prev === 0 ? testimonials.length - 1 : prev - 1
		);
	};

	const handleNext = () => {
		setDirection("right");
		setCurrentIndex((prev) =>
			prev === testimonials.length - 1 ? 0 : prev + 1
		);
	};

	const variants = {
		enter: (dir: "left" | "right") => ({
			x: dir === "right" ? 100 : -100,
			opacity: 0,
		}),
		center: { x: 0, opacity: 1 },
		exit: (dir: "left" | "right") => ({
			x: dir === "right" ? -100 : 100,
			opacity: 0,
		}),
	};

	return (
		<section className="bg-[#121212] text-white px-5 py-16 relative overflow-hidden">
			<FadeInWhenVisible>
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
					What People Say About Us
				</h2>
				<p className="text-center text-gray-400 mb-12 text-sm md:text-base">
					Real voices. Real experiences.
				</p>

				<div className="flex justify-center items-center gap-4">
					<button
						onClick={handlePrev}
						className="p-2 rounded-full hover:bg-white/10 transition">
						<FaChevronLeft className="text-xl text-primary" />
					</button>

					<div className="w-full max-w-md sm:max-w-2xl">
						<AnimatePresence
							mode="wait"
							custom={direction}>
							<motion.div
								key={testimonials[currentIndex].id}
								custom={direction}
								variants={variants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.5, ease: "easeInOut" }}
								className="text-center md:text-left">
								<div className="flex justify-center mb-4">
									{[...Array(5)].map((_, i) => (
										<FaStar
											key={i}
											className="text-yellow-500"
										/>
									))}
								</div>

								<p className="text-lg md:text-xl font-medium italic mb-6">
									&quot;{testimonials[currentIndex].testimony}&quot;
								</p>

								<div className="flex justify-center md:justify-start items-center gap-4">
									<Image
										src={testimonials[currentIndex].image}
										alt={testimonials[currentIndex].name}
										width={100}
										height={100}
										className="rounded-full object-cover"
									/>
									<div className="text-left">
										<p className="font-semibold">
											{testimonials[currentIndex].name}
										</p>
										<p className="text-sm text-gray-400">
											{testimonials[currentIndex].role}
										</p>
									</div>
								</div>
							</motion.div>
						</AnimatePresence>
					</div>

					<button
						onClick={handleNext}
						className="p-2 rounded-full hover:bg-white/10 transition">
						<FaChevronRight className="text-xl text-primary" />
					</button>
				</div>
			</FadeInWhenVisible>
		</section>
	);
}
