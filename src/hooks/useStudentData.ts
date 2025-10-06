import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/userContext";
import { supabase } from "@/lib/supabase";

export interface StudentDashboardData {
	dashboard: {
		stats: {
			completedQuizzesCount: number;
			averageScore: number;
			studyStreak: number;
			totalPoints: number;
			timeSpent: number;
			weeklyProgress: { completed: number; total: number };
			monthlyProgress: { completed: number; total: number };
		};
		availableQuizzes: Array<{
			id: string;
			title: string;
			description: string;
			timeLimit: number;
			totalQuestions: number;
			subject: string;
			unit: string;
			difficulty: string;
			createdAt: string;
		}>;
		recentAttempts: Array<{
			id: string;
			quizTitle: string;
			score: number;
			status: string;
			completedAt: string;
			subject: string;
			unit: string;
		}>;
		achievements: Array<{
			id: string;
			name: string;
			description: string;
			icon: string;
			earnedAt: string;
		}>;
	};
	progress: {
		performance: Array<{
			date: string;
			score: number;
			quizTitle: string;
		}>;
		topicMastery: Array<{
			subjectId: string;
			subjectName: string;
			quizzesCompleted: number;
			averageScore: number;
			masteryLevel: string;
		}>;
		weeklyProgress: { completed: number; total: number };
		monthlyProgress: { completed: number; total: number };
	};
	quizzes: {
		subjects: Array<{
			id: string;
			name: string;
			units: Array<{
				id: string;
				name: string;
				quizzes: Array<{
					id: string;
					title: string;
					description: string;
					timeLimit: number;
					totalQuestions: number;
					difficulty: string;
					isCompleted: boolean;
				}>;
			}>;
		}>;
		availableQuizzes: Array<{
			id: string;
			title: string;
			description: string;
			timeLimit: number;
			totalQuestions: number;
			subject: string;
			unit: string;
			difficulty: string;
			createdAt: string;
		}>;
		completedQuizzes: string[];
	};
	achievements: {
		earned: Array<{
			id: string;
			name: string;
			description: string;
			icon: string;
			earnedAt: string;
		}>;
		totalEarned: number;
		totalAvailable: number;
	};
	profile: {
		user: {
			id: string;
			name: string;
			email: string;
			role: string;
			profileImageUrl?: string;
			studentId: string;
			academicLevel: string;
			classYear: string;
			phoneNumber?: string;
		};
		organization: {
			id: string;
			name: string;
			description?: string;
		};
		profileCompleted: boolean;
	};
	settings: {
		notificationPreferences: {
			emailQuizzes: boolean;
			emailResults: boolean;
			inappAchievements: boolean;
		};
		personalization: {
			darkMode: boolean;
			aiTone: string;
			leaderboardOptin: boolean;
		};
		privacy: {
			analyticsConsent: boolean;
			dataRetention: string;
		};
		accessibility: {
			fontSize: string;
			highContrast: boolean;
			reducedMotion: boolean;
		};
	};
	exportData: {
		profile: {
			name: string;
			email: string;
			school: string;
			department: string;
			year: string;
			regNo: string;
			phone: string;
			academicLevel: string;
		};
		quizAttempts: Array<{
			quizTitle: string;
			subject: string;
			score: number;
			totalPoints: number;
			completedAt: string;
		}>;
		achievements: Array<{
			title: string;
			name: string;
			description: string;
		}>;
		badges: Array<{
			name: string;
			description: string;
		}>;
		analytics: {
			totalQuizzes: number;
			averageScore: number;
			studyStreak: number;
			totalTimeSpent: number;
		};
	};
}

export function useStudentData() {
	const { userData, loading: userLoading } = useUser();
	const [data, setData] = useState<StudentDashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStudentData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Get the current session from Supabase
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				throw new Error("No authentication token available");
			}

			const response = await fetch("/api/student/dashboard-data", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch student data");
			}

			const studentData = await response.json();
			setData(studentData);
		} catch (err) {
			console.error("Error fetching student data:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch student data"
			);
		} finally {
			setLoading(false);
		}
	};

	const refreshData = () => {
		fetchStudentData();
	};

	const hasInitialized = useRef(false);
	const lastUserId = useRef<string | null>(null);

	useEffect(() => {
		// Only fetch if user ID actually changed and not already initialized
		if (
			userData?.id &&
			userData?.role === "STUDENT" &&
			!userLoading &&
			userData.id !== lastUserId.current
		) {
			lastUserId.current = userData.id;
			if (!hasInitialized.current) {
				hasInitialized.current = true;
			}
			fetchStudentData();
		}
	}, [userData?.id, userData?.role, userLoading]);

	return {
		data,
		loading: loading || userLoading,
		error,
		refreshData,
	};
}
