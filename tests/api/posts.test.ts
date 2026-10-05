import { describe, expect, it } from 'vitest';
import { GET as listPosts, POST as createPost } from '@/app/api/posts/route';
import { GET as getPost, PUT as updatePost, DELETE as deletePost } from '@/app/api/posts/[identifier]/route';
import { SAMPLE_POST } from '../helpers/constants';
import { jsonRequest, parseJson, routeContext } from '../helpers/request';

type PostResponse = {
  success: boolean;
  message?: string;
  data: {
    id: number;
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    author: string;
    status: string;
    scheduledAt?: string | null;
  };
};

type ListResponse = {
  success: boolean;
  data: PostResponse['data'][];
  total: number;
};

function futureDateIso(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString();
}

describe('Posts API', () => {
  it('lists posts (empty initially)', async () => {
    const response = await listPosts(new Request('http://localhost/api/posts'));
    const body = await parseJson<ListResponse>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });

  it('creates a published post with required fields', async () => {
    const response = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, status: 'published' }),
      })
    );
    const body = await parseJson<PostResponse>(response);

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Post created successfully');
    expect(body.data.title).toBe(SAMPLE_POST.title);
    expect(body.data.slug).toBe(SAMPLE_POST.slug);
    expect(body.data.category).toBe(SAMPLE_POST.category);
    expect(body.data.author).toBe(SAMPLE_POST.author);
    expect(body.data.status).toBe('published');
  });

  it('creates a draft post that is hidden from public listing', async () => {
    const response = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, slug: 'draft-post', status: 'draft' }),
      })
    );
    const body = await parseJson<PostResponse>(response);

    expect(response.status).toBe(201);
    expect(body.data.status).toBe('draft');

    const publicList = await listPosts(new Request('http://localhost/api/posts'));
    const publicBody = await parseJson<ListResponse>(publicList);
    expect(publicBody.total).toBe(0);

    const adminList = await listPosts(new Request('http://localhost/api/posts?admin=true'));
    const adminBody = await parseJson<ListResponse>(adminList);
    expect(adminBody.total).toBe(1);
    expect(adminBody.data[0].status).toBe('draft');
  });

  it('creates a scheduled post and hides it until publish time', async () => {
    const scheduledAt = futureDateIso();
    const response = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          ...SAMPLE_POST,
          slug: 'scheduled-post',
          status: 'scheduled',
          scheduledAt,
        }),
      })
    );
    const body = await parseJson<PostResponse>(response);

    expect(response.status).toBe(201);
    expect(body.data.status).toBe('scheduled');
    expect(body.data.scheduledAt).toBeTruthy();

    const publicList = await listPosts(new Request('http://localhost/api/posts'));
    const publicBody = await parseJson<ListResponse>(publicList);
    expect(publicBody.total).toBe(0);

    const publicGet = await getPost(
      new Request('http://localhost/api/posts/scheduled-post'),
      routeContext({ identifier: 'scheduled-post' })
    );
    expect(publicGet.status).toBe(404);

    const adminGet = await getPost(
      new Request('http://localhost/api/posts/scheduled-post?admin=true'),
      routeContext({ identifier: 'scheduled-post' })
    );
    expect(adminGet.status).toBe(200);
  });

  it('rejects scheduled post without a future publish time', async () => {
    const response = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          ...SAMPLE_POST,
          slug: 'invalid-schedule',
          status: 'scheduled',
        }),
      })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Scheduled posts require');
  });

  it('rejects post creation without title', async () => {
    const response = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content: 'No title here' }),
      })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Post title is required');
  });

  it('gets a post by id and slug', async () => {
    const created = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, status: 'published' }),
      })
    );
    const { data: post } = await parseJson<PostResponse>(created);

    const byId = await getPost(
      new Request(`http://localhost/api/posts/${post.id}?admin=true`),
      routeContext({ identifier: String(post.id) })
    );
    const bySlug = await getPost(
      new Request(`http://localhost/api/posts/${post.slug}?admin=true`),
      routeContext({ identifier: post.slug })
    );

    const idBody = await parseJson<PostResponse>(byId);
    const slugBody = await parseJson<PostResponse>(bySlug);

    expect(byId.status).toBe(200);
    expect(bySlug.status).toBe(200);
    expect(idBody.data.id).toBe(post.id);
    expect(slugBody.data.slug).toBe(post.slug);
  });

  it('returns 404 for missing post', async () => {
    const response = await getPost(
      new Request('http://localhost/api/posts/does-not-exist'),
      routeContext({ identifier: 'does-not-exist' })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Post not found');
  });

  it('stores meta title and meta description', async () => {
    const response = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          ...SAMPLE_POST,
          slug: 'seo-post',
          metaTitle: 'Custom SEO Title',
          metaDescription: 'Custom SEO description for Google search results.',
        }),
      })
    );
    const body = await parseJson<PostResponse & { data: { metaTitle: string; metaDescription: string } }>(response);

    expect(response.status).toBe(201);
    expect(body.data.metaTitle).toBe('Custom SEO Title');
    expect(body.data.metaDescription).toBe('Custom SEO description for Google search results.');
  });

  it('updates a post', async () => {
    const created = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, status: 'published' }),
      })
    );
    const { data: post } = await parseJson<PostResponse>(created);

    const response = await updatePost(
      jsonRequest(`http://localhost/api/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title', category: 'News' }),
      }),
      routeContext({ identifier: String(post.id) })
    );
    const body = await parseJson<PostResponse>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Updated Title');
    expect(body.data.category).toBe('News');
  });

  it('updates a post to scheduled status', async () => {
    const created = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, slug: 'schedule-update', status: 'draft' }),
      })
    );
    const { data: post } = await parseJson<PostResponse>(created);

    const response = await updatePost(
      jsonRequest(`http://localhost/api/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'scheduled', scheduledAt: futureDateIso() }),
      }),
      routeContext({ identifier: String(post.id) })
    );
    const body = await parseJson<PostResponse>(response);

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('scheduled');
    expect(body.data.scheduledAt).toBeTruthy();
  });

  it('returns 404 when updating missing post', async () => {
    const response = await updatePost(
      jsonRequest('http://localhost/api/posts/99999', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Ghost' }),
      }),
      routeContext({ identifier: '99999' })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('deletes a post', async () => {
    const created = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, status: 'published' }),
      })
    );
    const { data: post } = await parseJson<PostResponse>(created);

    const response = await deletePost(
      new Request(`http://localhost/api/posts/${post.id}`, { method: 'DELETE' }),
      routeContext({ identifier: String(post.id) })
    );
    const body = await parseJson<PostResponse>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(post.id);

    const gone = await getPost(
      new Request(`http://localhost/api/posts/${post.id}?admin=true`),
      routeContext({ identifier: String(post.id) })
    );
    expect(gone.status).toBe(404);
  });

  it('returns 404 when deleting missing post', async () => {
    const response = await deletePost(
      new Request('http://localhost/api/posts/99999', { method: 'DELETE' }),
      routeContext({ identifier: '99999' })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('filters posts by category', async () => {
    await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, slug: 'guides-post', category: 'Guides', status: 'published' }),
      })
    );
    await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, title: 'News Post', slug: 'news-post', category: 'News', status: 'published' }),
      })
    );

    const response = await listPosts(new Request('http://localhost/api/posts?category=News'));
    const body = await parseJson<ListResponse>(response);

    expect(response.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.data[0].category).toBe('News');
  });

  it('searches posts by keyword', async () => {
    await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, title: 'UniqueKeyword Post', slug: 'unique-keyword-post', status: 'published' }),
      })
    );
    await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, title: 'Other Post', slug: 'other-post', status: 'published' }),
      })
    );

    const response = await listPosts(new Request('http://localhost/api/posts?search=UniqueKeyword'));
    const body = await parseJson<ListResponse>(response);

    expect(response.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.data[0].title).toContain('UniqueKeyword');
  });

  it('paginates posts', async () => {
    for (let i = 1; i <= 3; i++) {
      await createPost(
        jsonRequest('http://localhost/api/posts', {
          method: 'POST',
          body: JSON.stringify({ ...SAMPLE_POST, title: `Paginated ${i}`, slug: `paginated-${i}`, status: 'published' }),
        })
      );
    }

    const response = await listPosts(new Request('http://localhost/api/posts?limit=2&page=2'));
    const body = await parseJson<ListResponse>(response);

    expect(response.status).toBe(200);
    expect(body.total).toBe(3);
    expect(body.data).toHaveLength(1);
  });
});
