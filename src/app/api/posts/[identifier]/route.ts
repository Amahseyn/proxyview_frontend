import { NextResponse } from 'next/server';
import { findPost, updatePost, deletePost } from '@/lib/postsStore';

type RouteContext = { params: Promise<{ identifier: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { identifier } = await context.params;
  const admin = new URL(request.url).searchParams.get('admin') === 'true';
  const post = await findPost(identifier, { admin });

  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: post });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { identifier } = await context.params;
    const body = await request.json();
    const updated = await updatePost(identifier, body);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Post not found or cannot be updated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post updated successfully', data: updated });
  } catch (err) {
    console.error('Error updating post:', err);
    const message = err instanceof Error ? err.message : 'Server error updating post';
    const status = message.includes('Scheduled') || message.includes('publish') ? 400 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { identifier } = await context.params;
    const deleted = await deletePost(identifier);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Post not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully', data: deleted });
  } catch (err) {
    console.error('Error deleting post:', err);
    return NextResponse.json({ success: false, message: 'Server error deleting post' }, { status: 500 });
  }
}
