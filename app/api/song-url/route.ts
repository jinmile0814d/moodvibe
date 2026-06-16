import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getCookie(): string | null {
  if (process.env.NETEASE_COOKIE) return process.env.NETEASE_COOKIE;
  try {
    const cookiePath = path.join(process.cwd(), '.netease_cookie');
    if (fs.existsSync(cookiePath)) {
      return fs.readFileSync(cookiePath, 'utf-8').trim();
    }
  } catch {}
  return null;
}

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get('id');
  const keyword = request.nextUrl.searchParams.get('keyword');

  const cookie = getCookie();
  if (!cookie) {
    return NextResponse.json({ url: null });
  }

  try {
    const { song_url_v1, cloudsearch } = require('@neteasecloudmusicapienhanced/api');

    let id = songId ? Number(songId) : null;

    if (!id && keyword) {
      const searchRes = await cloudsearch({ keywords: keyword, limit: 1, type: 1, cookie });
      const songs = searchRes.body?.result?.songs;
      if (songs?.length) {
        id = songs[0].id;
      }
    }

    if (!id) {
      return NextResponse.json({ url: null });
    }

    const urlRes = await song_url_v1({ id, level: 'standard', cookie });
    const url = urlRes.body?.data?.[0]?.url || null;

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ url: null });
  }
}
