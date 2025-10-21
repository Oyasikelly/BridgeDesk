"use client";

import { MessageStatus } from "@prisma/client";
import { Check, CheckCheck } from "lucide-react";

export default function MessageStat({ status }: { status: MessageStatus }) {
	// Choose icons and colors depending on message status
	switch (status) {
		case "SENT":
			return (
				<Check
					size={14}
					className="text-gray-50 ml-1 inline-block align-middle"
					aria-label="Sent"
				/>
			);

		case "RECEIVED":
			return (
				<CheckCheck
					size={14}
					className="text-gray-50 ml-1 inline-block align-middle"
					aria-label="Delivered"
				/>
			);

		case "READ":
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
