import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Balance from '@/models/Balance';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    const query = {};
    if (userId) {
      query.user = userId;
    }
    if (orderId) {
      query._id = orderId;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { user, customerName, customerEmail, items, totalAmount, shippingAddress, paymentId, paymentStatus } = body;

    if (!user || !items || !items.length || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'User, items, and total amount are required' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      user,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || '',
      items,
      totalAmount,
      shippingAddress: shippingAddress || {},
      paymentId: paymentId || `MOCK_PAY_${Date.now()}`,
      paymentStatus: paymentStatus || 'Paid',
      status: 'Pending',
    });

    // Create entry in Balance table for financial tracking
    await Balance.create({
      orderId: order._id,
      amount: totalAmount,
      payoutStatus: 'Pending',
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
