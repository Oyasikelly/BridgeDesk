"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Menu, X } from "lucide-react";
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuTrigger,
	NavigationMenuContent,
} from "./ui/navigation-menu";
import { ModeToggle } from "./ui/toggleMode-switch";
import {
	SlideInLeftWhenVisible,
	SlideInRightWhenVisible,
} from "./animations/slideInAnimations";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-md  py-3 px-6 md:px-20 flex justify-between items-center z-30">
			{/* Logo */}
			<SlideInLeftWhenVisible>
				<div
					className={`${
						isOpen === true ? "text-primary" : "text-background"
					} text-2xl md:text-3xl font-bold`}>
					BridgeDesk<span className="text-primary">.</span>
				</div>
			</SlideInLeftWhenVisible>

			{/* Desktop Navigation */}
			<SlideInLeftWhenVisible>
				<nav className="hidden md:flex items-center gap-8 text-primary font-semibold text-sm md:text-base">
					<Link
						href="#"
						className="hover:text-primary/70 transition-colors duration-300">
						Home
					</Link>
					<Link
						href="#"
						className="hover:text-primary/70 transition-colors duration-300">
						About Us
					</Link>

					{/* Service Menu Dropdown */}
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-primary hover:text-primary/70 font-semibold">
									Service Menu
								</NavigationMenuTrigger>
								<NavigationMenuContent className="p-4 bg-background/80 rounded-xl shadow-lg backdrop-blur-md">
									<ul className="flex flex-col gap-2 min-w-[200px]">
										<li>
											<Link
												href="#solar"
												className="block hover:text-foreground/70">
												Solar Installation
											</Link>
										</li>
										<li>
											<Link
												href="#maintenance"
												className="block hover:text-foreground/70">
												Maintenance
											</Link>
										</li>
										<li>
											<Link
												href="#training"
												className="block hover:text-foreground/70">
												Training Services
											</Link>
										</li>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</nav>
			</SlideInLeftWhenVisible>

			{/* Desktop Right Section */}
			<SlideInRightWhenVisible>
				<div className="hidden md:flex items-center gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-background/70 w-4 h-4" />
						<Input
							placeholder="Search..."
							className="pl-9 pr-3 border border-background/40 bg-transparent text-background w-40 md:w-52 focus:ring-1 focus:ring-primary"
						/>
					</div>
					<ModeToggle />
					<Link href="/register">
						<Button className="bg-primary text-background hover:bg-primary/90 transition-all duration-300">
							Sign Up
						</Button>
					</Link>
				</div>
			</SlideInRightWhenVisible>
			{/* Mobile Menu Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="md:hidden text-background focus:outline-none">
				{isOpen ? <X size={28} /> : <Menu size={28} />}
			</button>

			{/* Mobile Navigation */}
			<div
				className={`absolute top-full left-0 w-full bg-background/95 backdrop-blur-md text-foreground flex flex-col items-start px-6 py-6 gap-5 shadow-lg rounded-b-2xl transform transition-all duration-300 md:hidden ${
					isOpen
						? "opacity-100 translate-y-0"
						: "opacity-0 -translate-y-4 pointer-events-none"
				}`}>
				<Link
					href="#"
					className="font-semibold hover:text-primary transition-colors duration-300">
					Home
				</Link>
				<Link
					href="#"
					className="font-semibold hover:text-primary transition-colors duration-300">
					About Us
				</Link>
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuTrigger className="bg-transparent hover:text-primary/70 font-semibold">
								Service Menu
							</NavigationMenuTrigger>
							<NavigationMenuContent className="p-4 bg-background/80 rounded-xl shadow-lg backdrop-blur-md">
								<ul className="flex flex-col gap-2 min-w-[200px]">
									<li>
										<Link
											href="#solar"
											className="block hover:text-foreground/70">
											Solar Installation
										</Link>
									</li>
									<li>
										<Link
											href="#maintenance"
											className="block hover:text-foreground/70">
											Maintenance
										</Link>
									</li>
									<li>
										<Link
											href="#training"
											className="block hover:text-foreground/70">
											Training Services
										</Link>
									</li>
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

				{/* Search */}
				<div className="relative w-full mt-2">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70 w-4 h-4" />
					<Input
						placeholder="Search..."
						className="pl-9 pr-3 border border-foreground/40 bg-transparent text-foreground w-full"
					/>
				</div>

				{/* Bottom Actions */}
				<div className="flex items-center justify-between w-full mt-3">
					<ModeToggle />
					<Button className="bg-primary text-background hover:bg-primary/90 transition-all duration-300">
						Sign Up
					</Button>
				</div>
			</div>
		</header>
	);
}
