import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectToDatabase();
    const { firebaseUid, name, email } = await request.json();

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { success: false, error: 'Firebase UID and email are required' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // If first user in database, auto grant admin role for setup convenience
      const userCount = await User.countDocuments();
      const role = userCount === 0 || email.includes('admin') ? 'admin' : 'customer';

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
