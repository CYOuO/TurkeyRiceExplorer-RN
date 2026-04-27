// 過場動畫 - 跟隨日/夜間模式切換主題色
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, Text, Easing } from 'react-native';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');


const LIGHT_THEME = {
  main:      '#FFF3D0',
  wave:      '#F5A623',
  bubble:    'rgba(245,166,35,0.3)',
  foam:      '#FFF9E6',
  text:      '#C75B00',
  subText:   'rgba(180,80,0,0.7)',
  iconBg:    '#FFE082',
};

const DARK_THEME = {
  main:      '#2B1100',
  wave:      '#6F4E37',
  bubble:    'rgba(255,220,150,0.45)',
  foam:      '#FDFDD0',
  text:      '#FFE0A0',
  subText:   'rgba(255,200,120,0.6)',
  iconBg:    '#3A2000',
};

// ─── 氣泡組件 ───
const Bubble = ({ delay, startX, color }: { delay: number; startX: number; color: string }) => {
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const size = Math.random() * 10 + 6;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(bubbleAnim, {
        toValue: -height,
        duration: 1500 + Math.random() * 500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    const timeout = setTimeout(() => anim.start(), delay);
    return () => { clearTimeout(timeout); anim.stop(); };
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        { width: size, height: size, borderRadius: size / 2, left: startX, bottom: -20,
          transform: [{ translateY: bubbleAnim }], backgroundColor: color },
      ]}
    />
  );
};

export default function TransitionOverlay({ visible }: { visible: boolean }) {// 根據 visible 狀態控制過場動畫的顯示與隱藏
  const { isDark } = useApp();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const [shouldRender, setShouldRender] = useState(visible);
  const liquidAnim = useRef(new Animated.Value(height)).current;

  const [iconIndex, setIconIndex] = useState(0);
  const icons = ['🦃', '🥚', '🍚'];
  const flipAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setIconIndex(0);
      flipAnim.setValue(0);

      Animated.timing(liquidAnim, {// 液體上升動畫
        toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.quad),
      }).start();

      const flipInterval = setInterval(() => {
        Animated.timing(flipAnim, {
          toValue: 0.5, duration: 200, useNativeDriver: true, easing: Easing.inOut(Easing.quad),
        }).start(() => {
          setIconIndex(prev => (prev + 1) % icons.length);
          Animated.timing(flipAnim, {
            toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.inOut(Easing.quad),
          }).start(() => flipAnim.setValue(0));
        });
      }, 550);

      return () => clearInterval(flipInterval);
    } else {
      Animated.timing(liquidAnim, { // 液體下降動畫
        toValue: height, duration: 500, useNativeDriver: true, easing: Easing.in(Easing.quad),
      }).start(() => setShouldRender(false));
    }
  }, [visible]);

  const rotateY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  if (!shouldRender) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.full, { transform: [{ translateY: liquidAnim }] }]}>
      <View style={[styles.liquid, { backgroundColor: theme.main }]}>
        {[...Array(8)].map((_, i) => (
          <Bubble key={i} delay={i * 150} startX={(width / 8) * i + 10} color={theme.bubble} />
        ))}

        <View style={styles.center}>
          {/* Icon背景光暈 */}
          <View style={[styles.iconGlow, { backgroundColor: theme.iconBg }]}>
            <Animated.Text style={[styles.emoji, { transform: [{ rotateY }] }]}>
              {icons[iconIndex]}
            </Animated.Text>
          </View>
          <Text style={[styles.loadingTxt, { color: theme.text }]}>Delicious Loading</Text>
          <Text style={[styles.subTxt, { color: theme.subText }]}>嘉義美食探索中...</Text>

          {/* 進度點點 */}
          <View style={styles.dotRow}>
            {[0,1,2].map(i => (
              <View key={i} style={[styles.progressDot, { backgroundColor: theme.wave, opacity: 0.6 + i * 0.2 }]} />
            ))}
          </View>
        </View>
      </View>

      {/* 波浪裝飾 */}
      <View style={styles.waveContainer}>
        <View style={[styles.waveItem, { transform: [{ rotate: '4deg' }], left: -20, backgroundColor: theme.main }]} />
        <View style={[styles.waveItem, { transform: [{ rotate: '-4deg' }], right: -20, backgroundColor: theme.main }]} />
        <View style={[styles.foamLine, { backgroundColor: theme.foam }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  full:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, elevation: 20 },
  liquid:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center:        { alignItems: 'center', gap: 12 },
  iconGlow:      { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emoji:         { fontSize: 90 },
  loadingTxt:    { fontSize: 24, fontWeight: 'bold' },
  subTxt:        { fontSize: 15 },
  dotRow:        { flexDirection: 'row', gap: 8, marginTop: 4 },
  progressDot:   { width: 8, height: 8, borderRadius: 4 },
  bubble:        { position: 'absolute' },
  waveContainer: { position: 'absolute', top: -30, width, height: 50 },
  waveItem:      { position: 'absolute', width: width * 0.7, height: 80, borderRadius: 30, top: 0 },
  foamLine:      { position: 'absolute', top: 20, width, height: 4, opacity: 0.4 },
});