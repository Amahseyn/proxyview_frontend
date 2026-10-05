import { NextResponse } from 'next/server';
import { createGlossaryTerm, getGlossaryPageContent } from '@/lib/glossaryStore';

export async function GET() {
  const content = await getGlossaryPageContent();
  return NextResponse.json({ success: true, data: content });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { term, definition, sortOrder } = body;

    if (!term || !term.trim()) {
      return NextResponse.json({ success: false, message: 'Glossary term is required' }, { status: 400 });
    }

    if (!definition || !definition.trim()) {
      return NextResponse.json({ success: false, message: 'Glossary definition is required' }, { status: 400 });
    }

    const newTerm = await createGlossaryTerm({
      term: term.trim(),
      definition: definition.trim(),
      sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
    });

    return NextResponse.json(
      { success: true, message: 'Glossary term created successfully', data: newTerm },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating glossary term:', err);
    return NextResponse.json({ success: false, message: 'Server error creating glossary term' }, { status: 500 });
  }
}
