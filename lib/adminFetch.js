'use client';

// Client-side helper: works exactly like fetch(), but automatically
// attaches the current admin's Firebase login token so protected API
// routes (products, orders, balance, users) can verify who's calling.
//
// Usage: replace `fetch(url, options)` with `adminFetch(url, options)`
// on any admin-dashboard page that calls a protected endpoint.

import { auth } from '@/lib/firebase';

export async function adminFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in as an admin to do this.');
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