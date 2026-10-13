import { NextResponse } from 'next/server';
import { deleteCategory, findCategory, updateCategory } from '@/lib/repositories/categories';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const data = await findCategory(Number(id));
  if (!data) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updateCategory(Number(id), body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Category updated' });
  } catch (err) {
    console.error('Error updating category:', err);
    return NextResponse.json({ success: false, message: 'Server error updating category' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteCategory(Number(id));
  if (!deleted) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Category deleted' });
}
