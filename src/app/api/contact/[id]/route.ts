import { NextResponse } from 'next/server';
import { deleteContactMessage } from '@/lib/repositories/contactMessages';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteContactMessage(Number(id));

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Message not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Message deleted successfully', data: deleted });
  } catch (err) {
    console.error('Error deleting contact message:', err);
    return NextResponse.json({ success: false, message: 'Server error deleting message' }, { status: 500 });
  }
}
