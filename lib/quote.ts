import { Weather, Mood } from './gradient';

const quotePool: Record<Weather, Record<Mood, string[]>> = {
  sunny: {
    energetic: [
      '今天的阳光，是你笑起来的样子',
      '把好心情装进口袋，出发吧',
      '阳光正好，微风不燥',
    ],
    overtime: [
      '连太阳都在加班照耀你',
      '熬过去，前方就是光',
      '今天的努力，是明天的底气',
    ],
    lazy: [
      '晒着太阳发呆，也是正经事',
      '今天的任务是什么都不做',
      '偷一个下午，还给自己',
    ],
    inlove: [
      '阳光落在你身上，刚刚好',
      '今天的风，都是情书',
      '和你在一起，哪里都是晴天',
    ],
    chill: [
      '日子慢一点，刚刚好',
      '把阳光泡进茶里，慢慢喝',
      '今天适合浪费在美好的事物上',
    ],
    sad: [
      '太阳还在，说明一切还来得及',
      '今天的风，替你翻过了昨天那一页',
      '阳光会晒干所有不开心',
    ],
  },
  cloudy: {
    energetic: [
      '云层之上，永远是晴天',
      '灰色的天空挡不住彩色的心',
      '就算阴天，也要做自己的光',
    ],
    overtime: [
      '天色暗了，但你的努力在发光',
      '云层遮住太阳，遮不住你的韧劲',
      '加班的夜，有咖啡陪你',
    ],
    lazy: [
      '阴天适合窝在沙发里',
      '天空替你拉上了窗帘',
      '今天就躺着，不接受反驳',
    ],
    inlove: [
      '阴天也因为你变得温柔',
      '想和你一起看灰色变成彩色',
      '你就是我阴天里的那束光',
    ],
    chill: [
      '灰蒙蒙的天，适合放空',
      '不急不慢，像今天的云',
      '偶尔躲进云里，也很舒服',
    ],
    sad: [
      '天空也在替你难过呢',
      '灰色只是暂时的底色',
      '云会散的，你也会好的',
    ],
  },
  rainy: {
    energetic: [
      '雨天也挡不住想出发的心',
      '踩水坑也是一种浪漫',
      '下雨了，正好洗掉昨天的疲惫',
    ],
    overtime: [
      '雨声是最好的白噪音',
      '窗外的雨替你说了声辛苦',
      '淋过雨的人，更懂撑伞',
    ],
    lazy: [
      '下雨天和睡觉更配哦',
      '雨天赖床，天经地义',
      '听雨发呆，不算浪费时间',
    ],
    inlove: [
      '想在雨里和你共撑一把伞',
      '每一滴雨都在说想你',
      '下雨了，想你的频率也变高了',
    ],
    chill: [
      '听雨，喝茶，发呆，完美',
      '雨天的节奏，刚好适合慢下来',
      '窗外滴答，心里平静',
    ],
    sad: [
      '就让雨替你哭一场吧',
      '雨停之后，会有彩虹的',
      '淋湿的今天，会被明天晒干',
    ],
  },
  snowy: {
    energetic: [
      '下雪了！出去撒欢吧',
      '踩雪的声音是冬天的BGM',
      '世界变白了，像重新开始',
    ],
    overtime: [
      '外面下雪了，你还在发光',
      '雪夜加班，请奖励自己一杯热可可',
      '最冷的天，最热的努力',
    ],
    lazy: [
      '下雪天就该裹着被子看窗外',
      '雪花在飘，你在躺，刚刚好',
      '今天的正经事是堆雪人',
    ],
    inlove: [
      '初雪的心愿是和你在一起',
      '想牵着你的手走在雪地里',
      '下雪了，想你了',
    ],
    chill: [
      '雪落无声，岁月静好',
      '白茫茫的世界，心也干净了',
      '慢慢走，欣赏这场雪',
    ],
    sad: [
      '雪会覆盖一切不好的记忆',
      '冬天来了，春天就不远了',
      '让雪把昨天的痕迹都盖住吧',
    ],
  },
};

const weatherNames: Record<Weather, string> = {
  sunny: '晴天',
  cloudy: '阴天',
  rainy: '雨天',
  snowy: '雪天',
};

const moodNames: Record<Mood, string> = {
  energetic: '元气满满',
  overtime: '加班中',
  lazy: '想躺平',
  inlove: '恋爱中',
  chill: '岁月静好',
  sad: '有点丧',
};

async function callLLM(weather: Weather, mood: Mood, statusLabels?: string[]): Promise<string | null> {
  const zhipuKey = process.env.ZHIPU_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  const providers = [
    { key: zhipuKey, url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash' },
    { key: deepseekKey, url: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
  ];

  const statusDesc = statusLabels?.length
    ? statusLabels.join('、')
    : moodNames[mood];

  const prompt = {
    system: '你是一个文艺短句生成器。只输出一句话，不超过20个字，不要引号，不要标点符号以外的任何解释。风格：治愈、诗意、温柔。',
    user: `现在天气是${weatherNames[weather]}，我的状态是「${statusDesc}」，请生成一句契合此刻氛围的文艺短句。`,
  };

  for (const { key, url, model } of providers) {
    if (!key) continue;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
          max_tokens: 60,
          temperature: 0.9,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch {
      continue;
    }
  }

  return null;
}

export async function getQuote(weather: Weather, mood: Mood, statusLabels?: string[]): Promise<string> {
  const content = await callLLM(weather, mood, statusLabels);
  if (content) return content;

  const quotes = quotePool[weather][mood];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
