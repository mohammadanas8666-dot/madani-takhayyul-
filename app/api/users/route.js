import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request) {
  try {
    // User list (names, emails) is admin-only
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectToDatabase();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // This is the most sensitive endpoint in the app — it grants admin
    // access. Only an existing admin may promote/demote another user.
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectToDatabase();
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'customer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Role must be admin or customer' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}