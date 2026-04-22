// 中文星期對應 JS getDay()（0=日,1=一,...,6=六）
const CHINESE_DAY_MAP: Record<string, number> = {
  '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '日': 0,
};

export const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function inRange(start: number, end: number, cur: number): boolean {
  if (end < start) return cur >= start || cur <= end; // 跨午夜
  return cur >= start && cur <= end;
}

function getClosedDays(time: string): number[] {
  const match = time.match(/[（(]([^）)]*?)公休[）)]/);
  if (!match) return [];
  const s = match[1];
  const closed: number[] = [];
  for (const [ch, d] of Object.entries(CHINESE_DAY_MAP)) {
    if (s.includes(`週${ch}`) || s.includes(`、${ch}`) || s.startsWith(ch)) {
      if (!closed.includes(d)) closed.push(d);
    }
  }
  return closed;
}

export function isOpenNow(time: string): boolean {
  const now = new Date();
  const dow = now.getDay();
  const cur = now.getHours() * 60 + now.getMinutes();

  if (getClosedDays(time).includes(dow)) return false;

  const isWeekend = dow === 0 || dow === 6;
  if (time.includes('平日') || time.includes('假日')) {
    const key = isWeekend ? '假日' : '平日';
    const m = time.match(new RegExp(`${key}(\\d{1,2}:\\d{2})[–\\-](\\d{1,2}:\\d{2})`));
    if (!m) return false;
    return inRange(toMinutes(m[1]), toMinutes(m[2]), cur);
  }

  const clean = time
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/每天/g, '')
    .trim();

  for (const seg of clean.split(',')) {
    const m = seg.match(/(\d{1,2}:\d{2})[–\-](\d{1,2}:\d{2})/);
    if (m && inRange(toMinutes(m[1]), toMinutes(m[2]), cur)) return true;
  }
  return false;
}

export function isOpenOnDay(time: string, day: number): boolean {
  if (getClosedDays(time).includes(day)) return false;

  if (time.includes('平日') || time.includes('假日')) {
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend && time.includes('平日')) return true;
    if (isWeekend && time.includes('假日')) return true;
    return false;
  }
  return true;
}
