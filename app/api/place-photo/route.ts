import { NextRequest, NextResponse } from 'next/server';

const BAIDU_SERVER_AK = 'XUjRpnyjfFb0lpSU6lVkiNtW8lTMZfRG';

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword') || '';
  const location = request.nextUrl.searchParams.get('location') || '';
  const city = request.nextUrl.searchParams.get('city') || '北京';

  if (!keyword) {
    return NextResponse.json({ photo: null });
  }

  try {
    let loc: { lng: number; lat: number } | null = null;

    // 用区域搜索获取地点坐标
    const searchUrl = `https://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(keyword)}&region=${encodeURIComponent(city)}&output=json&scope=2&page_size=1&ak=${BAIDU_SERVER_AK}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status === 0 && searchData.results?.length) {
      loc = searchData.results[0].location;
    } else if (location) {
      // fallback: 坐标搜索
      const locUrl = `https://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(keyword)}&location=${location}&radius=2000&output=json&scope=2&page_size=1&ak=${BAIDU_SERVER_AK}`;
      const locRes = await fetch(locUrl);
      const locData = await locRes.json();
      if (locData.status === 0 && locData.results?.length) {
        loc = locData.results[0].location;
      }
    }

    if (!loc) {
      return NextResponse.json({ photo: null });
    }

    const photo = `https://api.map.baidu.com/staticimage/v2?ak=${BAIDU_SERVER_AK}&center=${loc.lng},${loc.lat}&width=480&height=320&zoom=17&markers=${loc.lng},${loc.lat}`;
    return NextResponse.json({ photo });
  } catch {
    return NextResponse.json({ photo: null });
  }
}
