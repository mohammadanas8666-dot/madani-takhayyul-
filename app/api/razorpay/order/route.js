import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Amount is required' },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      // Mock Razorpay Order for development test drive
      const mockOrderId = `order_mock_${Date.now()}`;
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(amount * 100),
        currency,
        key: 'rzp_test_mock_key',
        isMock: true,
        message: 'Using simulated Razorpay Order. Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env.local for production API.',
      });
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: key_id,
      isMock: false,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
