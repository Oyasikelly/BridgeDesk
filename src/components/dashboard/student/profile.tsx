"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Camera,
	Edit,
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
} from "lucide-react";

export default function StudentProfilePage() {
	const [editing, setEditing] = useState(false);
	const [profile, setProfile] = useState({
		fullName: "Kelly Bright",
		matricNo: "FUPRE/EE/20/1023",
		department: "Electrical & Electronics Engineering",
		level: "500 Level",
		email: "kellybright@student.fupre.edu.ng",
		phone: "+234 803 555 2812",
		hostel: "Hall B - Room 204",
		dateJoined: "September 2020",
		avatar: "/student-avatar.jpg",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setProfile((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className="p-6 bg-background  min-h-screen">
			<Card className="max-w-4xl mx-auto shadow-md border border-primary-foreground">
				<CardHeader className="flex justify-between items-center">
					<div className="flex items-center gap-4">
						<div className="relative">
							<img
								src={profile.avatar}
								alt="Profile"
								className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
							/>
							<button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full hover:bg-primary/80 transition">
								<Camera size={16} />
							</button>
						</div>
						<div>
							<CardTitle className="text-2xl font-bold text-foreground/80">
								{profile.fullName}
							</CardTitle>
							<p className="text-gray-500">{profile.department}</p>
							<p className="text-gray-500">{profile.level}</p>
						</div>
					</div>

					<Button
						onClick={() => setEditing(!editing)}
						className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white">
						<Edit size={16} />
						{editing ? "Cancel" : "Edit Profile"}
					</Button>
				</CardHeader>

				<Separator />

				<CardContent className="grid md:grid-cols-2 gap-6 mt-4">
					{/* Left Column */}
					<div className="space-y-4">
						<div>
							<label className="text-sm text-gray-600 flex items-center gap-2">
								<User size={16} /> Full Name
							</label>
							{editing ? (
								<Input
									name="fullName"
									value={profile.fullName}
									onChange={handleChange}
								/>
							) : (
								<p className="font-medium text-foreground/80">
									{profile.fullName}
								</p>
							)}
						</div>

						<div>
							<label className="text-sm text-gray-600">Matric Number</label>
							<p className="font-medium text-foreground/80">
								{profile.matricNo}
							</p>
						</div>

						<div>
							<label className="text-sm text-gray-600 flex items-center gap-2">
								<Mail size={16} /> Email
							</label>
							{editing ? (
								<Input
									name="email"
									value={profile.email}
									onChange={handleChange}
								/>
							) : (
								<p className="font-medium text-foreground/80">
									{profile.email}
								</p>
							)}
						</div>
					</div>

					{/* Right Column */}
					<div className="space-y-4">
						<div>
							<label className="text-sm text-gray-600 flex items-center gap-2">
								<Phone size={16} /> Phone
							</label>
							{editing ? (
								<Input
									name="phone"
									value={profile.phone}
									onChange={handleChange}
								/>
							) : (
								<p className="font-medium text-foreground/80">
									{profile.phone}
								</p>
							)}
						</div>

						<div>
							<label className="text-sm text-gray-600 flex items-center gap-2">
								<MapPin size={16} /> Hostel / Room
							</label>
							{editing ? (
								<Input
									name="hostel"
									value={profile.hostel}
									onChange={handleChange}
								/>
							) : (
								<p className="font-medium text-foreground/80">
									{profile.hostel}
								</p>
							)}
						</div>

						<div>
							<label className="text-sm text-gray-600 flex items-center gap-2">
								<Calendar size={16} /> Joined
							</label>
							<p className="font-medium text-foreground/80">
								{profile.dateJoined}
							</p>
						</div>
					</div>
				</CardContent>

				{editing && (
					<div className="flex justify-end p-4 border-t bg-gray-50 dark:bg-primary-foreground">
						<Button className="bg-primary hover:bg-primary/90 text-white">
							Save Changes
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
}
