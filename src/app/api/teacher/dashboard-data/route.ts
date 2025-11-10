import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		// Get userId from query params for now
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json({ error: "Missing userId" }, { status: 400 });
		}

		console.log("🔍 Processing request for user ID:", userId);

		// Find the admin profile for the authenticated user
		const admin = await prisma.admin.findUnique({
			where: { userId },
			include: {
				user: {
					include: {
						organization: true,
						unit: true,
					},
				},
				subjects: {
					include: {
						quizzes: {
							include: {
								attempts: {
									include: {
										student: {
											include: {
												student: true,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		});

		if (!admin) {
			console.log("❌ admin not found for user ID:", userId);
			// Create a admin profile for the authenticated user
			const userInDb = await prisma.user.findUnique({
				where: { id: userId },
				include: { admin: true },
			});

			if (userInDb && userInDb.role === "admin") {
				console.log("🔧 Creating admin profile for authenticated user");
				await prisma.admin.create({
					data: {
						userId: userId,
						employeeId: `T${Date.now()}`,
						department: "General",
						phoneNumber: null,
					},
				});

				// Return empty dashboard data for new admin
				return NextResponse.json({
					stats: {
						totalStudents: 0,
						totalQuizzes: 0,
						activeQuizzes: 0,
						completionRate: 0,
					},
					recentQuizzes: [],
					classPerformance: [],
					pendingAssignments: [],
				});
			} else {
				return NextResponse.json(
					{ error: "User is not a admin" },
					{ status: 403 }
				);
			}
		}

		// Get the admin's subjects
		const adminSubjects = admin.subjects.map((subject) => subject.id);
		console.log("📚 admin subjects:", adminSubjects);

		// Calculate dashboard stats - quizzes for admin's subjects
		const studentAttempts = await prisma.quizAttempt.findMany({
			where: {
				quiz: {
					subjectId: {
						in: adminSubjects,
					},
				},
			},
			select: {
				studentId: true,
			},
		});

		const totalStudents = new Set(
			studentAttempts.map((attempt) => attempt.studentId)
		).size;

		const totalQuizzes = await prisma.quiz.count({
			where: {
				subjectId: {
					in: adminSubjects,
				},
			},
		});

		const activeQuizzes = await prisma.quiz.count({
			where: {
				subjectId: {
					in: adminSubjects,
				},
				isPublished: true,
			},
		});

		const totalQuizAttempts = await prisma.quizAttempt.count({
			where: {
				quiz: {
					subjectId: {
						in: adminSubjects,
					},
				},
			},
		});

		const completedAttempts = await prisma.quizAttempt.count({
			where: {
				quiz: {
					subjectId: {
						in: adminSubjects,
					},
				},
				completedAt: {
					not: null,
				},
			},
		});

		const completionRate =
			totalQuizAttempts > 0
				? Math.round((completedAttempts / totalQuizAttempts) * 100)
				: 0;

		// Get recent quizzes
		const recentQuizzes = await prisma.quiz.findMany({
			where: {
				adminId: userId,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 5,
			include: {
				subject: true,
				attempts: {
					include: {
						student: {
							include: {
								student: true,
							},
						},
					},
				},
			},
		});

		// Calculate class performance by subject
		const classPerformance = await Promise.all(
			admin.subjects.map(async (subject) => {
				const attempts = await prisma.quizAttempt.findMany({
					where: {
						quiz: {
							subjectId: subject.id,
							adminId: userId,
						},
						completedAt: {
							not: null,
						},
					},
					include: {
						student: {
							include: {
								student: true,
							},
						},
					},
				});

				const studentCount = new Set(attempts.map((a) => a.studentId)).size;
				const validScores = attempts.filter(
					(a) => a.score !== null && a.score > 0
				);
				const averageScore =
					validScores.length > 0
						? Math.round(
								validScores.reduce((sum, a) => sum + a.score, 0) /
									validScores.length
						  )
						: 0;

				const totalAttempts = await prisma.quizAttempt.count({
					where: {
						quiz: {
							subjectId: subject.id,
							adminId: userId,
						},
					},
				});

				const completedAttemptsForSubject = await prisma.quizAttempt.count({
					where: {
						quiz: {
							subjectId: subject.id,
							adminId: userId,
						},
						completedAt: {
							not: null,
						},
					},
				});

				const completionRate =
					totalAttempts > 0
						? Math.round((completedAttemptsForSubject / totalAttempts) * 100)
						: 0;

				return {
					subjectId: subject.id,
					subjectName: subject.name,
					studentCount,
					averageScore,
					completionRate,
					totalAttempts,
				};
			})
		);

		// Get pending assignments (quizzes with no attempts)
		const pendingAssignments = await prisma.quiz.findMany({
			where: {
				adminId: userId,
				isPublished: true,
				attempts: {
					none: {},
				},
			},
			include: {
				subject: true,
			},
			take: 5,
		});

		return NextResponse.json({
			stats: {
				totalStudents,
				totalQuizzes,
				activeQuizzes,
				completionRate,
			},
			recentQuizzes,
			classPerformance,
			pendingAssignments,
		});
	} catch (error) {
		console.error("❌ Error fetching dashboard data:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
