import { NextResponse } from 'next/server';
import { deleteTag, findTag, updateTag } from '@/lib/repositories/tags';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const data = await findTag(Number(id));
  if (!data) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updateTag(Number(id), body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Tag updated' });
  } catch (err) {
    console.error('Error updating tag:', err);
    return NextResponse.json({ success: false, message: 'Server error updating tag' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteTag(Number(id));
  if (!deleted) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Tag deleted' });
}
