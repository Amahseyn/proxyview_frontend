import { describe, expect, it } from 'vitest';
import { GET as listMessages, POST as submitMessage } from '@/app/api/contact/route';
import { DELETE as deleteMessage } from '@/app/api/contact/[id]/route';
import { SAMPLE_CONTACT } from '../helpers/constants';
import { jsonRequest, parseJson, routeContext } from '../helpers/request';

type ContactResponse = {
  success: boolean;
  message: string;
  data: { id: number };
};

type ContactListResponse = {
  success: boolean;
  data: Array<{
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
  }>;
  total: number;
};

describe('Contact API', () => {
  it('submits a contact message', async () => {
    const response = await submitMessage(
      jsonRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_CONTACT),
      })
    );
    const body = await parseJson<ContactResponse>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Thank you! We will get back to you shortly.');
    expect(body.data.id).toBeGreaterThan(0);
  });

  it('rejects submission without required fields', async () => {
    const response = await submitMessage(
      jsonRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name: 'Jane' }),
      })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Name, email and message are required.');
  });

  it('lists contact messages', async () => {
    const created = await submitMessage(
      jsonRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_CONTACT),
      })
    );
    const { data: createdMessage } = await parseJson<ContactResponse>(created);

    const response = await listMessages();
    const body = await parseJson<ContactListResponse>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.total).toBe(1);
    expect(body.data[0].id).toBe(createdMessage.id);
    expect(body.data[0].email).toBe(SAMPLE_CONTACT.email);
    expect(body.data[0].name).toBe(SAMPLE_CONTACT.name);
  });

  it('deletes a contact message', async () => {
    const created = await submitMessage(
      jsonRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_CONTACT),
      })
    );
    const { data: createdMessage } = await parseJson<ContactResponse>(created);

    const response = await deleteMessage(
      new Request(`http://localhost/api/contact/${createdMessage.id}`, { method: 'DELETE' }),
      routeContext({ id: String(createdMessage.id) })
    );
    const body = await parseJson<{
      success: boolean;
      message: string;
      data: { id: number; email: string };
    }>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdMessage.id);

    const list = await listMessages();
    const listBody = await parseJson<ContactListResponse>(list);
    expect(listBody.total).toBe(0);
  });

  it('returns 404 when deleting missing message', async () => {
    const response = await deleteMessage(
      new Request('http://localhost/api/contact/99999', { method: 'DELETE' }),
      routeContext({ id: '99999' })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Message not found or already deleted');
  });
});
