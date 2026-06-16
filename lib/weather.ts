import { Weather } from './gradient';

export interface WeatherData {
  weather: Weather;
  temp: number;
  description: string;
  city: string;
  aqi?: string;
  aqiValue?: number;
  humidity?: number;
  windScale?: string;
  windDir?: string;
  feelsLike?: number;
}

const API_KEY = process.env.QWEATHER_API_KEY!;
const API_HOST = process.env.QWEATHER_API_HOST!;

const headers = { 'X-QW-Api-Key': API_KEY };

function mapWeatherText(text: string): Weather {
  if (['晴'].includes(text)) return 'sunny';
  if (['雪', '小雪', '中雪', '大雪', '暴雪', '雨夹雪'].some(k => text.includes(k))) return 'snowy';
  if (['雨', '阵雨', '雷阵雨', '小雨', '中雨', '大雨', '暴雨'].some(k => text.includes(k))) return 'rainy';
  return 'cloudy';
}

async function getLocationId(city: string): Promise<string> {
  const url = `${API_HOST}/geo/v2/city/lookup?location=${encodeURIComponent(city)}`;
  const res = await fetch(url, { headers });
  const data = await res.json();

  if (data.code !== '200' || !data.location?.length) {
    throw new Error(`城市查询失败: ${city}`);
  }

  return data.location[0].id;
}

async function getAqi(locationId: string): Promise<{ aqi?: string; aqiValue?: number }> {
  try {
    const url = `${API_HOST}/v7/air/now?location=${locationId}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (data.code === '200' && data.now) {
      return {
        aqi: data.now.category,
        aqiValue: parseInt(data.now.aqi, 10),
      };
    }
  } catch {}
  return {};
}

export async function getWeather(city: string): Promise<WeatherData> {
  const locationId = await getLocationId(city);

  const [weatherRes, aqiData] = await Promise.all([
    fetch(`${API_HOST}/v7/weather/now?location=${locationId}`, { headers }),
    getAqi(locationId),
  ]);

  const data = await weatherRes.json();

  if (data.code !== '200') {
    throw new Error(`天气查询失败: code ${data.code}`);
  }

  const now = data.now;

  return {
    weather: mapWeatherText(now.text),
    temp: parseInt(now.temp, 10),
    description: now.text,
    city,
    humidity: now.humidity ? parseInt(now.humidity, 10) : undefined,
    windScale: now.windScale || undefined,
    windDir: now.windDir || undefined,
    feelsLike: now.feelsLike ? parseInt(now.feelsLike, 10) : undefined,
    ...aqiData,
  };
}
