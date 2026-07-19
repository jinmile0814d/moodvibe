import { NextRequest, NextResponse } from 'next/server';
import { playlist_track_all, song_url_v1, lyric } from '@neteasecloudmusicapienhanced/api';
import { getCookie } from '@/lib/netease-config';

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
    const tracksRes = await playlist_track_all({ id: Number(id), limit: 30, cookie });
    const songs = tracksRes.body?.songs;
    if (!Array.isArray(songs)) {
      return NextResponse.json({ tracks: [] });
    }

    const result = await Promise.all(
      songs.slice(0, 20).map(async (song: { id: number; name: string; ar: { name: string }[]; al: { picUrl: string } }) => {
        let url: string | null = null;
        let lrc: string | null = null;
        try {
          const urlRes = await song_url_v1({
            id: song.id,
            level: 'standard' as any,
            cookie,
            realIP: '116.25.146.177'
          });
          url = (urlRes.body as any)?.data?.[0]?.url || null;
        } catch {}
        try {
          const lyricRes = await lyric({ id: song.id, cookie });
          lrc = (lyricRes.body as any)?.lrc?.lyric || null;
        } catch {}
        return {
          id: song.id,
          song: song.name,
          artist: song.ar?.map((a) => a.name).join('/') || '未知',
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
