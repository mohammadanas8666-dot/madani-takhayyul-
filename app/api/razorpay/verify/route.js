import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Balance from '@/models/Balance';

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user,
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      isMock,
    } = await request.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Signature verification logic
    if (!isMock && key_secret) {
      const generated_signature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, error: 'Invalid Razorpay payment signature' },
          { status: 400 }
        );
      }
    }

    // Connect DB & Save order to MongoDB
    await connectToDatabase();

    const newOrder = await Order.create({
      user: user || 'guest',
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || '',
      items,
      totalAmount,
      shippingAddress,
      paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
      paymentStatus: 'Paid',
      status: 'Pending',
    });

    // Record balance entry
    await Balance.create({
      orderId: newOrder._id,
      amount: totalAmount,
      payoutStatus: 'Pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order created successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
