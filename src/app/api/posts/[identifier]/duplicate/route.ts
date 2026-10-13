import { NextResponse } from 'next/server';
import { duplicatePost } from '@/lib/postsStore';

type RouteContext = { params: Promise<{ identifier: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { identifier } = await context.params;
    const duplicated = await duplicatePost(identifier);
    if (!duplicated) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: duplicated, message: 'Post duplicated' }, { status: 201 });
  } catch (err) {
    console.error('Error duplicating post:', err);
    return NextResponse.json({ success: false, message: 'Server error duplicating post' }, { status: 500 });
  }
}
