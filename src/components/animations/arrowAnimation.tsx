import { motion } from "framer-motion";
import React from "react";

type AnimatedArrowProps = {
	direction?: "left" | "right";
	children: React.ReactNode;
};

const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
	direction = "left",
	children,
}) => {
	return (
		<motion.div
			animate={{
				x: direction === "left" ? [-10, 0, -10] : [10, 0, 10], // left or right movement
			}}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				ease: "easeInOut",
			}}
			className="inline-block">
			{children}
		</motion.div>
	);
};

export default AnimatedArrow;
