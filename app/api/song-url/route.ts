import { NextRequest, NextResponse } from 'next/server';
import { song_url_v1, cloudsearch } from '@neteasecloudmusicapienhanced/api';
import { getCookie } from '@/lib/netease-config';

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get('id');
  const keyword = request.nextUrl.searchParams.get('keyword');

  const cookie = getCookie();
  if (!cookie) {
    return NextResponse.json({ url: null });
  }

  try {

    let id = songId ? Number(songId) : null;

    if (!id && keyword) {
      const searchRes = await cloudsearch({ keywords: keyword, limit: 1, type: 1, cookie });
      const songs = (searchRes.body as any)?.result?.songs || [];
      if (songs?.length) {
        id = songs[0].id;
      }
    }

    if (!id) {
      return NextResponse.json({ url: null });
    }

    const urlRes = await song_url_v1({
      id,
      level: 'standard' as any,
      cookie,
      realIP: '116.25.146.177' // 使用国内IP绕过地域限制
    });
    const url = (urlRes.body as any)?.data?.[0]?.url || null;

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ url: null });
  }
}
