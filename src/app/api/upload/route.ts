import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'No image file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed!' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: 'File too large (max 10 MB)' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const imageUrl = `${protocol}://${host}/uploads/${filename}`;
    const relativeUrl = `/uploads/${filename}`;

    return NextResponse.json(
      {
        success: true,
        message: 'Image uploaded successfully',
        url: imageUrl,
        relativeUrl,
        filename,
        size: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json({ success: false, message, error: message }, { status: 500 });
  }
}
