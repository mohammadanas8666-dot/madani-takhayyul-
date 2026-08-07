'use client';

// Like adminFetch, but for any logged-in customer (not just admins).
// Attaches the current user's Firebase login token so the server can
// verify who is really placing the order — used at checkout.

import { auth } from '@/lib/firebase';

export async function authFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please log in to continue.');
  }

  const token = await user.getIdToken();

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
