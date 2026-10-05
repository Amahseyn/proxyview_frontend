import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  buildUploadFilename,
  getUploadServePath,
  MAX_UPLOAD_SIZE,
  resolveUploadMimeType,
  UPLOAD_DIR,
} from '@/lib/uploads';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'No image file uploaded' }, { status: 400 });
    }

    const mimeType = resolveUploadMimeType(file);
    if (!mimeType) {
      return NextResponse.json(
        { success: false, message: 'Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed!' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ success: false, message: 'File too large (max 10 MB)' }, { status: 400 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const filename = buildUploadFilename(file, mimeType);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

    const relativeUrl = getUploadServePath(filename);

    return NextResponse.json(
      {
        success: true,
        message: 'Image uploaded successfully',
        url: relativeUrl,
        relativeUrl,
        filename,
        size: file.size,
        mimeType,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json({ success: false, message, error: message }, { status: 500 });
  }
}
