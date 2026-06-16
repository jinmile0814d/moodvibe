import type { ZodiacSign, ZodiacInfo, FortuneData, FortuneDimensions, LuckyElements } from './types';

export const zodiacList: ZodiacInfo[] = [
  { id: 'aries', label: '白羊座', emoji: '♈', dateRange: '3.21-4.19' },
  { id: 'taurus', label: '金牛座', emoji: '♉', dateRange: '4.20-5.20' },
  { id: 'gemini', label: '双子座', emoji: '♊', dateRange: '5.21-6.21' },
  { id: 'cancer', label: '巨蟹座', emoji: '♋', dateRange: '6.22-7.22' },
  { id: 'leo', label: '狮子座', emoji: '♌', dateRange: '7.23-8.22' },
  { id: 'virgo', label: '处女座', emoji: '♍', dateRange: '8.23-9.22' },
  { id: 'libra', label: '天秤座', emoji: '♎', dateRange: '9.23-10.23' },
  { id: 'scorpio', label: '天蝎座', emoji: '♏', dateRange: '10.24-11.22' },
  { id: 'sagittarius', label: '射手座', emoji: '♐', dateRange: '11.23-12.21' },
  { id: 'capricorn', label: '摩羯座', emoji: '♑', dateRange: '12.22-1.19' },
  { id: 'aquarius', label: '水瓶座', emoji: '♒', dateRange: '1.20-2.18' },
  { id: 'pisces', label: '双鱼座', emoji: '♓', dateRange: '2.19-3.20' },
];

const summaryPool = [
  '今天适合大胆尝试新事物',
  '保持平常心，一切都在好转',
  '灵感满满的一天，抓住每个火花',
  '适合安静独处，整理内心',
  '社交能量爆棚，多和朋友互动',
  '今天的你自带光芒，勇敢表达吧',
  '放慢脚步，享受当下的美好',
  '直觉很准，相信自己的判断',
  '今天适合处理拖延已久的事',
  '好运正在路上，耐心等待',
  '充满活力的一天，适合运动',
  '今天的沟通运很好，有话就说',
  '宜放松，不宜钻牛角尖',
  '财运小有收获，注意理财',
  '感情上会有小惊喜',
  '创造力超强，适合做创意工作',
  '今天适合学习新技能',
  '保持微笑，好事自然来',
  '适合做重要决定的一天',
  '放下包袱，轻装上阵',
  '今天的贵人就在身边',
  '专注力很强，效率翻倍',
  '适合给自己一个小奖励',
  '今天容易遇到有趣的人和事',
  '内心平静就是最大的力量',
  '勇气值拉满，冲就对了',
  '今天适合整理房间和心情',
  '会有意想不到的好消息',
  '适合反思和复盘',
  '今天的行动力超强',
];

const insightPool = [
  '今天的你可能会感到一股莫名的冲劲，适合把搁置的计划重新拿出来审视。不要害怕犯错，每一步都是经验的积累。',
  '你的直觉今天特别敏锐，在面对选择时不妨多听听内心的声音。有些答案不在逻辑里，而在感受中。',
  '今天的能量适合与人连接，无论是一次深度对话还是简单的问候，都能带来意想不到的温暖。打开心扉吧。',
  '你可能会遇到一些小阻碍，但这恰恰是宇宙在提醒你换个角度思考。换条路走，风景可能更美。',
  '今天适合慢下来，给自己泡杯茶，看看窗外的风景。不是所有的进步都需要快速奔跑，有时候停下来才能看清方向。',
  '创意思维今天特别活跃，如果脑海中闪过什么有趣的想法，立刻记下来。灵感转瞬即逝，但被捕捉的灵感会开花。',
  '今天在人际关系中可能需要多一些耐心。每个人都有自己的节奏，学会尊重差异，关系才能长久。',
  '你的魅力值今天在线，适合展示真实的自己。不需要伪装，真诚本身就是最大的吸引力。',
  '今天适合处理那些你一直逃避的事情。面对它，处理它，然后放下它。你会发现没有想象中那么难。',
  '能量在上午比较集中，建议把重要的事情安排在前半天。下午适合做一些轻松愉快的事来犒赏自己。',
  '今天可能会有一些小确幸发生，保持觉察，不要因为忙碌而错过了生活中的美好瞬间。',
  '你的表达能力今天很强，有什么想说的话、想写的文字，现在就是最好的时机。',
  '今天的你像一块海绵，特别容易吸收新知识。抓住这个状态，学点新东西吧。',
  '情绪可能会有些起伏，这很正常。允许自己有不完美的时刻，温柔地对待自己。',
  '今天适合做减法——清理不需要的东西、告别消耗你的关系、放下过时的执念。轻装才能远行。',
  '你可能会收到一个来自过去的讯息或回忆，不管是什么，带着感恩的心接受它，然后继续向前。',
  '今天的协作运很好，如果有需要合作完成的事情，主动发起吧。集体智慧会带来惊喜。',
  '内心深处可能有一个声音在催促你做某件事——听从它。那是你真实自我在指引方向。',
  '今天适合给重要的人表达爱意，不需要等到特殊的日子。平凡日子里的爱意最动人。',
  '你的恢复力今天很强，如果最近经历了什么困难，今天是疗愈的好日子。允许阳光照进来。',
  '今天适合设定一个小目标并完成它，这种成就感会给你带来持续一整天的好心情。',
  '有些事情不需要想清楚再行动。今天适合边做边想，在行动中找到答案。',
  '今天你的共情能力特别强，可能会被别人的故事打动。这种敏感是一种天赋，好好珍惜。',
  '宇宙在提醒你关注身体的信号——累了就休息，饿了就吃饭，困了就睡觉。基础需求比什么都重要。',
  '今天的财运与你的心态直接挂钩。保持丰盛的心态，相信自己值得美好的事物。',
  '一个新的想法可能正在你心中萌芽，不要急着评判它是否可行。先让它生长一段时间。',
  '今天适合打破常规做一些不一样的事——换一条上班路、尝试新口味、听一种没听过的音乐。',
  '你的判断力今天非常在线，如果需要做决定，相信自己的选择。犹豫不决才是最大的浪费。',
  '今天可能有人需要你的帮助，在力所能及的范围内伸出援手吧。帮助别人的同时你也在帮助自己。',
  '夜晚会带来特别的平静，适合在睡前做一些冥想或者写几行日记。与自己对话是一天中最好的结尾。',
];

const doPool = [
  '和朋友聊天倾诉', '尝试新的料理', '去户外散步', '整理工作空间',
  '给家人打个电话', '听一张完整的专辑', '写下三件感恩的事', '做一次深呼吸冥想',
  '学一个新技能', '看一部好电影', '早睡早起', '给自己买朵花',
  '暧昧拉扯、分享心事', '运动出汗', '尝试手写一封信', '整理手机相册',
  '去咖啡厅坐坐', '阅读一个章节', '画一幅小画', '做志愿活动',
  '逛一家没去过的店', '拍照记录生活', '和宠物玩耍', '准备一份礼物',
  '泡一个舒服的澡', '种一棵小植物', '复盘最近的进展', '列一个心愿清单',
  '大胆表达想法', '尝试一种新运动', '认真听别人说话', '为明天做计划',
  '清理不用的APP', '练习一首歌', '看日落', '写一段文字',
];

const avoidPool = [
  '和人争论', '熬夜', '做冲动消费', '发负面情绪的朋友圈',
  '缩头乌龟、起泡', '在生气时做决定', '过度加班', '暴饮暴食',
  '和不合适的人纠缠', '拖延重要的事', '刷手机超过2小时', '说话不经大脑',
  '过于在意他人评价', '逃避问题', '借钱给不靠谱的人', '情绪化发言',
  '开始新的坏习惯', '压抑真实想法', '太晚喝咖啡', '一个人生闷气',
  '在深夜做重大决定', '忽略身体不适', '答应做不到的事', '和过去死磕',
  '过度比较', '强迫自己社交', '忽视直觉', '做甩手掌柜',
  '凡事追求完美', '自我否定',
];

const colorPool: { name: string; hex: string }[] = [
  { name: '薄荷绿', hex: '#98FFD6' },
  { name: '珊瑚粉', hex: '#FF7F7F' },
  { name: '天空蓝', hex: '#87CEEB' },
  { name: '向日葵黄', hex: '#FFD700' },
  { name: '薰衣草紫', hex: '#E6B0FF' },
  { name: '蜜桃橙', hex: '#FFAB76' },
  { name: '奶油白', hex: '#FFFDD0' },
  { name: '樱花粉', hex: '#FFB7C5' },
  { name: '海洋蓝', hex: '#006994' },
  { name: '抹茶绿', hex: '#88B04B' },
  { name: '丁香紫', hex: '#C8A2C8' },
  { name: '柠檬黄', hex: '#FFF44F' },
  { name: '雾霾蓝', hex: '#6699CC' },
  { name: '焦糖棕', hex: '#C68E17' },
  { name: '冰川灰', hex: '#C4C4C4' },
  { name: '玫瑰红', hex: '#FF007F' },
  { name: '鼠尾草绿', hex: '#87AE73' },
  { name: '琥珀橙', hex: '#FFBF00' },
  { name: '月光银', hex: '#D6E4E1' },
  { name: '莫兰迪粉', hex: '#D4A5A5' },
];

const musicGenrePool = [
  '爵士', '轻音乐', '民谣', '电子', '古典',
  '流行', 'R&B', '摇滚', '嘻哈', '蓝调',
  '乡村', '雷鬼', '放克', '灵魂乐', '新世纪',
];

const timeSlotPool = [
  '早晨 7-8 点', '上午 9-10 点', '上午 10-11 点', '中午 12-13 点',
  '下午 14-15 点', '下午 15-16 点', '傍晚 17-18 点', '晚上 20-21 点',
];

const foodPool = [
  '抹茶拿铁', '草莓蛋糕', '热汤面', '牛角包',
  '酸奶碗', '寿司', '巧克力', '冰美式',
  '水果沙拉', '奶茶', '烤红薯', '提拉米苏',
  '三明治', '椰子水', '煎饺', '肉桂卷',
  '芝士披萨', '蜂蜜柚子茶', '牛油果吐司', '红豆汤',
  '豆浆', '鸡蛋仔', '芒果冰', '热可可',
  '烧仙草',
];

// Seeded PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeed(dateStr: string, zodiacIndex: number): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash * 13 + zodiacIndex * 7919);
}

function pick<T>(pool: T[], rand: () => number): T {
  return pool[Math.floor(rand() * pool.length)];
}

function pickMultiple<T>(pool: T[], count: number, rand: () => number): T[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function randRange(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function generateFortune(zodiac: ZodiacSign, dateStr?: string): FortuneData {
  const today = dateStr || new Date().toISOString().slice(0, 10);
  const zodiacIndex = zodiacList.findIndex((z) => z.id === zodiac);
  const seed = createSeed(today, zodiacIndex);
  const rand = mulberry32(seed);

  const totalScore = randRange(62, 95, rand);
  const summary = pick(summaryPool, rand);
  const dimensions: FortuneDimensions = {
    emotion: randRange(55, 98, rand),
    social: randRange(50, 98, rand),
    creativity: randRange(50, 98, rand),
    wealth: randRange(50, 95, rand),
    love: randRange(50, 98, rand),
  };
  const insight = pick(insightPool, rand);
  const doList = pickMultiple(doPool, 2, rand);
  const avoidList = pickMultiple(avoidPool, 2, rand);
  const colorItem = pick(colorPool, rand);
  const lucky: LuckyElements = {
    color: colorItem.name,
    colorHex: colorItem.hex,
    musicGenre: pick(musicGenrePool, rand),
    timeSlot: pick(timeSlotPool, rand),
    food: pick(foodPool, rand),
    number: randRange(1, 99, rand),
  };

  return { zodiac, date: today, totalScore, summary, dimensions, insight, doList, avoidList, lucky };
}

// localStorage helpers

const ZODIAC_KEY = 'moodvibe-zodiac';
const FORTUNE_CACHE_KEY = 'moodvibe-fortune-cache';

export function getUserZodiac(): ZodiacSign | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ZODIAC_KEY) as ZodiacSign | null;
}

export function setUserZodiac(zodiac: ZodiacSign): void {
  localStorage.setItem(ZODIAC_KEY, zodiac);
}

export function getTodayFortune(): FortuneData | null {
  if (typeof window === 'undefined') return null;
  const zodiac = getUserZodiac();
  if (!zodiac) return null;

  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(FORTUNE_CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw) as { date: string; zodiac: ZodiacSign; data: FortuneData };
      if (cache.date === today && cache.zodiac === zodiac) {
        return cache.data;
      }
    }
  } catch {}

  const data = generateFortune(zodiac, today);
  localStorage.setItem(FORTUNE_CACHE_KEY, JSON.stringify({ date: today, zodiac, data }));
  return data;
}

export function clearFortuneCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FORTUNE_CACHE_KEY);
}
