import { NextResponse } from 'next/server';
import { Storage, DEFAULT_SUPERADMIN } from '@/lib/storage';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Please enter both username and password' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();

    // Check if SuperAdmin
    if (
      trimmedUsername.toUpperCase() === 'SUPERADMIN' &&
      password === 'admin@123'
    ) {
      const userSession = {
        id: DEFAULT_SUPERADMIN.id,
        name: DEFAULT_SUPERADMIN.name,
        username: DEFAULT_SUPERADMIN.username,
        role: DEFAULT_SUPERADMIN.role,
        phone: DEFAULT_SUPERADMIN.phone,
      };
      await createSession(userSession);
      return NextResponse.json({ success: true, user: userSession, redirect: '/admin' });
    }

    // Check volunteer users in storage
    const user = Storage.getUserByUsername(trimmedUsername);
    if (!user || user.passwordHash !== password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const userSession = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      phone: user.phone,
    };

    await createSession(userSession);

    const redirect = user.role === 'SUPERADMIN' ? '/admin' : '/volunteer';
    return NextResponse.json({ success: true, user: userSession, redirect });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
