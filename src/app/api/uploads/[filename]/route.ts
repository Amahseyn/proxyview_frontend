import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import {
  getUploadContentType,
  isSafeUploadFilename,
  UPLOAD_DIR,
} from '@/lib/uploads';

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;

  if (!isSafeUploadFilename(filename)) {
    return NextResponse.json({ success: false, message: 'Invalid filename' }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ success: false, message: 'Image not found' }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const contentType = getUploadContentType(filename);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(buffer.length),
    },
  });
}
