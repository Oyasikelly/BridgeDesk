"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";

export async function getStudentPendingComplaints(studentId: string) {
	cacheTag("student-complaints");

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/complaints?studentId=${studentId}`,
		{
			cache: "force-cache",
			next: { tags: ["student-complaints"] },
		}
	);

	return res.json();
}
