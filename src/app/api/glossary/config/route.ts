import { NextResponse } from 'next/server';
import { updateGlossaryPageConfig } from '@/lib/glossaryStore';

export async function GET() {
  const { getGlossaryPageConfig } = await import('@/lib/glossaryStore');
  const config = await getGlossaryPageConfig();
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { heroTitle, heroSubtitle } = body;

    if (!heroTitle || !heroTitle.trim()) {
      return NextResponse.json({ success: false, message: 'Hero title is required' }, { status: 400 });
    }

    if (!heroSubtitle || !heroSubtitle.trim()) {
      return NextResponse.json({ success: false, message: 'Hero subtitle is required' }, { status: 400 });
    }

    const config = await updateGlossaryPageConfig({
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
    });

    return NextResponse.json({ success: true, message: 'Glossary page updated successfully', data: config });
  } catch (err) {
    console.error('Error updating glossary page config:', err);
    return NextResponse.json({ success: false, message: 'Server error updating glossary page' }, { status: 500 });
  }
}
