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
  primary:       '#F5A623',
  primaryDark:   '#D4881A',
  primaryLight:  '#FDE9C0',
  secondary:     '#FFD166',
  accent:        '#C75B00',
  background:    '#FFF8E7',
  surface:       '#FFFFFF',
  card:          '#FFFBF0',
  header:        '#F5A623',
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
  tagText:       '#C75B00',
};

export const darkColors: ColorScheme = {
  primary:       '#F5A623',
  primaryDark:   '#D4881A',
  primaryLight:  '#4A2E00',
  secondary:     '#FFD166',
  accent:        '#FFB347',
  background:    '#1A0F00',
  surface:       '#2A1800',
  card:          '#331E00',
  header:        '#2A1800',
  headerText:    '#FFE0A0',
  text:          '#FFE8C0',
  textSecondary: '#C8965A',
  textLight:     '#8A6040',
  border:        '#4A3010',
  divider:       '#3A2200',
  overlay:       'rgba(0,0,0,0.72)',
  starFilled:    '#FFB800',
  starEmpty:     '#4A3010',
  openBadge:     '#66BB6A',
  openBadgeBg:   '#1B3A1C',
  closedBadge:   '#EF5350',
  closedBadgeBg: '#3A1010',
  favActive:     '#EF5350',
  favInactive:   '#555',
  drawerBg:      '#221400',
  drawerActive:  '#3A2200',
  inputBg:       '#2A1800',
  shadow:        'rgba(0,0,0,0.4)',
  tagBg:         '#3A2200',
  tagText:       '#FFB347',
};
