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
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: '缺少歌单 id' }, { status: 400 });
  }

  const cookie = getCookie();
  if (!cookie) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const { playlist_track_all, song_url_v1, lyric } = require('@neteasecloudmusicapienhanced/api');

    const tracksRes = await playlist_track_all({ id: Number(id), limit: 30, cookie });
    const tracks = tracksRes.body?.songs || [];

    const result = await Promise.all(
      tracks.slice(0, 20).map(async (song: { id: number; name: string; ar: { name: string }[]; al: { picUrl: string } }) => {
        let url: string | null = null;
        let lrc: string | null = null;
        try {
          const urlRes = await song_url_v1({ id: song.id, level: 'standard', cookie });
          url = urlRes.body?.data?.[0]?.url || null;
        } catch {}
        try {
          const lyricRes = await lyric({ id: song.id, cookie });
          lrc = lyricRes.body?.lrc?.lyric || null;
        } catch {}
        return {
          id: song.id,
          song: song.name,
          artist: song.ar?.map((a: { name: string }) => a.name).join('/') || '未知',
          cover: song.al?.picUrl || null,
          url,
          lyric: lrc,
        };
      })
    );

    return NextResponse.json({ tracks: result });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}
