import { NextResponse } from 'next/server';
import { findPost, updatePost, deletePost } from '@/lib/postsStore';

type RouteContext = { params: Promise<{ identifier: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { identifier } = await context.params;
  const post = findPost(identifier);

  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: post });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { identifier } = await context.params;
    const body = await request.json();
    const updated = updatePost(identifier, body);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Post not found or cannot be updated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post updated successfully', data: updated });
  } catch (err) {
    console.error('Error updating post:', err);
    return NextResponse.json({ success: false, message: 'Server error updating post' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { identifier } = await context.params;
    const deleted = deletePost(identifier);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Post not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully', data: deleted });
  } catch (err) {
    console.error('Error deleting post:', err);
    return NextResponse.json({ success: false, message: 'Server error deleting post' }, { status: 500 });
  }
}
