import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Balance from '@/models/Balance';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request) {
  try {
    // Revenue/balance data is admin-only
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectToDatabase();

    const balanceRecords = await Balance.find().populate({
      path: 'orderId',
      select: 'customerName totalAmount status createdAt paymentId',
    }).sort({ createdAt: -1 });

    const totalSales = balanceRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingPayout = balanceRecords
      .filter((rec) => rec.payoutStatus === 'Pending')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const paidOut = totalSales - pendingPayout;

    return NextResponse.json({
      success: true,
      summary: {
        totalSales,
        pendingPayout,
        paidOut,
        totalOrders: balanceRecords.length,
      },
      records: balanceRecords,
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}