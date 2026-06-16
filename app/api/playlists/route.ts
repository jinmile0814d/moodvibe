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

const statusToCat: Record<string, string> = {
  '美滋滋': '清新',
  '元气满满': '运动',
  '满血复活': '运动',
  '恋爱中': '浪漫',
  '感性时刻': '伤感',
  '发呆': '轻音乐',
  '疲惫': '安静',
  '胡思乱想': '夜晚',
  'emo中': '伤感',
  '裂开': '伤感',
  '摸鱼中': '放松',
  '通勤中': '通勤',
  '搬砖中': '工作',
  '开会循环': '轻音乐',
  '出差': '旅行',
  '沉迷学习': '学习',
  '灵感爆发': '电子',
  'deadline战士': '摇滚',
  '干饭': '欢快',
  '喝奶茶': '清新',
  '喝咖啡': '爵士',
  '自拍': '流行',
  '聚会': '说唱',
  '微醺': '爵士',
  'city walk': '民谣',
  '旅途中': '旅行',
  '运动': '运动',
  '宅家': '放松',
  '睡觉': '安静',
  '刷手机': '流行',
  '追剧': '影视原声',
  '玩游戏': '电子',
  '听歌': '流行',
  '看书': '轻音乐',
  '吸猫': '治愈',
  '遛狗': '清新',
};

function mapKeywordToCat(keyword: string): string {
  const labels = keyword.split(/\s+/);
  for (const label of labels) {
    if (statusToCat[label]) return statusToCat[label];
  }
  return '华语';
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword') || '推荐';
  const cookie = getCookie();
  if (!cookie) {
    return NextResponse.json({ playlists: [] });
  }

  const cat = mapKeywordToCat(keyword);

  try {
    const { cloudsearch } = require('@neteasecloudmusicapienhanced/api');

    const langs = ['华语', '欧美', '韩语', '日语', '纯音乐'];
    const allPlaylists: any[] = [];

    for (const lang of langs) {
      if (allPlaylists.length >= 6) break;
      const searchKeyword = lang === '纯音乐' ? `纯音乐 ${cat}` : `${lang} ${cat}`;
      const limit = 1;
      try {
        const res = await cloudsearch({ keywords: searchKeyword, type: 1000, limit, cookie });
        const playlists = res.body?.result?.playlists || [];
        for (const p of playlists) {
          if (allPlaylists.length >= 6) break;
          if (allPlaylists.some(x => x.id === p.id)) continue;
          allPlaylists.push(p);
        }
      } catch {}
    }

    const result = allPlaylists.map((p: { id: number; name: string; coverImgUrl: string; playCount: number; trackCount: number }) => ({
      id: p.id,
      name: p.name,
      cover: p.coverImgUrl,
      playCount: p.playCount,
      trackCount: p.trackCount,
    }));

    return NextResponse.json({ playlists: result });
  } catch {
    return NextResponse.json({ playlists: [] });
  }
}
