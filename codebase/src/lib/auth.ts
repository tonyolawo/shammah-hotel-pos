import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'shammah-pos-secret-key-2026-production-ready'
);

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'CASHIER' | 'ACCOUNTANT' | 'ADMIN';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: TokenPayload) {
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set('shammah_session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return jwt;
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('shammah_session')?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('shammah_session');
}
