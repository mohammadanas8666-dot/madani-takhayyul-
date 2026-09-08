// Use this at the top of any API route that requires the caller to be
// logged in (but NOT necessarily an admin) — e.g. placing an order.
// It verifies the Firebase ID token and returns the real, server-verified
// uid/email. This stops someone from placing an order "as" another
// customer by editing the request body — the uid always comes from the
// verified token, never from whatever the client claims.
//
// Usage:
//   const auth = await requireUser(request);
//   if (auth.error) return auth.error;
//   // auth.uid, auth.email are now trustworthy

import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebaseAdmin';

export async function requireUser(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Please log in to continue.' },
        { status: 401 }
      ),
    };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || null };
  } catch (err) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Your session has expired. Please log in again.' },
        { status: 401 }
      ),
    };
  }
}
