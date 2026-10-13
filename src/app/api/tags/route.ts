import { NextResponse } from 'next/server';
import { createTag, getAllTags } from '@/lib/repositories/tags';

export async function GET() {
  const data = await getAllTags();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug } = body;
    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Tag name is required' }, { status: 400 });
    }
    const data = await createTag({ name, slug });
    return NextResponse.json({ success: true, data, message: 'Tag created' }, { status: 201 });
  } catch (err) {
    console.error('Error creating tag:', err);
    return NextResponse.json({ success: false, message: 'Server error creating tag' }, { status: 500 });
  }
}
