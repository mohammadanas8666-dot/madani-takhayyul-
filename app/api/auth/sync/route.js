import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    // Limit signup/sync spam to 10 requests per minute per IP
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`auth-sync:${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in a moment.' },
        { status: 429 }
      );
    }

    await connectToDatabase();
    const { firebaseUid, name, email } = await request.json();

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { success: false, error: 'Firebase UID and email are required' },
        { status: 400 }
      );
    }

    // Store owner emails here (lowercase) — these accounts always get admin role
    const OWNER_EMAILS = ['mohammadanas8666@gmail.com'];
    const isOwnerEmail = OWNER_EMAILS.includes((email || '').toLowerCase());

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // If first user in database, auto grant admin role for setup convenience.
      // NOTE: the previous "email contains admin" shortcut was removed — it let
      // anyone self-promote to admin just by signing up with an email like
      // "xyzadmin@gmail.com". Only the owner email(s) above, or the very first
      // account ever created, get admin automatically now.
      const userCount = await User.countDocuments();
      const role = isOwnerEmail || userCount === 0 ? 'admin' : 'customer';

      user = await User.create({
        firebaseUid,
        name: name || 'User',
        email,
        role,
      });
    } else {
      // Update name if changed
      if (name && user.name !== name) {
        user.name = name;
        await user.save();
      }
      // Make sure owner email always keeps admin role, even if it was set otherwise before
      if (isOwnerEmail && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}