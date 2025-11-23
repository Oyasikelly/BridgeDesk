"use client";

import { useEffect, useRef, useState } from "react";
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
	Calendar,
	Briefcase,
	Shield,
	LogIn,
} from "lucide-react";
import { useUser } from "@/context/userContext";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import Image from "next/image";

type Profile = {
	fullName: string;
	email: string;
	phone: string;
	department: string;
	role: string;
	avatar: string;
	dateJoined: string;
	lastLogin: string | null;
	avatarFile?: File | null;
};

export default function AdminProfilePage() {
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const { userData, setUserData, refreshUserData } = useUser();

	const [profile, setProfile] = useState<Profile>({
		fullName: userData?.admin?.fullName || "N/A",
		email: userData?.admin?.email || "N/A",
		phone: userData?.admin?.phone || "N/A",
		department: userData?.admin?.department || "N/A",
		role: userData?.admin?.role || "N/A",
		avatar: userData?.admin?.avatarUrl || "/assets/default-avatar.png",
		dateJoined:
			userData?.admin?.dateJoined instanceof Date
				? userData?.admin?.dateJoined.toISOString()
				: userData?.admin?.dateJoined ?? "N/A",
		lastLogin:
			userData?.admin?.lastLogin instanceof Date
				? userData?.admin?.lastLogin.toISOString()
				: userData?.admin?.lastLogin ?? null,
		avatarFile: null,
	});

	const adminId = userData?.admin?.id;

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch(`/api/admin/profile/${adminId}`);
				const data = await res.json();
				setProfile((prev) => ({ ...prev, ...data }));
			} catch (error) {
				console.error("Error loading profile:", error);
				toast.error("Failed to load profile data.");
			} finally {
				setLoading(false);
			}
		};
		if (adminId) fetchProfile();
	}, [adminId]);

	// ✅ Handle field changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setProfile((prev) => ({ ...prev, [name]: value }));
	};

	// ✅ Handle avatar file selection
	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith("image/")) {
				toast.error("Please select a valid image file");
				return;
			}
			setProfile((prev) => ({
				...prev,
				avatar: URL.createObjectURL(file),
				avatarFile: file,
			}));
		}
	};

	// ✅ Save changes to backend using FormData
	const handleSave = async () => {
		try {
			setSaving(true);
			const formData = new FormData();
			formData.append("id", userData?.admin?.id || "");
			formData.append("fullName", profile.fullName);
			formData.append("email", profile.email);
			formData.append("phone", profile.phone);
			formData.append("department", profile.department);
			formData.append("role", profile.role);

			if (profile.avatarFile instanceof File) {
				formData.append("avatar", profile.avatarFile);
			}

			const res = await fetch(`/api/admin/profile/${adminId}`, {
				method: "PUT",
				body: formData,
			});

			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error || "Failed to update admin profile");
			}

			const { admin } = await res.json();

			setUserData((prev) =>
				prev ? { ...prev, admin: { ...prev.admin, ...admin } } : prev
			);
			setProfile((prev) => ({ ...prev, ...admin }));
			await refreshUserData();
			setEditing(false);

			toast.success("Profile updated successfully ✅");
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Update failed ❌";
			toast.error(errorMessage);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="p-6 bg-background min-h-screen">
			{loading ? (
				<div className="flex justify-center items-center h-[80vh] text-gray-500">
					<Spinner
						size="md"
						color="primary"
					/>
					<span className="ml-2">Loading profile...</span>
				</div>
			) : !profile ? (
				<p className="text-center p-10">Profile not found</p>
			) : (
				<Card className="max-w-4xl mx-auto shadow-md border border-primary-foreground">
					<CardHeader className="flex justify-between items-center">
						<div className="flex items-center gap-4">
							<div className="relative">
								<Image
									src={profile.avatar}
									alt="Profile"
									width={96}
									height={96}
									className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
								/>
								{editing && (
									<>
										<label
											htmlFor="avatar-upload"
											className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full hover:bg-primary/80 cursor-pointer transition">
											<Camera size={16} />
										</label>
										<input
											id="avatar-upload"
											type="file"
											accept="image/*"
											className="hidden"
											ref={fileInputRef}
											onChange={handleAvatarChange}
										/>
									</>
								)}
							</div>
							<div>
								<CardTitle className="text-2xl font-bold text-foreground/80">
									{profile.fullName}
								</CardTitle>
								<p className="text-gray-500">{profile.department}</p>
								<p className="text-gray-500 text-sm">{profile.role}</p>
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
								<label className="text-sm text-gray-600 flex items-center gap-2">
									<Mail size={16} /> Email
								</label>
								{editing ? (
									<Input
										name="email"
										value={profile.email}
										disabled
										onChange={handleChange}
									/>
								) : (
									<p className="font-medium text-foreground/80">
										{profile.email}
									</p>
								)}
							</div>

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
						</div>

						{/* Right Column */}
						<div className="space-y-4">
							<div>
								<label className="text-sm text-gray-600 flex items-center gap-2">
									<Briefcase size={16} /> Department
								</label>
								{editing ? (
									<Input
										name="department"
										value={profile.department}
										onChange={handleChange}
									/>
								) : (
									<p className="font-medium text-foreground/80">
										{profile.department}
									</p>
								)}
							</div>

							<div>
								<label className="text-sm text-gray-600 flex items-center gap-2">
									<Shield size={16} /> Role
								</label>
								<p className="font-medium text-foreground/80">{profile.role}</p>
							</div>

							<div className="flex items-center gap-2 text-sm text-gray-600">
								<Calendar size={16} />
								<p>
									Joined:{" "}
									<span className="font-medium text-foreground/80">
										{new Date(profile.dateJoined).toDateString()}
									</span>
								</p>
							</div>

							<div className="flex items-center gap-2 text-sm text-gray-600">
								<LogIn size={16} />
								<p>
									Last Login:{" "}
									<span className="font-medium text-foreground/80">
										{profile.lastLogin
											? new Date(profile.lastLogin).toLocaleString()
											: "No login recorded"}
									</span>
								</p>
							</div>
						</div>
					</CardContent>

					{editing && (
						<div className="flex justify-end p-4 border-t bg-gray-50 dark:bg-primary-foreground">
							<Button
								onClick={handleSave}
								disabled={saving}
								className="bg-primary hover:bg-primary/90 text-white">
								{saving ? (
									<Spinner
										size="sm"
										color="white"
									/>
								) : (
									"Save Changes"
								)}
							</Button>
						</div>
					)}
				</Card>
			)}
		</div>
	);
}
