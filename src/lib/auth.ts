import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserSession } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mahallu_portal_secure_jwt_secret_key_2026_emerald'
);

const COOKIE_NAME = 'mahallu_session';

export async function createSession(user: UserSession): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
