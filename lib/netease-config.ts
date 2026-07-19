// 网易云音乐API配置 - 海外解锁支持
import fs from 'fs';
import path from 'path';

export interface NeteaseConfig {
  cookie: string | null;
  enableUnblock: boolean;
  sources: string[];
}

/**
 * 获取网易云Cookie
 */
export function getCookie(): string | null {
  if (process.env.NETEASE_COOKIE) return process.env.NETEASE_COOKIE;
  try {
    const cookiePath = path.join(process.cwd(), '.netease_cookie');
    if (fs.existsSync(cookiePath)) {
      return fs.readFileSync(cookiePath, 'utf-8').trim();
    }
  } catch {}
  return null;
}

/**
 * 获取API配置（包含解锁设置）
 */
export function getNeteaseConfig(): NeteaseConfig {
  return {
    cookie: getCookie(),
    enableUnblock: true, // 启用音乐解锁
    sources: ['kuwo', 'migu', 'kugou', 'youtube'], // 备用音源
  };
}
