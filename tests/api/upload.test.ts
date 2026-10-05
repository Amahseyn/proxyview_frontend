import fs from 'fs';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { POST as uploadImage } from '@/app/api/upload/route';
import { GET as serveUpload } from '@/app/api/uploads/[filename]/route';
import { parseJson } from '../helpers/request';

const FIXTURE_PATH = path.join(__dirname, '../fixtures/test-image.png');
const uploadedFiles: string[] = [];

afterEach(() => {
  for (const filename of uploadedFiles.splice(0)) {
    const filePath = path.join(process.cwd(), 'public/uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

function makeUploadRequest(file: File | null): Request {
  const formData = new FormData();
  if (file) {
    formData.append('image', file);
  }

  return new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
    headers: { host: 'localhost:3000' },
  });
}

function makeServeRequest(filename: string): Request {
  return new Request(`http://localhost/api/uploads/${filename}`);
}

function routeContext(filename: string) {
  return { params: Promise.resolve({ filename }) };
}

describe('Upload API', () => {
  it('rejects request without image file', async () => {
    const response = await uploadImage(makeUploadRequest(null));
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('No image file uploaded');
  });

  it('rejects unsupported file types', async () => {
    const file = new File(['not an image'], 'test.txt', { type: 'text/plain' });
    const response = await uploadImage(makeUploadRequest(file));
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Only image files');
  });

  it('uploads a valid PNG image', async () => {
    const buffer = fs.readFileSync(FIXTURE_PATH);
    const file = new File([buffer], 'test-image.png', { type: 'image/png' });

    const response = await uploadImage(makeUploadRequest(file));
    const body = await parseJson<{
      success: boolean;
      message: string;
      url: string;
      relativeUrl: string;
      filename: string;
      size: number;
      mimeType: string;
    }>(response);

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Image uploaded successfully');
    expect(body.relativeUrl).toMatch(/^\/api\/uploads\/img-.*\.png$/);
    expect(body.url).toBe(body.relativeUrl);
    expect(body.filename).toMatch(/^img-.*\.png$/);
    expect(body.mimeType).toBe('image/png');
    expect(body.size).toBe(buffer.length);

    uploadedFiles.push(body.filename);
    expect(fs.existsSync(path.join(process.cwd(), 'public/uploads', body.filename))).toBe(true);

    const serveResponse = await serveUpload(makeServeRequest(body.filename), routeContext(body.filename));
    expect(serveResponse.status).toBe(200);
    expect(serveResponse.headers.get('content-type')).toBe('image/png');
    expect(Buffer.from(await serveResponse.arrayBuffer()).length).toBe(buffer.length);
  });

  it('uploads PNG when browser sends an empty MIME type', async () => {
    const buffer = fs.readFileSync(FIXTURE_PATH);
    const file = new File([buffer], 'screenshot.png', { type: '' });

    const response = await uploadImage(makeUploadRequest(file));
    const body = await parseJson<{ success: boolean; filename: string; mimeType: string }>(response);

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.filename).toMatch(/\.png$/);
    expect(body.mimeType).toBe('image/png');
    uploadedFiles.push(body.filename);
  });

  it('uploads WebP images', async () => {
    const webpHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
      0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
      0x18, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d,
      0x01, 0x2a, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00,
    ]);
    const file = new File([webpHeader], 'photo.webp', { type: 'image/webp' });

    const response = await uploadImage(makeUploadRequest(file));
    const body = await parseJson<{
      success: boolean;
      filename: string;
      relativeUrl: string;
      mimeType: string;
    }>(response);

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.filename).toMatch(/\.webp$/);
    expect(body.mimeType).toBe('image/webp');
    expect(body.relativeUrl).toMatch(/\.webp$/);
    uploadedFiles.push(body.filename);

    const serveResponse = await serveUpload(makeServeRequest(body.filename), routeContext(body.filename));
    expect(serveResponse.status).toBe(200);
    expect(serveResponse.headers.get('content-type')).toBe('image/webp');
  });

  it('uploads JPEG images', async () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const file = new File([jpegHeader], 'photo.jpg', { type: 'image/jpeg' });

    const response = await uploadImage(makeUploadRequest(file));
    const body = await parseJson<{ success: boolean; filename: string; mimeType: string }>(response);

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.filename).toMatch(/\.jpg$/);
    expect(body.mimeType).toBe('image/jpeg');
    uploadedFiles.push(body.filename);
  });

  it('rejects files larger than 10 MB', async () => {
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024 + 1, 0);
    const file = new File([largeBuffer], 'large.png', { type: 'image/png' });

    const response = await uploadImage(makeUploadRequest(file));
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('File too large (max 10 MB)');
  });
});
