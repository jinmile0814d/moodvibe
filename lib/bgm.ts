import { Mood } from './gradient';
import { extractColorsFromCover } from './color-extract';
import fs from 'fs';
import path from 'path';

interface MusicPreference {
  genres: string[];
  language: string;
  emotionMode: 'match' | 'contrast';
}

export interface BGMItem {
  song: string;
  artist: string;
  url: string | null;
  cover: string | null;
  lyric: string | null;
  playlistId: number | null;
  coverColors: [string, string] | null;
  songId?: number;
}

const statusKeywords: Record<string, string> = {
  happy: '甜蜜 轻快',
  energetic: '活力 青春',
  recharged: '热血 振奋',
  inlove: '心动 情歌',
  sentimental: '深情 抒情',
  spacing: '空灵 放空',
  tired: '轻柔 解压',
  overthink: '迷幻 氛围',
  emo: '孤独 深夜',
  broken: '宣泄 摇滚',
  slacking: '悠闲 lofi',
  commute: '律动 都市',
  grinding: '励志 打气',
  meetings: '白噪音 冥想',
  travel: '旅途 钢琴',
  studying: '专注 纯音乐',
  inspired: '灵感 电子',
  deadline: '燃 高能',
  eating: '欢快 热闹',
  milktea: '甜系 清新',
  coffee: '爵士 午后',
  selfie: '潮流 活力',
  party: '派对 嗨歌',
  tipsy: '爵士 慵懒',
  citywalk: '独立 漫步',
  onroad: '民谣 远方',
  workout: '燃 节奏',
  athome: '慵懒 舒适',
  sleeping: '助眠 轻柔',
  scrolling: '热歌 流行',
  binge: '影视 原声',
  gaming: '电子 游戏',
  music: '随心 热门',
  reading: '钢琴 安静',
  cat: '治愈 温暖',
  dog: '轻松 散步',
};

const moodKeywords: Record<Mood, string[]> = {
  energetic: ['活力 青春', '热血 振奋'],
  overtime: ['励志 打气', '燃 高能'],
  lazy: ['慵懒 舒适', '轻柔 解压'],
  inlove: ['心动 情歌', '甜蜜 轻快'],
  chill: ['治愈 温暖', '轻松 散步'],
  sad: ['孤独 深夜', '深情 抒情'],
};

const fallbackPool: Record<Mood, BGMItem[]> = {
  energetic: [
    { song: '倔强', artist: '五月天', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
    { song: '最美的太阳', artist: '张杰', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
  ],
  overtime: [
    { song: '孤勇者', artist: '陈奕迅', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
    { song: '平凡之路', artist: '朴树', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
  ],
  lazy: [
    { song: '慢慢喜欢你', artist: '莫文蔚', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
    { song: '小幸运', artist: '田馥甄', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
  ],
  inlove: [
    { song: '告白气球', artist: '周杰伦', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
    { song: '喜欢你', artist: '邓紫棋', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
  ],
  chill: [
    { song: '晴天', artist: '周杰伦', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
    { song: '稻香', artist: '周杰伦', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
  ],
  sad: [
    { song: '后来', artist: '刘若英', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
    { song: '说散就散', artist: '袁娅维', url: null, cover: null, lyric: null, playlistId: null, coverColors: null },
  ],
};

function getCookie(): string | null {
  if (process.env.NETEASE_COOKIE) return process.env.NETEASE_COOKIE;
  try {
    const cookiePath = path.join(process.cwd(), '.netease_cookie');
    if (fs.existsSync(cookiePath)) {
      return fs.readFileSync(cookiePath, 'utf-8').trim();
    }
  } catch {
    // cookie file not found
  }
  return null;
}

const genreKeywords: Record<string, string> = {
  pop: '流行',
  folk: '民谣',
  rock: '摇滚',
  electronic: '电子',
  hiphop: '说唱',
  rnb: 'R&B',
  jazz: '爵士',
  classical: '纯音乐',
  acg: '动漫',
  chinese: '国风',
};

const languageKeywords: Record<string, string> = {
  zh: '华语',
  en: '欧美',
  jp: '日语',
  kr: '韩语',
  any: '',
};

const contrastMoodMap: Record<Mood, Mood> = {
  energetic: 'chill',
  overtime: 'energetic',
  lazy: 'energetic',
  inlove: 'chill',
  chill: 'energetic',
  sad: 'energetic',
};

export async function getBGM(mood: Mood, musicPref?: MusicPreference, statusIds?: string[], luckyMusicGenre?: string): Promise<BGMItem> {
  const effectiveMood = musicPref?.emotionMode === 'contrast' ? contrastMoodMap[mood] : mood;

  const cookie = getCookie();
  if (!cookie) {
    const list = fallbackPool[effectiveMood];
    return list[Math.floor(Math.random() * list.length)];
  }

  try {
    const { top_playlist, playlist_track_all, song_url_v1, song_detail, lyric } = require('@neteasecloudmusicapienhanced/api');

    let keyword: string;
    if (statusIds?.length) {
      const validIds = statusIds.filter(id => statusKeywords[id]);
      if (validIds.length > 0) {
        const picked = validIds[Math.floor(Math.random() * validIds.length)];
        keyword = statusKeywords[picked];
      } else {
        const keywords = moodKeywords[effectiveMood];
        keyword = keywords[Math.floor(Math.random() * keywords.length)];
      }
    } else {
      const keywords = moodKeywords[effectiveMood];
      keyword = keywords[Math.floor(Math.random() * keywords.length)];
    }

    if (musicPref?.genres?.length) {
      const genre = musicPref.genres[Math.floor(Math.random() * musicPref.genres.length)];
      keyword += ' ' + (genreKeywords[genre] || '');
    } else if (luckyMusicGenre) {
      keyword += ' ' + luckyMusicGenre;
    }
    let langTag = '';
    if (musicPref?.language && musicPref.language !== 'any') {
      langTag = languageKeywords[musicPref.language] || '';
    } else {
      // 默认优先中文 80%
      const rand = Math.random();
      if (rand < 0.80) langTag = '华语';
      else if (rand < 0.90) langTag = '欧美';
      else if (rand < 0.96) langTag = '韩语';
      else langTag = '日语';
    }
    // 用语言标签作为 cat 分类，风格关键词作为歌单名过滤
    const cat = langTag || '华语';
    const playlistRes = await top_playlist({ cat, limit: 20, order: 'hot', cookie });
    let playlists = playlistRes.body?.playlists || [];

    // 用关键词过滤歌单名，找匹配的
    const filtered = playlists.filter((p: { name: string }) =>
      keyword.split(/\s+/).some(w => p.name.includes(w))
    );
    if (filtered.length > 0) playlists = filtered;
    if (!playlists?.length) throw new Error('no playlists');

    const playlist = playlists[Math.floor(Math.random() * playlists.length)];
    const tracksRes = await playlist_track_all({ id: playlist.id, limit: 50, cookie });
    const tracks = tracksRes.body?.songs;
    if (!tracks?.length) throw new Error('no tracks');

    const song = tracks[Math.floor(Math.random() * tracks.length)];
    const songId = song.id;

    const urlRes = await song_url_v1({ id: songId, level: 'standard', cookie });
    const urlData = urlRes.body?.data?.[0];
    const playUrl = urlData?.url || null;

    const cover: string | null = song.al?.picUrl || null;

    const [lrcText, coverColors] = await Promise.all([
      (async () => {
        try {
          const lyricRes = await lyric({ id: songId, cookie });
          return (lyricRes.body?.lrc?.lyric || null) as string | null;
        } catch { return null; }
      })(),
      cover ? extractColorsFromCover(cover) : Promise.resolve(null),
    ]);

    return {
      song: song.name,
      artist: song.ar?.map((a: { name: string }) => a.name).join('/') || '未知',
      url: playUrl,
      cover,
      lyric: lrcText,
      playlistId: playlist.id,
      coverColors,
      songId,
    };
  } catch {
    const list = fallbackPool[effectiveMood];
    return list[Math.floor(Math.random() * list.length)];
  }
}

export async function getBGMFromPlaylist(playlistId: number, excludeSong?: string): Promise<BGMItem | null> {
  const cookie = getCookie();
  if (!cookie) return null;

  try {
    const { playlist_track_all, song_url_v1, lyric } = require('@neteasecloudmusicapienhanced/api');

    const tracksRes = await playlist_track_all({ id: playlistId, limit: 50, cookie });
    const tracks = tracksRes.body?.songs;
    if (!tracks?.length) return null;

    const candidates = excludeSong ? tracks.filter((t: { name: string }) => t.name !== excludeSong) : tracks;
    if (!candidates.length) return null;

    const song = candidates[Math.floor(Math.random() * candidates.length)];
    const songId = song.id;

    const urlRes = await song_url_v1({ id: songId, level: 'standard', cookie });
    const urlData = urlRes.body?.data?.[0];
    const playUrl = urlData?.url || null;

    const cover: string | null = song.al?.picUrl || null;

    const [lrcText, coverColors] = await Promise.all([
      (async () => {
        try {
          const lyricRes = await lyric({ id: songId, cookie });
          return (lyricRes.body?.lrc?.lyric || null) as string | null;
        } catch { return null; }
      })(),
      cover ? extractColorsFromCover(cover) : Promise.resolve(null),
    ]);

    return {
      song: song.name,
      artist: song.ar?.map((a: { name: string }) => a.name).join('/') || '未知',
      url: playUrl,
      cover,
      lyric: lrcText,
      playlistId,
      coverColors,
      songId,
    };
  } catch {
    return null;
  }
}
