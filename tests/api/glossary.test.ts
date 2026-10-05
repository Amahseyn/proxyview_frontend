import { describe, expect, it } from 'vitest';
import { GET as getGlossaryContent, POST as createGlossaryTermRoute } from '@/app/api/glossary/route';
import { GET as getGlossaryConfig, PUT as updateGlossaryConfig } from '@/app/api/glossary/config/route';
import {
  DELETE as deleteGlossaryTerm,
  GET as getGlossaryTerm,
  PUT as updateGlossaryTermRoute,
} from '@/app/api/glossary/[id]/route';
import { SAMPLE_GLOSSARY_CONFIG, SAMPLE_GLOSSARY_TERM } from '../helpers/constants';
import { jsonRequest, parseJson, routeContext } from '../helpers/request';

type GlossaryTermResponse = {
  success: boolean;
  message?: string;
  data: {
    id: number;
    term: string;
    definition: string;
    sortOrder: number;
  };
};

type GlossaryContentResponse = {
  success: boolean;
  data: {
    config: {
      heroTitle: string;
      heroSubtitle: string;
    };
    terms: GlossaryTermResponse['data'][];
  };
};

describe('Glossary API', () => {
  it('returns default page content with empty terms', async () => {
    const response = await getGlossaryContent();
    const body = await parseJson<GlossaryContentResponse>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.config.heroTitle).toBe('Proxy Glossary');
    expect(body.data.terms).toEqual([]);
  });

  it('creates a glossary term with required fields', async () => {
    const response = await createGlossaryTermRoute(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_GLOSSARY_TERM),
      })
    );
    const body = await parseJson<GlossaryTermResponse>(response);

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Glossary term created successfully');
    expect(body.data.term).toBe(SAMPLE_GLOSSARY_TERM.term);
    expect(body.data.definition).toBe(SAMPLE_GLOSSARY_TERM.definition);
  });

  it('rejects glossary term creation without term', async () => {
    const response = await createGlossaryTermRoute(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify({ definition: 'Missing term' }),
      })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Glossary term is required');
  });

  it('rejects glossary term creation without definition', async () => {
    const response = await createGlossaryTermRoute(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify({ term: 'Only Term' }),
      })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Glossary definition is required');
  });

  it('gets a glossary term by id', async () => {
    const created = await createGlossaryTermRoute(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_GLOSSARY_TERM),
      })
    );
    const { data: term } = await parseJson<GlossaryTermResponse>(created);

    const response = await getGlossaryTerm(
      new Request(`http://localhost/api/glossary/${term.id}`),
      routeContext({ id: String(term.id) })
    );
    const body = await parseJson<GlossaryTermResponse>(response);

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(term.id);
    expect(body.data.term).toBe(SAMPLE_GLOSSARY_TERM.term);
  });

  it('returns 404 for missing glossary term', async () => {
    const response = await getGlossaryTerm(
      new Request('http://localhost/api/glossary/99999'),
      routeContext({ id: '99999' })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Glossary term not found');
  });

  it('updates a glossary term', async () => {
    const created = await createGlossaryTermRoute(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_GLOSSARY_TERM),
      })
    );
    const { data: term } = await parseJson<GlossaryTermResponse>(created);

    const response = await updateGlossaryTermRoute(
      jsonRequest(`http://localhost/api/glossary/${term.id}`, {
        method: 'PUT',
        body: JSON.stringify({ term: 'Updated Term', sortOrder: 5 }),
      }),
      routeContext({ id: String(term.id) })
    );
    const body = await parseJson<GlossaryTermResponse>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.term).toBe('Updated Term');
    expect(body.data.sortOrder).toBe(5);
  });

  it('deletes a glossary term', async () => {
    const created = await createGlossaryTermRoute(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify(SAMPLE_GLOSSARY_TERM),
      })
    );
    const { data: term } = await parseJson<GlossaryTermResponse>(created);

    const response = await deleteGlossaryTerm(
      new Request(`http://localhost/api/glossary/${term.id}`, { method: 'DELETE' }),
      routeContext({ id: String(term.id) })
    );
    const body = await parseJson<GlossaryTermResponse>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(term.id);

    const gone = await getGlossaryTerm(
      new Request(`http://localhost/api/glossary/${term.id}`),
      routeContext({ id: String(term.id) })
    );
    expect(gone.status).toBe(404);
  });

  it('lists glossary terms in sort order', async () => {
    await createGlossaryTermRoute(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_GLOSSARY_TERM, term: 'Second Term', sortOrder: 2 }),
      })
    );
    await createGlossaryTermRoute(
      jsonRequest('http://localhost/api/glossary', {
        method: 'POST',
        body: JSON.stringify({ ...SAMPLE_GLOSSARY_TERM, term: 'First Term', sortOrder: 1 }),
      })
    );

    const response = await getGlossaryContent();
    const body = await parseJson<GlossaryContentResponse>(response);

    expect(response.status).toBe(200);
    expect(body.data.terms).toHaveLength(2);
    expect(body.data.terms[0].term).toBe('First Term');
    expect(body.data.terms[1].term).toBe('Second Term');
  });

  it('updates glossary page header config', async () => {
    const response = await updateGlossaryConfig(
      jsonRequest('http://localhost/api/glossary/config', {
        method: 'PUT',
        body: JSON.stringify(SAMPLE_GLOSSARY_CONFIG),
      })
    );
    const body = await parseJson<{
      success: boolean;
      data: { heroTitle: string; heroSubtitle: string };
    }>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.heroTitle).toBe(SAMPLE_GLOSSARY_CONFIG.heroTitle);
    expect(body.data.heroSubtitle).toBe(SAMPLE_GLOSSARY_CONFIG.heroSubtitle);

    const getResponse = await getGlossaryConfig();
    const getBody = await parseJson<{ success: boolean; data: { heroTitle: string } }>(getResponse);
    expect(getBody.data.heroTitle).toBe(SAMPLE_GLOSSARY_CONFIG.heroTitle);
  });

  it('rejects glossary page config update without hero title', async () => {
    const response = await updateGlossaryConfig(
      jsonRequest('http://localhost/api/glossary/config', {
        method: 'PUT',
        body: JSON.stringify({ heroSubtitle: 'Only subtitle' }),
      })
    );
    const body = await parseJson<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Hero title is required');
  });
});
