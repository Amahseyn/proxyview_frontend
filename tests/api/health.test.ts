import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/health/route';
import { parseJson } from '../helpers/request';

describe('GET /api/health', () => {
  it('returns ok status with database connected', async () => {
    const response = await GET();
    const body = await parseJson<{
      status: string;
      message: string;
      database: string;
      posts: number;
      glossaryTerms: number;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.message).toBe('ProxyView API running');
    expect(body.database).toBe('connected');
    expect(typeof body.posts).toBe('number');
    expect(typeof body.glossaryTerms).toBe('number');
    expect(body.posts).toBeGreaterThanOrEqual(0);
    expect(body.glossaryTerms).toBeGreaterThanOrEqual(0);
  });
});
