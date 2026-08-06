import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product, { PRODUCT_CATEGORIES } from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (featured === 'true') {
      query.isFeaturedInSlider = true;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Only admins can create products
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectToDatabase();
    const body = await request.json();
    const { name, price, images, stock, category, color, size, fabric, isFeaturedInSlider, description } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and stock are required' },
        { status: 400 }
      );
    }

    if (!category || !PRODUCT_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      price: Number(price),
      images: Array.isArray(images) ? images : [],
      stock: Number(stock),
      category,
      color: color || '',
      size: size || '',
      fabric: fabric || '',
      isFeaturedInSlider: Boolean(isFeaturedInSlider),
      description: description || '',
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}