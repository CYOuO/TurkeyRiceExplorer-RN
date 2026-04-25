import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, StatusBar, Animated, Easing, Dimensions,
} from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { lightColors } from '../theme/colors'; // 引入固定的日間模式顏色

type Props = DrawerScreenProps<DrawerParamList, 'HomeStack'>;

const { width, height } = Dimensions.get('window');

const QUICK_LINKS = [
  { icon: '💰', label: '吃飯記帳',   screen: 'Expense' },
  { icon: '🎲', label: '隨機選店', screen: 'Random' },
  { icon: '📔', label: '飲食日記', screen: 'Diary' },
];

const FLOAT_ITEMS = ['⭐', '🍚', '🍚', '⭐'];

export default function HomeScreen({ navigation }: Props) {
  const { triggerTransition } = useApp();

  // 漂浮動畫
  const floatAnims = useRef(FLOAT_ITEMS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    floatAnims.forEach((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 2200 + i * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2200 + i * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      setTimeout(() => loop.start(), i * 400);
    });
  }, []);

  // 主 logo 脈動
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleStart = () => {
    triggerTransition();
    setTimeout(() => navigation.navigate('HomeStack', { screen: 'RestaurantInfo' }as never), 500);
  };

  const FLOAT_POSITIONS = [
    { x: 0.08, y: 0.13 }, { x: 0.82, y: 0.10 }, { x: 0.05, y: 0.55 },
    { x: 0.88, y: 0.46 }, { x: 0.15, y: 0.82 }, { x: 0.78, y: 0.78 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/images/home_background.jpg')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* 強制使用 lightColors 的遮罩顏色，不隨系統深淺色切換 */}
        <View style={[styles.overlay, { backgroundColor: lightColors.overlay }]} />

        {/* 漂浮 emoji */}
        {FLOAT_ITEMS.map((icon, i) => {
          const translateY = floatAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
          const opacity    = floatAnims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 0.55, 0.25] });
          return (
            <Animated.Text
              key={i}
              style={[styles.floatIcon, {
                left: width * FLOAT_POSITIONS[i].x,
                top: height * FLOAT_POSITIONS[i].y,
                transform: [{ translateY }],
                opacity,
              }]}
            >
              {icon}
            </Animated.Text>
          );
        })}

        {/* 中央主標題 */}
        <View style={styles.center}>
          <Animated.Text style={[styles.logoEmoji, { transform: [{ scale: pulseAnim }] }]}>🦃</Animated.Text>

          {/* 裝飾線 */}
          <View style={styles.decorLine}>
            <View style={[styles.line, { backgroundColor: 'rgba(255,220,100,0.5)' }]} />
            <Text style={styles.decorTxt}>• • •</Text>
            <View style={[styles.line, { backgroundColor: 'rgba(255,220,100,0.5)' }]} />
          </View>

          <Text style={styles.mainTitle}>Turkey Rice</Text>
          <Text style={styles.mainSub}>Explorer</Text>

          <View style={styles.decorLine}>
            <View style={[styles.line, { backgroundColor: 'rgba(255,220,100,0.5)' }]} />
            <Text style={styles.decorTxt}>• • •</Text>
            <View style={[styles.line, { backgroundColor: 'rgba(255,220,100,0.5)' }]} />
          </View>

          <Text style={styles.subCN}>嘉義火雞肉飯探索指南</Text>

          {/* 三個功能連結標籤 */}
          <View style={styles.tags}>
            {QUICK_LINKS.map(link => (
              <TouchableOpacity
                key={link.screen}
                style={styles.tagBtn}
                onPress={() => navigation.navigate(link.screen as never)}
                activeOpacity={0.8}
              >
                <Text style={styles.tagIcon}>{link.icon}</Text>
                <Text style={styles.tagText}>{link.label}</Text>
              </TouchableOpacity>
            ))}  
          </View>
          
          {/* 強制使用 lightColors 的按鈕顏色 */}
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: lightColors.primary }]}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>🔍  開始探索店家</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg:        { flex: 1, width: '100%', height: '100%' },
  overlay:   { ...StyleSheet.absoluteFill },
  floatIcon: { position: 'absolute', fontSize: 28 },

  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 28, marginTop: 50,
  },
  logoEmoji: { fontSize: 72, marginBottom: 8 },

  decorLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  line:      { flex: 1, height: 1 },
  decorTxt:  { color: 'rgba(255,220,100,0.7)', fontSize: 12, letterSpacing: 4 },

  mainTitle: {
    fontSize: 44, fontWeight: '900', color: '#FFF', letterSpacing: 2,
    textShadowColor: 'rgba(180,90,0,0.8)',
    textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 12,
  },
  mainSub: {
    fontSize: 28, fontWeight: '300', color: 'rgba(255,220,150,0.95)',
    letterSpacing: 10, marginTop: -4, marginBottom: 4,
  },
  subCN: {
    fontSize: 13, color: 'rgba(255,220,120,0.85)',
    letterSpacing: 3, fontWeight: '500', marginTop: 4,
  },

  // 標籤列樣式
  tags: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginTop: 30, 
    gap: 10
  },
  tagBtn:  {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.35)',
    gap: 6,
  },
  tagIcon: { fontSize: 24 },
  tagText: { color: '#FFF', fontSize: 13, fontWeight: '600', letterSpacing: 1 },

  // 開始按鈕樣式
  startBtn: {
    width: '90%', paddingVertical: 16,
    borderRadius: 30, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
    marginTop: 30, 
  },
  startBtnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 },
});