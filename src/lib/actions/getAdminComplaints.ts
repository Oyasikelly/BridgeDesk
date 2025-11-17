"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";

export async function getAdminComplaints(adminId: string) {
	cacheTag("admin-complaints");

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/complaints?adminId=${adminId}`,
		{
			cache: "force-cache",
			next: { tags: ["admin-complaints"] },
		}
	);

	return res.json();
}
