import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { GET as healthCheck } from '@/app/api/health/route';
import { GET as listPosts, POST as createPost } from '@/app/api/posts/route';
import { GET as getPost, PUT as updatePost, DELETE as deletePost } from '@/app/api/posts/[identifier]/route';
import { GET as listMessages, POST as submitMessage } from '@/app/api/contact/route';
import { DELETE as deleteMessage } from '@/app/api/contact/[id]/route';
import { GET as getGlossaryContent, POST as createGlossaryTerm } from '@/app/api/glossary/route';
import { PUT as updateGlossaryConfig } from '@/app/api/glossary/config/route';
import { DELETE as deleteGlossaryTerm } from '@/app/api/glossary/[id]/route';
import { POST as uploadImage } from '@/app/api/upload/route';
import {
  SAMPLE_CONTACT,
  SAMPLE_GLOSSARY_CONFIG,
  SAMPLE_GLOSSARY_TERM,
  SAMPLE_POST,
} from '../helpers/constants';
import { jsonRequest, parseJson, routeContext } from '../helpers/request';

const FIXTURE_PATH = path.join(__dirname, '../fixtures/test-image.png');

function makeUploadRequest(file: File): Request {
  const formData = new FormData();
  formData.append('image', file);
  return new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
    headers: { host: 'localhost:3000' },
  });
}

describe('ProxyView site functionality', () => {
  it('runs a full end-to-end workflow across all major features', async () => {
    const health = await healthCheck();
    const healthBody = await parseJson<{
      status: string;
      database: string;
      posts: number;
      glossaryTerms: number;
    }>(health);

    expect(health.status).toBe(200);
    expect(healthBody.status).toBe('ok');
    expect(healthBody.database).toBe('connected');
    expect(healthBody.posts).toBe(0);
    expect(healthBody.glossaryTerms).toBe(0);

    const createdPost = await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_POST),
      })
    );
    const postBody = await parseJson<{
      success: boolean;
      data: { id: number; slug: string; title: string };
    }>(createdPost);

    expect(createdPost.status).toBe(201);
    expect(postBody.data.slug).toBe(SAMPLE_POST.slug);

    const listedPosts = await listPosts(new Request('http://localhost/api/posts'));
    const listedPostsBody = await parseJson<{ total: number; data: Array<{ id: number }> }>(listedPosts);
    expect(listedPostsBody.total).toBe(1);

    const fetchedPost = await getPost(
      new Request(`http://localhost/api/posts/${postBody.data.slug}`),
      routeContext({ identifier: postBody.data.slug })
    );
    const fetchedPostBody = await parseJson<{ data: { title: string } }>(fetchedPost);
    expect(fetchedPostBody.data.title).toBe(SAMPLE_POST.title);

    const updatedPost = await updatePost(
      jsonRequest(`http://localhost/api/posts/${postBody.data.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'Site Test Updated Post' }),
      }),
      routeContext({ identifier: String(postBody.data.id) })
    );
    const updatedPostBody = await parseJson<{ data: { title: string } }>(updatedPost);
    expect(updatedPostBody.data.title).toBe('Site Test Updated Post');

    const submittedMessage = await submitMessage(
      jsonRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_CONTACT),
      })
    );
    const messageBody = await parseJson<{ success: boolean; data: { id: number } }>(submittedMessage);
    expect(submittedMessage.status).toBe(200);
    expect(messageBody.success).toBe(true);

    const listedMessages = await listMessages();
    const listedMessagesBody = await parseJson<{ total: number }>(listedMessages);
    expect(listedMessagesBody.total).toBe(1);

    const updatedGlossaryConfig = await updateGlossaryConfig(
      jsonRequest('http://localhost/api/glossary/config', {
        method: 'PUT',
        body: JSON.stringify(SAMPLE_GLOSSARY_CONFIG),
      })
    );
    const glossaryConfigBody = await parseJson<{ data: { heroTitle: string } }>(updatedGlossaryConfig);
    expect(glossaryConfigBody.data.heroTitle).toBe(SAMPLE_GLOSSARY_CONFIG.heroTitle);

    const createdTerm = await createGlossaryTerm(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_GLOSSARY_TERM),
      })
    );
    const termBody = await parseJson<{ data: { id: number; term: string } }>(createdTerm);
    expect(createdTerm.status).toBe(201);

    const glossaryContent = await getGlossaryContent();
    const glossaryContentBody = await parseJson<{
      data: {
        config: { heroTitle: string };
        terms: Array<{ id: number; term: string }>;
      };
    }>(glossaryContent);
    expect(glossaryContentBody.data.config.heroTitle).toBe(SAMPLE_GLOSSARY_CONFIG.heroTitle);
    expect(glossaryContentBody.data.terms).toHaveLength(1);
    expect(glossaryContentBody.data.terms[0].term).toBe(SAMPLE_GLOSSARY_TERM.term);

    const buffer = fs.readFileSync(FIXTURE_PATH);
    const file = new File([buffer], 'site-test-image.png', { type: 'image/png' });
    const uploadResponse = await uploadImage(makeUploadRequest(file));
    const uploadBody = await parseJson<{ success: boolean; filename: string }>(uploadResponse);
    expect(uploadResponse.status).toBe(201);
    expect(uploadBody.success).toBe(true);

    const deletedTerm = await deleteGlossaryTerm(
      new Request(`http://localhost/api/glossary/${termBody.data.id}`, { method: 'DELETE' }),
      routeContext({ id: String(termBody.data.id) })
    );
    expect(deletedTerm.status).toBe(200);

    const deletedMessage = await deleteMessage(
      new Request(`http://localhost/api/contact/${messageBody.data.id}`, { method: 'DELETE' }),
      routeContext({ id: String(messageBody.data.id) })
    );
    expect(deletedMessage.status).toBe(200);

    const deletedPostResponse = await deletePost(
      new Request(`http://localhost/api/posts/${postBody.data.id}`, { method: 'DELETE' }),
      routeContext({ identifier: String(postBody.data.id) })
    );
    expect(deletedPostResponse.status).toBe(200);

    const finalHealth = await healthCheck();
    const finalHealthBody = await parseJson<{ posts: number; glossaryTerms: number }>(finalHealth);
    expect(finalHealthBody.posts).toBe(0);
    expect(finalHealthBody.glossaryTerms).toBe(0);

    const uploadedFilePath = path.join(process.cwd(), 'public/uploads', uploadBody.filename);
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  });

  it('rejects invalid contact submissions and missing blog posts', async () => {
    const invalidContact = await submitMessage(
      jsonRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name: 'Jane Doe' }),
      })
    );
    const invalidContactBody = await parseJson<{ success: boolean; message: string }>(invalidContact);
    expect(invalidContact.status).toBe(400);
    expect(invalidContactBody.message).toBe('Name, email and message are required.');

    const missingPost = await getPost(
      new Request('http://localhost/api/posts/missing-slug'),
      routeContext({ identifier: 'missing-slug' })
    );
    const missingPostBody = await parseJson<{ success: boolean; message: string }>(missingPost);
    expect(missingPost.status).toBe(404);
    expect(missingPostBody.message).toBe('Post not found');
  });

  it('supports blog search, category filtering, and pagination together', async () => {
    await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, title: 'News Alpha', slug: 'news-alpha', category: 'News' }),
      })
    );
    await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, title: 'Guide Beta', slug: 'guide-beta', category: 'Guides' }),
      })
    );
    await createPost(
      jsonRequest('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_POST, title: 'News Gamma', slug: 'news-gamma', category: 'News' }),
      })
    );

    const categoryResponse = await listPosts(new Request('http://localhost/api/posts?category=News'));
    const categoryBody = await parseJson<{ total: number; data: Array<{ category: string }> }>(categoryResponse);
    expect(categoryBody.total).toBe(2);
    expect(categoryBody.data.every(post => post.category === 'News')).toBe(true);

    const searchResponse = await listPosts(new Request('http://localhost/api/posts?search=Gamma'));
    const searchBody = await parseJson<{ total: number; data: Array<{ title: string }> }>(searchResponse);
    expect(searchBody.total).toBe(1);
    expect(searchBody.data[0].title).toBe('News Gamma');

    const pageResponse = await listPosts(new Request('http://localhost/api/posts?limit=1&page=2'));
    const pageBody = await parseJson<{ total: number; data: unknown[] }>(pageResponse);
    expect(pageBody.total).toBe(3);
    expect(pageBody.data).toHaveLength(1);
  });
});
