import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Balance from '@/models/Balance';
import Product from '@/models/Product';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    // Listing ALL orders (no filter) is admin-only — that's the full order
    // book including every customer's contact details. Looking up by a
    // specific userId or orderId (unguessable IDs) stays available for
    // logged-in customers checking their own orders / guest tracking.
    if (!userId && !orderId) {
      const authError = await requireAdmin(request);
      if (authError) return authError;
    }

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
    // Prevent spam/fake order flooding: 10 orders/min per IP
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`orders-create:${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many orders placed too quickly. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const { user, customerName, customerEmail, items, shippingAddress, paymentId, paymentStatus } = body;

    if (!user || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'User and items are required' },
        { status: 400 }
      );
    }

    // SECURITY: never trust price/name/image from the client. Look up the
    // real, current price for every item from the database and rebuild the
    // order from that — this stops someone from tampering with the request
    // to check out at a fake (e.g. ₹1) price.
    const productIds = items.map((i) => i.productId).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    const verifiedItems = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.name || item.productId} is no longer available` },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, Math.min(50, Number(item.quantity) || 1));
      if (product.stock < quantity) {
        return NextResponse.json(
          { success: false, error: `${product.name} only has ${product.stock} in stock` },
          { status: 400 }
        );
      }

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price, // real DB price, ignoring whatever the client sent
        quantity,
        image: product.images?.[0] || '',
      });
    }

    // Delivery is free storewide — if that ever changes, add the shipping
    // calculation here so it stays server-verified too.
    const verifiedTotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || '',
      items: verifiedItems,
      totalAmount: verifiedTotal,
      shippingAddress: shippingAddress || {},
      paymentId: paymentId || `MOCK_PAY_${Date.now()}`,
      paymentStatus: paymentStatus || 'Paid',
      status: 'Pending',
    });

    // Decrease stock for each purchased item now that the order is confirmed
    await Promise.all(
      verifiedItems.map((item) =>
        Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } })
      )
    );

    // Create entry in Balance table for financial tracking
    await Balance.create({
      orderId: order._id,
      amount: verifiedTotal,
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