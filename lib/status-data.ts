import type { StatusCategory } from './types';

export const statusCategories: StatusCategory[] = [
  {
    name: '心情想法',
    items: [
      { id: 'happy', emoji: '😊', label: '美滋滋', baseMood: 'energetic' },
      { id: 'energetic', emoji: '⚡', label: '元气满满', baseMood: 'energetic' },
      { id: 'recharged', emoji: '🔋', label: '满血复活', baseMood: 'energetic' },
      { id: 'inlove', emoji: '💕', label: '恋爱中', baseMood: 'inlove' },
      { id: 'sentimental', emoji: '🌊', label: '感性时刻', baseMood: 'sad' },
      { id: 'spacing', emoji: '😶', label: '发呆', baseMood: 'chill' },
      { id: 'tired', emoji: '😫', label: '疲惫', baseMood: 'lazy' },
      { id: 'overthink', emoji: '🌀', label: '胡思乱想', baseMood: 'sad' },
      { id: 'emo', emoji: '🖤', label: 'emo中', baseMood: 'sad' },
      { id: 'broken', emoji: '💔', label: '裂开', baseMood: 'sad' },
    ],
  },
  {
    name: '工作学习',
    items: [
      { id: 'slacking', emoji: '🐟', label: '摸鱼中', baseMood: 'lazy' },
      { id: 'commute', emoji: '🚇', label: '通勤中', baseMood: 'chill' },
      { id: 'grinding', emoji: '🧱', label: '搬砖中', baseMood: 'overtime' },
      { id: 'meetings', emoji: '🔁', label: '开会循环', baseMood: 'overtime' },
      { id: 'travel', emoji: '✈️', label: '出差', baseMood: 'chill' },
      { id: 'studying', emoji: '📚', label: '沉迷学习', baseMood: 'overtime' },
      { id: 'inspired', emoji: '💡', label: '灵感爆发', baseMood: 'energetic' },
      { id: 'deadline', emoji: '⏰', label: 'deadline战士', baseMood: 'overtime' },
    ],
  },
  {
    name: '活动',
    items: [
      { id: 'eating', emoji: '🍚', label: '干饭', baseMood: 'energetic' },
      { id: 'milktea', emoji: '🧋', label: '喝奶茶', baseMood: 'chill' },
      { id: 'coffee', emoji: '☕', label: '喝咖啡', baseMood: 'chill' },
      { id: 'selfie', emoji: '🤳', label: '自拍', baseMood: 'energetic' },
      { id: 'party', emoji: '🍻', label: '聚会', baseMood: 'energetic' },
      { id: 'tipsy', emoji: '🍷', label: '微醺', baseMood: 'chill' },
      { id: 'citywalk', emoji: '🚶', label: 'city walk', baseMood: 'chill' },
      { id: 'onroad', emoji: '🧳', label: '旅途中', baseMood: 'chill' },
      { id: 'workout', emoji: '🏃', label: '运动', baseMood: 'energetic' },
    ],
  },
  {
    name: '休息',
    items: [
      { id: 'athome', emoji: '🏠', label: '宅家', baseMood: 'lazy' },
      { id: 'sleeping', emoji: '😴', label: '睡觉', baseMood: 'lazy' },
      { id: 'scrolling', emoji: '📱', label: '刷手机', baseMood: 'lazy' },
      { id: 'binge', emoji: '📺', label: '追剧', baseMood: 'lazy' },
      { id: 'gaming', emoji: '🎮', label: '玩游戏', baseMood: 'energetic' },
      { id: 'music', emoji: '🎵', label: '听歌', baseMood: 'chill' },
      { id: 'reading', emoji: '📖', label: '看书', baseMood: 'chill' },
      { id: 'cat', emoji: '🐱', label: '吸猫', baseMood: 'chill' },
      { id: 'dog', emoji: '🐕', label: '遛狗', baseMood: 'chill' },
    ],
  },
];

export const cities = [
  '北京', '上海', '广州', '深圳', '杭州',
  '成都', '重庆', '武汉', '南京', '西安',
  '长沙', '青岛', '厦门', '昆明', '大连',
];

export const genreOptions = [
  { id: 'pop', label: '流行', emoji: '🎤' },
  { id: 'folk', label: '民谣', emoji: '🎸' },
  { id: 'rock', label: '摇滚', emoji: '🤘' },
  { id: 'electronic', label: '电子', emoji: '🎛️' },
  { id: 'hiphop', label: '说唱', emoji: '🎙️' },
  { id: 'rnb', label: 'R&B', emoji: '🎷' },
  { id: 'jazz', label: '爵士', emoji: '🎺' },
  { id: 'classical', label: '古典/纯音乐', emoji: '🎹' },
  { id: 'acg', label: 'ACG', emoji: '🌸' },
  { id: 'chinese', label: '国风', emoji: '🏮' },
];

export const languageOptions = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: '英文' },
  { id: 'jp', label: '日语' },
  { id: 'kr', label: '韩语' },
  { id: 'any', label: '不限' },
];

export const emotionModeOptions = [
  { id: 'match', label: '顺着来', desc: '心情什么色，歌就什么味' },
  { id: 'contrast', label: '反着来', desc: '丧的时候来一首振奋的' },
];
