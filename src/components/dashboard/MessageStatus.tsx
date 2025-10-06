"use client";

import { Check, CheckCheck } from "lucide-react";

export default function MessageStatus({
	status,
}: {
	status: "sent" | "delivered" | "read";
}) {
	// Choose icons and colors depending on message status
	switch (status) {
		case "sent":
			return (
				<Check
					size={14}
					className="text-gray-50 ml-1 inline-block align-middle"
					aria-label="Sent"
				/>
			);

		case "delivered":
			return (
				<CheckCheck
					size={14}
					className="text-gray-50 ml-1 inline-block align-middle"
					aria-label="Delivered"
				/>
			);

		case "read":
			return (
				<CheckCheck
					size={14}
					className="text-primary ml-1 inline-block align-middle"
					aria-label="Read"
				/>
			);

		default:
			return null;
	}
}
