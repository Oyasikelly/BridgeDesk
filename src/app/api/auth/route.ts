import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Email format validation
    const isValidEmail = (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }
    if (!body.password) {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }
    // Registration logic
    if (body.register) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists.' },
          { status: 409 }
        );
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(body.password, 10);
      // Create user with required fields
      const newUser = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          role: body.role ? body.role.toUpperCase() : 'STUDENT',
          organizationId: 'fupre-org',
        },
      });
      return NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role.toLowerCase(),
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      });
    }
    // Login logic
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        role: body.role?.toUpperCase(),
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          error:
            'User not found or credentials do not match, or role mismatch.',
        },
        { status: 401 }
      );
    }
    // Password check
    if (!user.password) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }
    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }
    // Fetch student or teacher profile if applicable
    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await prisma.student.findUnique({ where: { userId: user.id } });
    } else if (user.role === 'TEACHER') {
      profile = await prisma.teacher.findUnique({ where: { userId: user.id } });
    }
    // Remove conflicting fields from profile before spreading
    const { ...profileFields } = profile || {};
    // Return user info (omit sensitive fields)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        ...profileFields,
      },
    });
  } catch (error) {
    console.error('AUTH ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
