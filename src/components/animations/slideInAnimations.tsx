"use client";
import { motion } from "framer-motion";

export const SlideInLeftWhenVisible = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, x: -80 }}
			whileInView={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.2 }}>
			{children}
		</motion.div>
	);
};

export const SlideInRightWhenVisible = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, x: 80 }}
			whileInView={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.2 }}>
			{children}
		</motion.div>
	);
};
