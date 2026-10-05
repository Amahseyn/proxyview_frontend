import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const postCount = await prisma.post.count();
    const glossaryTermCount = await prisma.glossaryTerm.count();

    return NextResponse.json({
      status: 'ok',
      message: 'ProxyView API running',
      database: 'connected',
      posts: postCount,
      glossaryTerms: glossaryTermCount,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        database: 'disconnected',
      },
      { status: 503 }
    );
  }
}
