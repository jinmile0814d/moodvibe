// Vercel环境检查脚本
import { NextResponse } from 'next/server';

interface Diagnostics {
  env: {
    hasNeteasePhone: boolean;
    hasNeteasePassword: boolean;
    hasNeteaseCookie: boolean;
    phoneValue: string;
  };
  cookieFileExists: boolean;
  cookieFileError?: string;
  timestamp: string;
}

export async function GET() {
  const diagnostics: Diagnostics = {
    env: {
      hasNeteasePhone: !!process.env.NETEASE_PHONE,
      hasNeteasePassword: !!process.env.NETEASE_PASSWORD,
      hasNeteaseCookie: !!process.env.NETEASE_COOKIE,
      phoneValue: process.env.NETEASE_PHONE ? `${process.env.NETEASE_PHONE.substring(0, 3)}****` : 'not set',
    },
    cookieFileExists: false,
    timestamp: new Date().toISOString(),
  };

  // 检查cookie文件
  try {
    const fs = await import('fs');
    const path = await import('path');
    const cookiePath = path.join(process.cwd(), '.netease_cookie');
    diagnostics.cookieFileExists = fs.existsSync(cookiePath);
  } catch (e) {
    diagnostics.cookieFileError = (e as Error).message;
  }

  // 测试API调用
  try {
    const { song_url_v1 } = await import('@neteasecloudmusicapienhanced/api');
    const { getCookie } = await import('@/lib/netease-config');

    const cookie = getCookie();
    if (!cookie) {
      return NextResponse.json({
        ...diagnostics,
        error: 'No cookie available',
        suggestion: 'Check NETEASE_COOKIE in Vercel environment variables',
      });
    }

    const result = await song_url_v1({
      id: 28391863,
      level: 'standard' as any,
      cookie,
      realIP: '116.25.146.177',
    });

    return NextResponse.json({
      ...diagnostics,
      apiTest: {
        success: true,
        hasUrl: !!(result.body as any)?.data?.[0]?.url,
        url: (result.body as any)?.data?.[0]?.url || null,
      },
    });
  } catch (e) {
    return NextResponse.json({
      ...diagnostics,
      apiTest: {
        success: false,
        error: (e as Error).message,
      },
    });
  }
}
