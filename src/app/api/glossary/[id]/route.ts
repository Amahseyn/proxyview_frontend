import { NextResponse } from 'next/server';
import { deleteGlossaryTerm, findGlossaryTerm, updateGlossaryTerm } from '@/lib/glossaryStore';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const term = await findGlossaryTerm(id);

  if (!term) {
    return NextResponse.json({ success: false, message: 'Glossary term not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: term });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { term, definition, sortOrder } = body;

    if (term !== undefined && !term.trim()) {
      return NextResponse.json({ success: false, message: 'Glossary term cannot be empty' }, { status: 400 });
    }

    if (definition !== undefined && !definition.trim()) {
      return NextResponse.json({ success: false, message: 'Glossary definition cannot be empty' }, { status: 400 });
    }

    const updated = await updateGlossaryTerm(id, {
      term: term?.trim(),
      definition: definition?.trim(),
      sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Glossary term not found or cannot be updated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Glossary term updated successfully', data: updated });
  } catch (err) {
    console.error('Error updating glossary term:', err);
    return NextResponse.json({ success: false, message: 'Server error updating glossary term' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteGlossaryTerm(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Glossary term not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Glossary term deleted successfully', data: deleted });
  } catch (err) {
    console.error('Error deleting glossary term:', err);
    return NextResponse.json({ success: false, message: 'Server error deleting glossary term' }, { status: 500 });
  }
}
