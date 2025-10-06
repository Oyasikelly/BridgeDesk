import React, { useRef, useEffect, useState } from "react";
import {
	motion,
	useScroll,
	useAnimation,
	useInView,
	Variants,
} from "framer-motion";
import { FaComments, FaChartLine, FaUserShield, FaTools } from "react-icons/fa";
import { FadeInWhenVisible } from "./animations/fadeInWhenVisible";

// === Type Definitions ===
interface Step {
	id: number;
	title: string;
	description: string;
	icon: React.ReactNode;
	iconColor: string;
	color: string;
}

interface StepItemProps {
	step: Step;
	index: number;
	scrollDirection: "up" | "down";
}

// === Data ===
const STEPS: Step[] = [
	{
		id: 1,
		title: "Complaint Management",
		description:
			"Users can easily log complaints through the platform, ensuring that issues are captured efficiently for resolution.",
		icon: <FaComments />,
		iconColor: "bg-white",
		color: "bg-primary text-white",
	},
	{
		id: 2,
		title: "Complaint Tracking and Status",
		description:
			"Monitor the progress of submitted complaints in real time and stay informed about their resolution status.",
		icon: <FaChartLine />,
		iconColor: "bg-primary text-white",
		color: "bg-background text-gray-600",
	},
	{
		id: 3,
		title: "Administrative",
		description:
			"Admins oversee user activities, assign tasks, and manage escalations to ensure smooth workflow and accountability.",
		icon: <FaUserShield />,
		iconColor: "bg-white",
		color: "bg-primary text-white",
	},
	{
		id: 4,
		title: "System Utility",
		description:
			"Provides essential tools for configuration, updates, and maintaining the integrity and performance of the BridgeDeck platform.",
		icon: <FaTools />,
		iconColor: "bg-primary text-white",
		color: "bg-background text-gray-600",
	},
];

// === WorkflowSteps Component ===
export default function WorkflowSteps(): React.ReactNode {
	const containerRef = useRef<HTMLElement | null>(null);
	const { scrollY } = useScroll();
	const lastY = useRef(0);
	const [direction, setDirection] = useState<"up" | "down">("down");

	useEffect(() => {
		const unsubscribe = scrollY.onChange((latest) => {
			if (latest > lastY.current) setDirection("down");
			else if (latest < lastY.current) setDirection("up");
			lastY.current = latest;
		});
		return unsubscribe;
	}, [scrollY]);

	return (
		<section
			ref={containerRef}
			className="py-16 px-6 md:px-12">
			<div className="max-w-7xl mx-auto text-center mb-20 md:mb-12">
				<FadeInWhenVisible>
					<h1 className="text-3xl md:text-4xl font-bold mb-4 text-white/80">
						BridgeDeck Workflow
					</h1>
				</FadeInWhenVisible>
				<FadeInWhenVisible>
					<p className="text-gray-600 font-semibold">
						Complaint Management → Tracking → Administration → System Utility
					</p>
				</FadeInWhenVisible>
			</div>

			<div className="relative">
				{/* center timeline line */}
				<div className="absolute left-1/2 top-0 h-full w-[2px] bg-gray-600 -translate-x-1/2" />

				{/* spacing between steps */}
				<div className="space-y-24">
					{STEPS.map((step, i) => (
						<StepItem
							key={step.id}
							step={step}
							index={i}
							scrollDirection={direction}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

// === StepItem Component ===
function StepItem({
	step,
	index,
	scrollDirection,
}: StepItemProps): React.ReactNode {
	const ref = useRef<HTMLDivElement | null>(null);
	const inView = useInView(ref, { amount: 0.5 });
	const controls = useAnimation();

	// Correct Variants Type from Framer Motion
	const variants: Variants = {
		hidden: (dir: "up" | "down") => ({
			opacity: 0,
			y: dir === "down" ? 30 : -30,
			transition: { duration: dir === "down" ? 0.9 : 0.6, ease: "easeOut" },
		}),
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: "easeOut" },
		},
	};

	useEffect(() => {
		if (inView) controls.start("visible");
		else controls.start("hidden");
	}, [inView, controls, scrollDirection]);

	const isLeft = index % 2 === 0;

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={controls}
			variants={variants}
			custom={scrollDirection}
			className={`relative flex items-center ${
				isLeft ? "justify-start" : "justify-end"
			}`}>
			<div className={`w-full md:w-5/12 p-6 rounded-lg shadow ${step.color}`}>
				<div className="flex items-center gap-3 mb-3">
					<div
						className={`${step.iconColor} p-2 rounded text-gray-700 text-xl`}>
						{step.icon}
					</div>
					<h3 className="text-xl font-semibold">{step.title}</h3>
				</div>
				<p className="text-sm">{step.description}</p>
			</div>

			<div
				className={`absolute left-1/2 transform -translate-x-1/2 -top-15 md:top-1/2 md:-translate-y-1/2 ${step.iconColor} w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-700`}>
				{step.id}
			</div>
		</motion.div>
	);
}
