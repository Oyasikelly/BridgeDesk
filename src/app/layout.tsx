import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/userContext";
import { FocusProvider } from "@/context/FocusContext";
import { QueryProvider } from "@/components/query-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "BridgeDesk",
		template: "%s | BridgeDesk",
	},
	description:
		"this is a complaint submission for students acrros nigeria and beyond",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<QueryProvider>
					<AuthProvider>
						<UserProvider>
							<FocusProvider>
								<ThemeProvider
									attribute="class"
									defaultTheme="system"
									enableSystem
									disableTransitionOnChange>
									{children}
									<Toaster
										position="top-right"
										reverseOrder={false}
									/>
								</ThemeProvider>
							</FocusProvider>
						</UserProvider>
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
