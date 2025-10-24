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
			<div className="bg-background dark:bg-ring text-gray-900 dark:text-foreground px-10 md:px-20 py-12 rounded-t-[2rem] shadow-sm">
				<div className="grid md:grid-cols-4 gap-10">
					{/* Brand & Newsletter */}
					<div>
						<h2 className="text-xl font-bold mb-3 text-primary">BridgeDesk.</h2>
						<p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
							Stay in the loop and sign up for the Wardiere newsletter:
						</p>
						<div className="flex items-center border border-gray-400 rounded-full overflow-hidden w-full max-w-xs">
							<input
								type="email"
								placeholder="Enter your email"
								className="flex-1 px-4 py-2 text-sm focus:outline-none"
							/>
							<button className="bg-primary text-white p-2 rounded-full hover:opacity-90 transition">
								<ArrowRight className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Company */}
					<div>
						<h3 className="font-semibold mb-3 text-gray-900">Company</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a
									href="/"
									className="hover:text-primary">
									Home
								</a>
							</li>
							<li>
								<a
									href="/about-us"
									className="hover:text-primary">
									About
								</a>
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
								<a
									href="/pricing"
									className="hover:text-primary">
									Pricing
								</a>
							</li>
							{/* <li>
								<a
									href="#"
									className="hover:text-primary">
									Team
								</a>
							</li> */}
						</ul>
					</div>

					{/* Documentation */}
					<div>
						<h3 className="font-semibold mb-3 text-gray-900">Documentation</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a
									href="/help-centre"
									className="hover:text-primary">
									Help Centre
								</a>
							</li>
							<li>
								<a
									href="/contact"
									className="hover:text-primary">
									Contact
								</a>
							</li>
							<li>
								<a
									href="/faq"
									className="hover:text-primary">
									FAQ
								</a>
							</li>
							<li>
								<a
									href="/privacy-policy"
									className="hover:text-primary">
									Privacy Policy
								</a>
							</li>
						</ul>
					</div>

					{/* Social */}
					<div>
						<h3 className="font-semibold mb-3 text-gray-900">Social</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a
									href="#"
									className="hover:text-primary">
									Facebook
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-primary">
									Instagram
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-primary">
									Youtube
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-primary">
									Twitter
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Bottom Footer Section */}
			<div className="border-t border-gray-300 flex flex-col md:flex-row justify-between items-center px-10 md:px-20 py-5 text-sm text-foreground">
				<p>© BridgeDesk. All Rights Reserved 2025</p>
				<a
					href="/terms-conditions"
					className="hover:text-primary mt-2 md:mt-0">
					Terms & Conditions
				</a>
			</div>
		</footer>
	);
}
