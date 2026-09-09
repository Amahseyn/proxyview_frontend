import { NextResponse } from 'next/server';
import { queryPosts, createPost } from '@/lib/postsStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined;

  const { data, total } = queryPosts({ category, search, limit, page });
  return NextResponse.json({ success: true, data, total });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, excerpt, category, author, date, thumbnail, slug } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Post title is required' }, { status: 400 });
    }

    const newPost = createPost({
      title: title.trim(),
      content: content || '',
      excerpt: excerpt || '',
      category: category || 'Guides',
      author: author || 'wm',
      date: date || undefined,
      thumbnail: thumbnail || '',
      slug: slug || undefined,
    });

    return NextResponse.json(
      { success: true, message: 'Post created successfully', data: newPost },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating post:', err);
    return NextResponse.json({ success: false, message: 'Server error creating post' }, { status: 500 });
  }
}
