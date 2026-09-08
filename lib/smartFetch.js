'use client';

// Like authFetch, but never blocks the request. If a user happens to be
// logged in, their Firebase token is attached (so the order/action can be
// linked to their account). If no one is logged in, the request just goes
// out as a guest request — used at checkout so login is optional.

import { auth } from '@/lib/firebase';

export async function smartFetch(url, options = {}) {
  const user = auth.currentUser;
  const headers = { ...(options.headers || {}) };

  if (user) {
    try {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      // Token fetch failed — just proceed as a guest rather than blocking
      console.error('Could not attach auth token, continuing as guest:', err);
    }
  }

  return fetch(url, { ...options, headers });
}
