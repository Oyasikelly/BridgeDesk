"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";

export async function getComplainSummary(userData: { id: string }) {
	cacheTag("complain-summary"); // 🏷️ Attach tag to this fetch result

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/complaints/summary?studentId=${userData.id}`,
		{
			cache: "force-cache", // Required to allow tagging
			next: { tags: ["complain-summary"] },
		}
	);

	const data = await res.json();
	return data;
}
