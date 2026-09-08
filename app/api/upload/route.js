import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { requireAdmin } from '@/lib/requireAdmin';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function POST(request) {
  try {
      // Only admins upload product images
          const authError = await requireAdmin(request);
              if (authError) return authError;

                  // Uploads cost money (Cloudinary) — keep this tight: 15 uploads/min per IP
                      const ip = getClientIp(request);
                          const { allowed } = rateLimit(`upload:${ip}`, { limit: 15, windowMs: 60 * 1000 });
                              if (!allowed) {
                                    return NextResponse.json(
                                            { success: false, error: 'Too many uploads. Please slow down and try again shortly.' },
                                                    { status: 429 }
                                                          );
                                                              }

                                                                  const formData = await request.formData();
                                                                      const file = formData.get('file');

                                                                          if (!file) {
                                                                                return NextResponse.json(
                                                                                        { success: false, error: 'No image file provided' },
                                                                                                { status: 400 }
                                                                                                      );
                                                                                                          }

                                                                                                              if (!ALLOWED_TYPES.includes(file.type)) {
                                                                                                                    return NextResponse.json(
                                                                                                                            { success: false, error: 'Only JPEG, PNG, WEBP, or AVIF images are allowed' },
                                                                                                                                    { status: 400 }
                                                                                                                                          );
                                                                                                                                              }

                                                                                                                                                  if (file.size > MAX_FILE_SIZE) {
                                                                                                                                                        return NextResponse.json(
                                                                                                                                                                { success: false, error: 'Image must be under 5MB' },
                                                                                                                                                                        { status: 400 }
                                                                                                                                                                              );
                                                                                                                                                                                  }

                                                                                                                                                                                      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
                                                                                                                                                                                          const apiKey = process.env.CLOUDINARY_API_KEY;
                                                                                                                                                                                              const apiSecret = process.env.CLOUDINARY_API_SECRET;

                                                                                                                                                                                                  if (!cloudName || !apiKey || !apiSecret) {
                                                                                                                                                                                                        console.error('Cloudinary env vars missing: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
                                                                                                                                                                                                              return NextResponse.json(
                                                                                                                                                                                                                      {
                                                                                                                                                                                                                                success: false,
                                                                                                                                                                                                                                          error: 'Image hosting is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.',
                                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                                          { status: 500 }
                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                        const arrayBuffer = await file.arrayBuffer();
                                                                                                                                                                                                                                                                            const buffer = Buffer.from(arrayBuffer);

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