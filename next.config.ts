import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			// RandomUser
			{
				protocol: "https",
				hostname: "randomuser.me",
				pathname: "/api/portraits/**",
			},
			// Cloudinary
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
