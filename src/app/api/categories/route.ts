import { NextResponse } from 'next/server';
import { createCategory, getAllCategories } from '@/lib/repositories/categories';

export async function GET() {
  const data = await getAllCategories();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description } = body;
    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Category name is required' }, { status: 400 });
    }
    const data = await createCategory({ name, slug, description });
    return NextResponse.json({ success: true, data, message: 'Category created' }, { status: 201 });
  } catch (err) {
    console.error('Error creating category:', err);
    return NextResponse.json({ success: false, message: 'Server error creating category' }, { status: 500 });
  }
}
