import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useApp } from '../context/AppContext';

interface MenuItem {
  key: string;
  label: string;
  screen: string;
  params?: object;
}

const MENU: MenuItem[] = [

  { key: 'Restaurant', label: '🍗  探索店家',   screen: 'HomeStack',
    params: { screen: 'RestaurantInfo' } },
  { key: 'Favorites',  label: '❤️  我的收藏',   screen: 'Favorites' },
  { key: 'Diary',      label: '📔  雞肉飯日記', screen: 'Diary' },
  { key: 'Expense',    label: '💰  雞肉飯記帳本', screen: 'Expense' },
  { key: 'Random',     label: '🎲  隨機選店',   screen: 'Random' },
  { key: 'FlipGame',   label: '🃏  記憶大考驗', screen: 'FlipGame' },
];

export default function DrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const { colors, isDark, toggleTheme } = useApp();

  const currentRouteName = state.routes[state.index]?.name;

  const navigateTo = (item: MenuItem) => {
    if (item.params) {
      navigation.navigate(item.screen as never, item.params as never);
    } else {
      navigation.navigate(item.screen as never);
    }
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors.drawerBg }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#B8860B' }]}>
        <Text style={styles.emoji}>🦃</Text>
        <Text style={styles.title}>Turkey Rice</Text>
        <Text style={styles.sub}>嘉義火雞肉飯探索器</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        {MENU.map(item => {
          const isActive = currentRouteName === item.screen && !item.params;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem,
                isActive && { backgroundColor: colors.drawerActive }]}
              onPress={() => navigateTo(item)}>
              <Text style={[styles.menuLabel,
                { color: isActive ? colors.primary : colors.text }]}>
                {item.label}
              </Text>
              {isActive && (
                <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* 日夜切換 */}
      <View style={styles.themeRow}>
        <Text style={[styles.themeLabel, { color: colors.text }]}>
          {isDark ? '🌙 夜間模式' : '☀️  日間模式'}
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#DDD', true: colors.primary }}
          thumbColor={isDark ? colors.secondary : '#FFF'}
        />
      </View>

      <Text style={[styles.footer, { color: colors.textLight }]}>
        嘉義市 30 間火雞肉飯 🗺️
      </Text>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 24, paddingBottom: 20, alignItems: 'center' },
  emoji:  { fontSize: 48, marginBottom: 4 },
  title:  { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  sub:    { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  menuSection: { paddingTop: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 10, marginHorizontal: 8, marginVertical: 2,
  },
  menuLabel:  { fontSize: 16, fontWeight: '500', flex: 1 },
  activeBar:  { width: 4, height: 20, borderRadius: 2 },
  divider:    { height: 1, marginHorizontal: 20, marginVertical: 12 },
  themeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  themeLabel: { fontSize: 15, fontWeight: '500' },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 20, marginBottom: 12 },
});
