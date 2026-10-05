import { NextResponse } from 'next/server';
import { createContactMessage, getAllContactMessages } from '@/lib/repositories/contactMessages';

export async function GET() {
  try {
    const messages = await getAllContactMessages();
    return NextResponse.json({ success: true, data: messages, total: messages.length });
  } catch (err) {
    console.error('Error fetching contact messages:', err);
    return NextResponse.json({ success: false, message: 'Server error fetching messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email and message are required.' },
        { status: 400 }
      );
    }

    const saved = await createContactMessage({ name, email, subject, message });

    return NextResponse.json({
      success: true,
      message: 'Thank you! We will get back to you shortly.',
      data: { id: saved.id },
    });
  } catch (err) {
    console.error('Error saving contact message:', err);
    return NextResponse.json({ success: false, message: 'Server error saving message' }, { status: 500 });
  }
}
