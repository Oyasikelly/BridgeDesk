"use client";
import { motion } from "framer-motion";

export default function Administrative() {
	return (
		<section className="py-16 px-6 md:px-20 bg-white text-gray-800">
			<div className="max-w-5xl mx-auto text-center">
				<motion.h1
					initial={{ opacity: 0, y: -30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-4xl md:text-5xl font-bold mb-6 text-blue-700">
					Administrative
				</motion.h1>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.6 }}
					className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
					The administrative module gives you complete control and oversight of
					all activities within the system. From managing user access to
					reviewing reports, this section is designed to keep everything running
					smoothly and efficiently.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.7 }}
					className="bg-blue-50 p-8 rounded-2xl shadow-md">
					<h2 className="text-2xl font-semibold mb-4 text-blue-800">
						What You Can Manage:
					</h2>
					<ul className="text-left space-y-4 text-gray-700">
						<li>
							🧑‍💼 <strong>User Management</strong> — add, edit, or remove users
							and assign appropriate roles and permissions.
						</li>
						<li>
							📊 <strong>System Reports</strong> — view analytics and generate
							reports for better decision-making.
						</li>
						<li>
							⚙️ <strong>Configuration</strong> — customize settings,
							categories, and other system parameters.
						</li>
						<li>
							🧾 <strong>Activity Logs</strong> — track user activities and keep
							records for accountability and transparency.
						</li>
					</ul>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8, duration: 0.6 }}
					className="mt-10 text-gray-600 text-lg">
					This module makes system administration easy and organized —
					empowering you to focus on what matters most while keeping everything
					else in check. 🚀
				</motion.p>
			</div>
		</section>
	);
}
