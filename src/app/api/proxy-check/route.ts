import { NextResponse } from 'next/server';
import { checkIpWithScamalytics, isValidIp } from '@/lib/scamalytics';

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim();
    if (ip && isValidIp(ip)) return ip;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  const cfIp = request.headers.get('cf-connecting-ip')?.trim();
  if (cfIp && isValidIp(cfIp)) return cfIp;

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const useMyIp = searchParams.get('myip') === '1';
    const ip = useMyIp ? getClientIp(request) : searchParams.get('ip')?.trim();

    if (!ip) {
      return NextResponse.json(
        {
          success: false,
          message: useMyIp
            ? 'Could not detect your IP address.'
            : 'A valid IP address is required.',
        },
        { status: 400 }
      );
    }

    if (!isValidIp(ip)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid IPv4 or IPv6 address.' },
        { status: 400 }
      );
    }

    const result = await checkIpWithScamalytics(ip);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Proxy check error:', err);
    const message = err instanceof Error ? err.message : 'Failed to check IP address.';
    const status = message.includes('not configured') ? 503 : 502;
    return NextResponse.json({ success: false, message }, { status });
  }
}
