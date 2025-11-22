"use client";

import { ArrowRight } from "lucide-react";
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuTrigger,
	NavigationMenuContent,
} from "./ui/navigation-menu";
import { services } from "@/data/services";
import Link from "next/link";

export default function FooterSection() {
	return (
		<footer className="bg-background dark:bg-ring text-foreground">
			{/* Top Footer Section */}
			<div className="bg-background dark:bg-ring text-gray-900 dark:text-foreground px-5 md:px-20 py-12 rounded-t-[2rem] shadow-sm">
				<div className="grid md:grid-cols-4 gap-10">
					{/* Brand & Newsletter */}
					<div>
						<h2 className="text-xl font-bold mb-3 text-primary">BridgeDesk.</h2>
						<p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
							Stay in the loop and sign up for the BridgeDesk newsletter:
						</p>
						<div className="flex items-center border border-gray-400 rounded-full overflow-hidden w-full max-w-xs">
							<input
								type="email"
								placeholder="Enter your email"
								className="flex-1 px-4 py-2 text-sm focus:outline-none"
							/>
							<button className="bg-primary text-white p-2 rounded-full hover:opacity-90 transition">
								<ArrowRight className="w-5 h-5 text-white" />
							</button>
						</div>
					</div>

					{/* Company */}
					<div>
						<h3 className="font-semibold mb-3 text-gray-900">Company</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/"
									className="hover:text-primary">
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/about-us"
									className="hover:text-primary">
									About
								</Link>
							</li>
							<li>
								<NavigationMenu>
									<NavigationMenuList>
										<NavigationMenuItem>
											<NavigationMenuTrigger className="bg-transparent hover:text-primary">
												Service Menu
											</NavigationMenuTrigger>
											<NavigationMenuContent className="p-4 bg-background/80 rounded-xl shadow-lg backdrop-blur-md">
												<ul className="flex flex-col gap-2 min-w-[200px]">
													{services.map((service) => (
														<li key={service.title}>
															<Link
																href={`/services/${service.url}`}
																className="block hover:text-foreground/70">
																{service.title}
															</Link>
														</li>
													))}
												</ul>
											</NavigationMenuContent>
										</NavigationMenuItem>
									</NavigationMenuList>
								</NavigationMenu>
							</li>
							<li>
								<Link
									href="/pricing"
									className="hover:text-primary">
									Pricing
								</Link>
							</li>
							{/* <li>
								<Link
									href="#"
									className="hover:text-primary">
									Team
								</Link>
							</li> */}
						</ul>
					</div>

					{/* Documentation */}
					<div>
						<h3 className="font-semibold mb-3 text-gray-900">Documentation</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/help-centre"
									className="hover:text-primary">
									Help Centre
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-primary">
									Contact
								</Link>
							</li>
							<li>
								<Link
									href="/faq"
									className="hover:text-primary">
									FAQ
								</Link>
							</li>
							<li>
								<Link
									href="/privacy-policy"
									className="hover:text-primary">
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>

					{/* Social */}
					<div>
						<h3 className="font-semibold mb-3 text-gray-900">Social</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="#"
									className="hover:text-primary">
									Facebook
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="hover:text-primary">
									Instagram
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="hover:text-primary">
									Youtube
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="hover:text-primary">
									Twitter
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Bottom Footer Section */}
			<div className="border-t border-gray-300 flex flex-col md:flex-row justify-between items-center px-10 md:px-20 py-5 text-sm text-foreground">
				<p>© BridgeDesk. All Rights Reserved 2025</p>
				<Link
					href="/terms-conditions"
					className="hover:text-primary mt-2 md:mt-0">
					Terms & Conditions
				</Link>
			</div>
		</footer>
	);
}
