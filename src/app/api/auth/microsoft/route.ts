// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// interface MicrosoftOAuthRequest {
//   teacherId: string;
//   accessToken: string;
//   refreshToken?: string;
//   expiresAt?: number;
// }

// // POST - Connect Microsoft account
// export async function POST(request: NextRequest) {
//   try {
//     const body: MicrosoftOAuthRequest = await request.json();
//     const { teacherId, accessToken, refreshToken, expiresAt } = body;

//     if (!teacherId || !accessToken) {
//       return NextResponse.json(
//         { error: 'Teacher ID and access token are required' },
//         { status: 400 }
//       );
//     }

//     // Verify teacher exists
//     const teacher = await prisma.user.findUnique({
//       where: { id: adminId 'ADMIN' },
//     });

//     if (!teacher) {
//       return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
//     }

//     // Verify Microsoft access token by calling Microsoft Graph API
//     const microsoftResponse = await fetch(
//       'https://graph.microsoft.com/v1.0/me',
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     if (!microsoftResponse.ok) {
//       return NextResponse.json(
//         { error: 'Invalid Microsoft access token' },
//         { status: 400 }
//       );
//     }

//     const microsoftUser = await microsoftResponse.json();

//     // Store Microsoft OAuth data in teacher settings
//     await prisma.teacherSettings.upsert({
//       where: { teacherId },
//       update: {
//         microsoftOAuth: {
//           accessToken,
//           refreshToken,
//           expiresAt,
//           microsoftUserId: microsoftUser.id,
//           microsoftEmail: microsoftUser.mail || microsoftUser.userPrincipalName,
//           microsoftName: microsoftUser.displayName,
//           connectedAt: new Date().toISOString(),
//         },
//       },
//       create: {
//         teacherId,
//         microsoftOAuth: {
//           accessToken,
//           refreshToken,
//           expiresAt,
//           microsoftUserId: microsoftUser.id,
//           microsoftEmail: microsoftUser.mail || microsoftUser.userPrincipalName,
//           microsoftName: microsoftUser.displayName,
//           connectedAt: new Date().toISOString(),
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Microsoft account connected successfully',
//       microsoftUser: {
//         id: microsoftUser.id,
//         email: microsoftUser.mail || microsoftUser.userPrincipalName,
//         name: microsoftUser.displayName,
//       },
//     });
//   } catch (error) {
//     console.error('Error connecting Microsoft account:', error);
//     return NextResponse.json(
//       { error: 'Failed to connect Microsoft account' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Disconnect Microsoft account
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

//     // Remove Microsoft OAuth data
//     await prisma.teacherSettings.update({
//       where: { teacherId },
//       data: {
//         microsoftOAuth: {},
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Microsoft account disconnected successfully',
//     });
//   } catch (error) {
//     console.error('Error disconnecting Microsoft account:', error);
//     return NextResponse.json(
//       { error: 'Failed to disconnect Microsoft account' },
//       { status: 500 }
//     );
//   }
// }
