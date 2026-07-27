import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Balance from '@/models/Balance';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { status, trackingId, payoutStatus } = body;

    const updateData = {};
    if (status) {
      const allowedStatuses = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid order status value' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (trackingId !== undefined) {
      updateData.trackingId = trackingId;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (payoutStatus || status === 'Delivered') {
      await Balance.findOneAndUpdate(
        { orderId: id },
        { payoutStatus: payoutStatus || (status === 'Delivered' ? 'Paid' : 'Pending') }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
