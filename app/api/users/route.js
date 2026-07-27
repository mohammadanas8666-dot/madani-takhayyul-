import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
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
    await connectToDatabase();
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'User ID and role are required' },
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
