// Use this at the top of any API route that only admins should be able to
// call. It checks the Authorization header for a valid Firebase ID token,
// then confirms that user has role: 'admin' in MongoDB.
//
// Usage inside a route handler:
//
//   const authError = await requireAdmin(request);
//   if (authError) return authError;
//
// If it returns null, the request is from a verified admin and you can
// continue. If it returns a NextResponse, return that response immediately
// — the caller is not authorized.

import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebaseAdmin';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function requireAdmin(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated. Please log in.' },
      { status: 401 }
    );
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired session. Please log in again.' },
      { status: 401 }
    );
  }

  await connectToDatabase();
  const user = await User.findOne({ firebaseUid: decoded.uid });

  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin access required.' },
      { status: 403 }
    );
  }

  // Authorized — no error response, caller proceeds.
  return null;
}