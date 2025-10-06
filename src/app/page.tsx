"use client";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
	FaChevronLeft,
	FaChevronRight,
	FaLifeRing,
	FaRegQuestionCircle,
	FaShieldAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { GoDot } from "react-icons/go";
import Link from "next/link";
import FooterSection from "@/components/footer";

const complaintSlideObj = [
	{
		title: "Track your complaints",
		description: "Stay updated on your complaint status easily",
		imageURL: "/testing-1-img.jpg",
	},
	{
		title: "Track your complaints",
		description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
		imageURL: "/testing-2-img.jpg",
	},
	{
		title: "Track your complaints",
		description:
			"Molestias suscipit soluta fugit quia iste tenetur, ea ad aperiam error optio.",
		imageURL: "/testing-3-img.jpg",
	},
];

const testimonials = [
	{
		id: 1,
		name: "Tejiri G.",
		role: "Student, Local High",
		testimony:
			"I love how easy it is to navigate. Plus, I received a super fast response to my school portal issues!",
		image: "https://randomuser.me/api/portraits/women/44.jpg",
	},
	{
		id: 2,
		name: "Alex J.",
		role: "Administrator, City College",
		testimony:
			"The support team is incredibly responsive and helpful! I couldn’t ask for better service.",
		image: "https://randomuser.me/api/portraits/men/46.jpg",
	},
];
export default function Home() {
	return (
		<div className="w-full">
			<main className="max-w-8xl">
				<section
					id="hero"
					className="w-full h-screen relative">
					<div id="image">
						<Image
							src="/hero-img.jpg"
							alt="hero-img"
							fill
							className="object-cover"
							priority
						/>
					</div>
					<div
						id="overlay"
						className="h-full w-full bg-black/50 absolute top-0 left-0 right-0 bottom-0">
						<div className="mt-10">
							<Header />
						</div>
						<div className="h-screen flex flex-col justify-center px-20 text-background -mt-20">
							<SlideInLeftWhenVisible>
								<h1 className="text-5xl font-semibold max-w-3xl mb-6">
									Streamline Your Complaint Management with Our Innovative
									Tracking System
								</h1>
							</SlideInLeftWhenVisible>
							<SlideInLeftWhenVisible>
								<p className="max-w-2xl">
									Our complaint submission and tracking system simplifies the
									process for users and organizations alike. Experience enhanced
									transparency and efficiency in managing feedback and
									resolutions.
								</p>
							</SlideInLeftWhenVisible>
						</div>
					</div>
				</section>

				<section
					id="streamline-complains"
					className="h-screen bg-background text-foreground flex flex-col justify-center px-20">
					<div className="grid grid-col-1 md:grid-cols-2 justify-items-center gap-4 ">
						<div className="flex flex-col justify-center">
							<SlideInLeftWhenVisible>
								<h2 className="text-4xl font-semibold mb-4">
									Lorem ipsum dolor sit amet, consectetur adipisicing elit.
									Mollitia, nostrum.
								</h2>
							</SlideInLeftWhenVisible>
							<SlideInLeftWhenVisible>
								<p className="text-foreground/90">
									Lorem ipsum dolor sit amet, consectetur adipisicing elit.
									Harum, commodi, similique nam tempore, debitis architecto
									laborum in recusandae eos accusantium rerum assumenda soluta?
									Id tenetur et, autem culpa consequatur distinctio
								</p>
							</SlideInLeftWhenVisible>
						</div>
						<SlideInRightWhenVisible>
							<div>
								<Image
									src="/streamline-img.jpg"
									alt="streamline-img"
									width={400}
									height={400}
									className="object-cover"
									priority
								/>
							</div>
						</SlideInRightWhenVisible>
					</div>
				</section>
				<StreamlineComplains />
				<ComplaintManagement />
				<Streamline />
				<Testimonials testimonials={testimonials} />
				<FooterSection />
			</main>
		</div>
	);
}

function StreamlineComplains() {
	const [currentIndex, setCurrentIndex] = useState(1);
	// const [direction, setDirection] = useState<"left" | "right">("right");

	function handlePrev() {
		// setDirection("left");
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? complaintSlideObj.length - 1 : prevIndex - 1
		);
	}

	function handleNext() {
		// setDirection("right");
		setCurrentIndex((nextIndex) =>
			nextIndex === complaintSlideObj.length - 1 ? 0 : nextIndex + 1
		);
	}

	// Animation variants
	// const variants = {
	// 	enter: (direction: "left" | "right") => ({
	// 		x: direction === "right" ? 200 : -200,
	// 		opacity: 0,
	// 	}),
	// 	center: {
	// 		x: 0,
	// 		opacity: 1,
	// 		transition: { duration: 0.5 },
	// 	},
	// 	exit: (direction: "left" | "right") => ({
	// 		x: direction === "right" ? -200 : 200,
	// 		opacity: 0,
	// 		transition: { duration: 0.5 },
	// 	}),
	// };

	const handlers = useSwipeable({
		onSwipedLeft: () => handleNext(),
		onSwipedRight: () => handlePrev(),
		preventScrollOnSwipe: true,
		trackMouse: true, // allows dragging on desktop too
	});

	interface ComplaintSlide {
		id: number;
		title: string;
		description?: string;
		image?: string;
		// add other properties if available
	}
	return (
		<section
			id="streamline-complains"
			className="h-screen bg-ring text-background flex flex-col justify-center px-10 md:px-20 overflow-hidden">
			<div className="grid grid-col-1 md:grid-cols-2 items-center gap-6">
				{/* LEFT IMAGE SLIDE SECTION */}
				<div
					{...handlers}
					className="w-full max-w-full relative">
					<AnimatePresence mode="wait">
						<motion.div
							key={complaintSlideObj[currentIndex].imageURL}
							initial={{ opacity: 0, x: 100, scale: 0.95 }}
							animate={{ opacity: 1, x: 0, scale: 1 }}
							exit={{ opacity: 0, x: -100, scale: 0.95 }}
							transition={{ duration: 0.6, ease: "easeInOut" }}
							className="w-full h-full flex justify-center items-center">
							<Image
								src={
									complaintSlideObj[currentIndex].imageURL ||
									"/assets/test-img.jpg"
								}
								alt={complaintSlideObj[currentIndex].title}
								width={800}
								height={600}
								className="w-1/2 rounded-xl object-cover shadow-lg"
								priority
							/>
						</motion.div>
					</AnimatePresence>

					{/* TEXT + DOTS + ARROWS */}
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="mt-6 space-y-4">
						<h3 className="text-2xl font-semibold">
							{complaintSlideObj[currentIndex].title}
						</h3>
						<p className="text-background/80">
							{complaintSlideObj[currentIndex].description}
						</p>

						{/* DOT + ARROWS SECTION */}
						<div className="flex justify-between items-center mt-6">
							{/* DOTS */}
							<div className="flex gap-2">
								{complaintSlideObj.map((_, index) => (
									<motion.div
										key={index}
										animate={{
											scale: currentIndex === index ? 1.3 : 1,
											opacity: currentIndex === index ? 1 : 0.4,
										}}
										transition={{ duration: 0.3 }}>
										<GoDot
											className={`text-lg transition-all duration-300 ${
												currentIndex === index
													? "text-white"
													: "text-background/50"
											}`}
										/>
									</motion.div>
								))}
							</div>

							{/* ARROWS */}
							<div className="flex gap-4 text-xl">
								<FaChevronLeft
									onClick={handlePrev}
									className="cursor-pointer hover:text-background/70 transition-all duration-300 hover:scale-110"
								/>
								<FaChevronRight
									onClick={handleNext}
									className="cursor-pointer hover:text-background/70 transition-all duration-300 hover:scale-110"
								/>
							</div>
						</div>
					</motion.div>
				</div>

				{/* RIGHT TEXT SECTION */}
				<motion.div
					initial={{ opacity: 0, y: 60 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="h-full">
					<FadeInWhenVisible>
						<h2 className="text-4xl font-semibold mb-4 leading-snug">
							Welcome to Your Complaint Management Solution.
						</h2>
					</FadeInWhenVisible>
					<FadeInWhenVisible>
						<p className="text-background/90 mb-10">
							Our platform simplifies the process of submitting and tracking
							complaints. Experience seamless communication and resolution at
							your fingertips.
						</p>
					</FadeInWhenVisible>
					<FadeInWhenVisible>
						<div className="flex gap-4">
							<Button>Submit</Button>
							<Button>Learn now</Button>
						</div>
					</FadeInWhenVisible>
				</motion.div>
			</div>
		</section>
	);
}
function ComplaintManagement() {
	return (
		<section
			id="streamline-complains"
			className="h-screen bg-background text-background flex flex-col justify-center my-20 px-10 md:px-20 overflow-hidden">
			<div className="grid grid-col-1 md:grid-cols-2 items-center gap-6">
				{/* LEFT IMAGE SLIDE SECTION */}
				<div className="text-foreground h-full">
					<FadeInWhenVisible>
						<h1 className="font-bold text-xl text-foreground mb-4">
							EFFICIENT
						</h1>
					</FadeInWhenVisible>
					<FadeInWhenVisible>
						<h2 className="text-4xl mb-6">
							Experience Hassle-Free Complaint Management Today
						</h2>
					</FadeInWhenVisible>
					<FadeInWhenVisible>
						<p>
							Say goodbye to long queues and delays. Our Digital Complaint
							Submission and Tracking System ensures quick resolutions and
							real-time updates.
						</p>
					</FadeInWhenVisible>

					<div className="flex justify-between items-center mt-8">
						<SlideInLeftWhenVisible>
							<div>
								<h3 className="text-2xl mb-2">Quick Resolutions</h3>
								<p className="mb-6">
									Get fast responses to your complaints with our innovative
									tracking system.
								</p>
							</div>
						</SlideInLeftWhenVisible>
						<SlideInLeftWhenVisible>
							<div>
								<h3 className="text-2xl mb-2">Real-Time Tracking</h3>
								<p className="mb-6">
									Monitor your complaint status anytime, anywhere with our
									user-friendly interface.
								</p>
							</div>
						</SlideInLeftWhenVisible>
					</div>

					<FadeInWhenVisible>
						<div className="flex gap-4">
							<Button>Submit</Button>
							<Link
								href="/contact"
								className="flex items-center justify-center gap-4 group group-hover:text-foreground/70 ">
								Learn More{" "}
								<FaChevronRight className="group-hover:translate-x-2 transition-all duration-300" />
							</Link>
						</div>
					</FadeInWhenVisible>
				</div>

				{/* RIGHT TEXT SECTION */}
				<SlideInRightWhenVisible>
					<div>
						<Image
							width={800}
							height={600}
							src={"/testing-2-img.jpg"}
							alt="testing-img"
						/>
					</div>
				</SlideInRightWhenVisible>
			</div>
		</section>
	);
}

function Streamline() {
	return (
		<section className="bg-foreground text-background py-20 px-10 md:px-20">
			<div className="mx-auto">
				{/* Top Section */}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
					<div>
						<SlideInLeftWhenVisible>
							<h4 className="uppercase text-sm font-semibold mb-2">
								Streamlined
							</h4>
						</SlideInLeftWhenVisible>
						<SlideInLeftWhenVisible>
							<h2 className="text-3xl md:text-5xl font-semibold leading-tight mb-4">
								Effortless Complaint Management at Your Fingertips
							</h2>
						</SlideInLeftWhenVisible>
					</div>
					<SlideInRightWhenVisible>
						<p className="text-background/80 text-base md:text-lg leading-relaxed">
							Our system simplifies the complaint submission process, allowing
							users to report issues quickly and easily. With just a few clicks,
							you can submit your concerns and receive immediate confirmation.
							Experience peace of mind knowing that your feedback is valued and
							addressed promptly.
						</p>
					</SlideInRightWhenVisible>
				</div>

				{/* Feature Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
					{/* Card 1 */}
					<div>
						<SlideInLeftWhenVisible>
							<FaRegQuestionCircle className="text-4xl mb-4" />
							<h3 className="text-xl md:text-2xl font-semibold mb-2">
								Track Your Complaints in Real-Time
							</h3>
							<p className="text-background/70 mb-6">
								Stay updated with live tracking of your complaints.
							</p>
							<div className="flex items-center gap-4">
								<Button
									variant="default"
									className="rounded-full bg-background text-foreground hover:bg-background/90 px-6">
									Learn More
								</Button>
								<button className="text-primary group underline-offset-4 hover:underline flex items-center gap-2">
									Sign Up
									<FaChevronRight className="group-hover:translate-x-2 transition-all duration-300 " />
								</button>
							</div>
						</SlideInLeftWhenVisible>
					</div>

					{/* Card 2 */}
					<div>
						<FadeInWhenVisible>
							<FaLifeRing className="text-4xl mb-4" />
							<h3 className="text-xl md:text-2xl font-semibold mb-2">
								Dedicated Support for Every Step
							</h3>
							<p className="text-background/70">
								Our support team is here to assist you.
							</p>
						</FadeInWhenVisible>
					</div>

					{/* Card 3 */}
					<div>
						<SlideInRightWhenVisible>
							<FaShieldAlt className="text-4xl mb-4" />
							<h3 className="text-xl md:text-2xl font-semibold mb-2">
								Secure and Reliable Complaint Handling
							</h3>
							<p className="text-background/70">
								Your data is protected with top-notch security.
							</p>
						</SlideInRightWhenVisible>
					</div>
				</div>
			</div>
		</section>
	);
}

import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa";
import {
	SlideInLeftWhenVisible,
	SlideInRightWhenVisible,
} from "@/components/animations/slideInAnimations";
import { FadeInWhenVisible } from "@/components/animations/fadeInWhenVisible";

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
		<section className="bg-[#121212] text-white px-6 py-16 relative overflow-hidden">
			<FadeInWhenVisible>
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
					Customer testimonials
				</h2>
				<p className="text-center text-gray-400 mb-12 text-sm md:text-base">
					Navigating the system was a breeze!
				</p>

				<div className="flex justify-center items-center gap-4">
					<button
						onClick={handlePrev}
						className="p-2 rounded-full hover:bg-white/10 transition">
						<FaArrowLeft className="text-xl text-primary" />
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
									<img
										src={testimonials[currentIndex].image}
										alt={testimonials[currentIndex].name}
										className="w-10 h-10 rounded-full"
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
						<FaArrowRight className="text-xl text-primary" />
					</button>
				</div>
			</FadeInWhenVisible>
		</section>
	);
}
