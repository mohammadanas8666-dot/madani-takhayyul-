import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If Cloudinary keys are not fully present, fallback to base64 Data URL for easy dev mode
    if (!cloudName || !apiKey || !apiSecret) {
      const base64Data = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        isDevFallback: true,
        message: 'Using Data URL fallback. Provide CLOUDINARY_* keys in .env.local to enable Cloudinary hosted uploads.',
      });
    }

    // Upload to Cloudinary using upload stream
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'madani-products' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
