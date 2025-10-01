"use client";
import { motion } from "framer-motion";

export const FadeInWhenVisible = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.2 }}>
			{children}
		</motion.div>
	);
};
