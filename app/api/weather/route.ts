import { NextRequest, NextResponse } from 'next/server';
import { getWeather } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city');
  if (!city) {
    return NextResponse.json({ error: '缺少 city 参数' }, { status: 400 });
  }

  try {
    const data = await getWeather(city);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : '天气查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
