"use client";
import { motion } from "framer-motion";

export default function SystemUtility() {
	return (
		<section className="py-16 px-6 md:px-20 bg-white text-gray-800">
			<div className="max-w-5xl mx-auto text-center">
				<motion.h1
					initial={{ opacity: 0, y: -30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-4xl md:text-5xl font-bold mb-6 text-blue-700">
					System Utility
				</motion.h1>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.6 }}
					className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
					The System Utility module is the heartbeat of BridgeDeck — keeping
					every feature, function, and process running at its best. It’s built
					to handle behind-the-scenes maintenance, updates, and optimizations so
					that users always enjoy a smooth experience.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.7 }}
					className="bg-blue-50 p-8 rounded-2xl shadow-md">
					<h2 className="text-2xl font-semibold mb-4 text-blue-800">
						Key System Tools:
					</h2>
					<ul className="text-left space-y-4 text-gray-700">
						<li>
							🧰 <strong>Data Backup & Restore</strong> — securely back up and
							restore critical system data to prevent loss.
						</li>
						<li>
							🔄 <strong>System Updates</strong> — apply patches and updates to
							improve performance and fix bugs effortlessly.
						</li>
						<li>
							💾 <strong>Storage Management</strong> — monitor usage and ensure
							data is efficiently stored and retrieved.
						</li>
						<li>
							🔐 <strong>Security Tools</strong> — maintain data protection and
							control access to sensitive areas of the platform.
						</li>
					</ul>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8, duration: 0.6 }}
					className="mt-10 text-gray-600 text-lg">
					With System Utility, BridgeDeck ensures reliability, security, and
					speed — keeping your complaint management ecosystem performing like a
					champ ⚡.
				</motion.p>
			</div>
		</section>
	);
}
