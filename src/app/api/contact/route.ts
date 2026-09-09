import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, subject, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, message: 'Name, email and message are required.' },
      { status: 400 }
    );
  }

  console.log(`Contact form submission from ${name} <${email}>: ${subject}`);

  return NextResponse.json({ success: true, message: 'Thank you! We will get back to you shortly.' });
}
