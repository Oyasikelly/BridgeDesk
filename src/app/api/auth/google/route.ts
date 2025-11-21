// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// interface GoogleOAuthRequest {
//   teacherId: string;
//   accessToken: string;
//   refreshToken?: string;
//   expiresAt?: number;
// }

// // POST - Connect Google account
// export async function POST(request: NextRequest) {
//   try {
//     const body: GoogleOAuthRequest = await request.json();
//     const { teacherId, accessToken, refreshToken, expiresAt } = body;

//     if (!teacherId || !accessToken) {
//       return NextResponse.json(
//         { error: 'Teacher ID and access token are required' },
//         { status: 400 }
//       );
//     }

//     // Verify teacher exists
//     const teacher = await prisma.user.findUnique({
//       where: { id: teacherId, role: 'ADMIN' },
//     });

//     if (!teacher) {
//       return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
//     }

//     // Verify Google access token by calling Google's userinfo endpoint
//     const googleResponse = await fetch(
//       'https://www.googleapis.com/oauth2/v2/userinfo',
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     if (!googleResponse.ok) {
//       return NextResponse.json(
//         { error: 'Invalid Google access token' },
//         { status: 400 }
//       );
//     }

//     const googleUser = await googleResponse.json();

//     // Store Google OAuth data in teacher settings
//     await prisma.admin.update({
//       where: { teacherId },
//       update: {
//         googleOAuth: {
//           accessToken,
//           refreshToken,
//           expiresAt,
//           googleUserId: googleUser.id,
//           googleEmail: googleUser.email,
//           googleName: googleUser.name,
//           connectedAt: new Date().toISOString(),
//         },
//       },
//       create: {
//         teacherId,
//         googleOAuth: {
//           accessToken,
//           refreshToken,
//           expiresAt,
//           googleUserId: googleUser.id,
//           googleEmail: googleUser.email,
//           googleName: googleUser.name,
//           connectedAt: new Date().toISOString(),
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Google account connected successfully',
//       googleUser: {
//         id: googleUser.id,
//         email: googleUser.email,
//         name: googleUser.name,
//       },
//     });
//   } catch (error) {
//     console.error('Error connecting Google account:', error);
//     return NextResponse.json(
//       { error: 'Failed to connect Google account' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Disconnect Google account
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const teacherId = searchParams.get('teacherId');

//     if (!teacherId) {
//       return NextResponse.json(
//         { error: 'Teacher ID is required' },
//         { status: 400 }
//       );
//     }

//     // Verify teacher exists
//     const teacher = await prisma.user.findUnique({
//       where: { id: teacherId, role: 'TEACHER' },
//     });

//     if (!teacher) {
//       return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
//     }

//     // Remove Google OAuth data
//     await prisma.teacherSettings.update({
//       where: { teacherId },
//       data: {
//         googleOAuth: {},
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Google account disconnected successfully',
//     });
//   } catch (error) {
//     console.error('Error disconnecting Google account:', error);
//     return NextResponse.json(
//       { error: 'Failed to disconnect Google account' },
//       { status: 500 }
//     );
//   }
// }
