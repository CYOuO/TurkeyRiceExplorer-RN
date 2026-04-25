// ─── 主題色彩變數 ───────────────────────────────────────────
// 修改這裡就能全局改色

export interface ColorScheme {
  primary:       string;
  primaryDark:   string;
  primaryLight:  string;
  secondary:     string;
  accent:        string;
  background:    string;
  surface:       string;
  card:          string;
  header:        string;
  headerText:    string;
  text:          string;
  textSecondary: string;
  textLight:     string;
  border:        string;
  divider:       string;
  overlay:       string;
  starFilled:    string;
  starEmpty:     string;
  openBadge:     string;
  openBadgeBg:   string;
  closedBadge:   string;
  closedBadgeBg: string;
  favActive:     string;
  favInactive:   string;
  drawerBg:      string;
  drawerActive:  string;
  inputBg:       string;
  shadow:        string;
  tagBg:         string;
  tagText:       string;
}

export const lightColors: ColorScheme = {
  primary:       '#805b2e',
  primaryDark:   '#9d6311',
  primaryLight:  '#FDE9C0',
  secondary:     '#FFD166',
  accent:        '#df8e03',
  background:    '#FFF8E7',
  surface:       '#FFFFFF',
  card:          '#FFFBF0',
  header:        '#895f41',
  headerText:    '#FFFFFF',
  text:          '#2C1810',
  textSecondary: '#7A5C3A',
  textLight:     '#B08060',
  border:        '#F0D080',
  divider:       '#F0D8A0',
  overlay:       'rgba(30,10,0,0.65)',
  starFilled:    '#FFB800',
  starEmpty:     '#DDD0B0',
  openBadge:     '#2E7D32',
  openBadgeBg:   '#E8F5E9',
  closedBadge:   '#C62828',
  closedBadgeBg: '#FFEBEE',
  favActive:     '#E53935',
  favInactive:   '#CCC',
  drawerBg:      '#FFF5D6',
  drawerActive:  '#FDE9C0',
  inputBg:       '#FFFFFF',
  shadow:        'rgba(180,100,0,0.15)',
  tagBg:         '#FDE9C0',
  tagText:       '#93765e',
};

export const darkColors: ColorScheme = {
  primary:       '#805b2e',
  primaryDark:   '#a0733d',
  primaryLight:  'rgba(212, 136, 26, 0.15)',
  secondary:     '#FFD166',
  accent:        '#855411',
  // 背景層：深焙黑咖啡 (Dark Espresso)
  background:    '#2A1F18', // 帶有明確咖啡色相的極深底色
  surface:       '#382A20', // 摩卡色 (用於卡片、區塊)
  card:          '#423226', // 稍亮的摩卡色
  header:        '#2A1F18',
  headerText:    '#FDF5E6', // 拿鐵奶泡色 (高對比暖白)
  
  // 文字層：確保 WCAG 對比度，使用暖白與淺奶茶色
  text:          '#F5EBE0', 
  textSecondary: '#D4C4B7',
  textLight:     '#A39182',
  
  // 框線與陰影
  border:        '#5C4738',
  divider:       '#453528',
  overlay:       'rgba(20, 15, 10, 0.8)', // 偏黑棕色的遮罩
  
  // 狀態與標籤顏色 (配合咖啡底色，微調綠色與紅色的明度，避免暗沉)
  starFilled:    '#FFD166',
  starEmpty:     '#5C4738',
  openBadge:     '#6EE7B7', 
  openBadgeBg:   'rgba(110, 231, 183, 0.15)',
  closedBadge:   '#FCA5A5',
  closedBadgeBg: 'rgba(252, 165, 165, 0.15)',
  favActive:     '#EF5350',
  favInactive:   '#5C4738',
  
  // 介面元件
  drawerBg:      '#2A1F18',
  drawerActive:  'rgba(212, 136, 26, 0.15)',
  inputBg:       '#382A20',
  shadow:        'rgba(0, 0, 0, 0.5)',
  tagBg:         'rgba(212, 136, 26, 0.15)',
  tagText:       '#FFD166',
};