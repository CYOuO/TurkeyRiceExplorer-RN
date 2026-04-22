import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, StatusBar,
} from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../App';
import { useApp } from '../context/AppContext';

type Props = DrawerScreenProps<DrawerParamList, 'HomeStack'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useApp();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/images/home_background.jpg')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />

        {/* 漢堡選單按鈕 */}
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        {/* 中央標題 */}
        <View style={styles.center}>
          <Text style={styles.emoji}>🦃</Text>
          <Text style={styles.mainTitle}>Turkey Rice{'\n'}Explorer</Text>
          <Text style={styles.subTitle}>A Local's Guide to Delicious Food</Text>
          <Text style={styles.subTitleCN}>嘉義火雞肉飯探索指南</Text>

          <View style={styles.tags}>
            {['📍 嘉義市區', '⭐ 在地美食', '🍗 火雞肉飯'].map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 底部按鈕 */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('HomeStack', { screen: 'RestaurantInfo' } as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>🔍  開始探索</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>收錄嘉義市 30 間火雞肉飯店家</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg:        { flex: 1, width: '100%', height: '100%' },
  overlay:   { ...StyleSheet.absoluteFill },
  menuBtn: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
  },
  menuIcon: { fontSize: 22, color: '#FFF' },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24, marginTop: 60,
  },
  emoji: { fontSize: 64, marginBottom: 12 },
  mainTitle: {
    fontSize: 42, fontWeight: 'bold', color: '#FFF',
    textAlign: 'center', lineHeight: 50,
    textShadowColor: 'rgba(200,120,0,0.8)',
    textShadowOffset: { width: -2, height: -2 }, textShadowRadius: 20,
  },
  subTitle: {
    fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 12,
    textShadowColor: 'rgba(100,50,0,0.6)',
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4,
  },
  subTitleCN: {
    fontSize: 14, color: 'rgba(255,220,150,0.9)',
    marginTop: 4, fontWeight: '500', letterSpacing: 3,
  },
  tags: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', marginTop: 24, gap: 8,
  },
  tag: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  tagText: { color: '#FFF', fontSize: 13, fontWeight: '500' },
  bottom:  { paddingBottom: 50, paddingHorizontal: 40, alignItems: 'center' },
  startBtn: {
    width: '100%', paddingVertical: 16,
    borderRadius: 30, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  hint: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 12 },
});
