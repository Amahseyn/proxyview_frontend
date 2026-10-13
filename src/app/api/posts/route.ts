import { NextResponse } from 'next/server';
import { queryPosts, createPost } from '@/lib/postsStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined;
  const admin = searchParams.get('admin') === 'true';
  const tagId = searchParams.get('tagId') ? parseInt(searchParams.get('tagId')!, 10) : undefined;
  const sortBy = (searchParams.get('sortBy') as 'id' | 'title' | 'date' | 'updatedAt' | 'status') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  const { data, total } = await queryPosts({
    category,
    search,
    status,
    limit,
    page,
    admin,
    tagId,
    sortBy,
    sortOrder,
  });
  return NextResponse.json({ success: true, data, total });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      category,
      author,
      date,
      thumbnail,
      metaTitle,
      metaDescription,
      slug,
      status,
      scheduledAt,
      blocksJson,
      faqJson,
      tocJson,
      categoryIds,
      tagIds,
      canonicalUrl,
      ogImage,
      seoNoIndex,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Post title is required' }, { status: 400 });
    }

    const newPost = await createPost({
      title: title.trim(),
      content: content || '',
      excerpt: excerpt || '',
      category: category || 'Guides',
      author: author || 'wm',
      date: date || undefined,
      thumbnail: thumbnail || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      slug: slug || undefined,
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
      blocksJson: blocksJson || '',
      faqJson: faqJson || '',
      tocJson: tocJson || '',
      categoryIds: Array.isArray(categoryIds) ? categoryIds : undefined,
      tagIds: Array.isArray(tagIds) ? tagIds : undefined,
      canonicalUrl: canonicalUrl || '',
      ogImage: ogImage || '',
      seoNoIndex: Boolean(seoNoIndex),
    });

    return NextResponse.json(
      { success: true, message: 'Post created successfully', data: newPost },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating post:', err);
    const message = err instanceof Error ? err.message : 'Server error creating post';
    const status = message.includes('Scheduled') || message.includes('publish') ? 400 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
