"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";

export async function getAllComplaints(adminId: string) {
	cacheTag("all-complaints"); // 🏷️ Attach tag to this fetch result

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/complaints?adminId=${adminId}`,
		{
			cache: "force-cache", // Required to allow tagging
			next: { tags: ["all-complaints"] },
		}
	);

	const data = await res.json();
	return data;
}
