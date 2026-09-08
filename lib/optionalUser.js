// Use this for routes that should work for BOTH logged-in customers and
// guests — e.g. placing an order without requiring login.
//
// Unlike requireUser, this never blocks the request. If a valid Firebase
// token is present, it returns the verified uid/email so the order can be
// linked to that account. If there's no token (or it's invalid/expired),
// it just returns null values — the caller proceeds as a guest.
//
// Usage:
//   const { uid, email } = await optionalUser(request);
//   // uid is null for guests, a real verified uid for logged-in users

import { getAdminAuth } from '@/lib/firebaseAdmin';

export async function optionalUser(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { uid: null, email: null };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || null };
  } catch (err) {
    // Invalid/expired token — treat as guest rather than failing the order
    return { uid: null, email: null };
  }
}
