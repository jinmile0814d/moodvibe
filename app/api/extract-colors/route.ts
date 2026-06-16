import { NextRequest, NextResponse } from 'next/server';
import { extractColorsFromCover } from '@/lib/color-extract';
import { buildGradientFromPair } from '@/lib/gradient';

export async function GET(request: NextRequest) {
  const coverUrl = request.nextUrl.searchParams.get('url');
  if (!coverUrl) {
    return NextResponse.json({ gradient: null });
  }

  try {
    const colors = await extractColorsFromCover(coverUrl);
    if (colors) {
      const gradient = buildGradientFromPair(colors);
      return NextResponse.json({ gradient, colors });
    }
  } catch {}

  return NextResponse.json({ gradient: null });
}
