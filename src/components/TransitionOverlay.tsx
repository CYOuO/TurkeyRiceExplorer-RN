import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, Text, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLA_COLORS = {
  main: '#2B1100',
  waveLight: '#6F4E37',
  bubble: 'rgba(255, 220, 150, 0.45)',
  foam: '#FDFDD0',
};

// ─── 1. 氣泡組件 ───────────────────────────────────
const Bubble = ({ delay, startX }: { delay: number; startX: number }) => {
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const size = Math.random() * 10 + 6;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(bubbleAnim, {
        toValue: -height,
        duration: 1500 + Math.random() * 500, // 稍微放慢一點點，更有可樂感
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    const timeout = setTimeout(() => anim.start(), delay);
    return () => {
      clearTimeout(timeout);
      anim.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: startX,
          bottom: -20,
          transform: [{ translateY: bubbleAnim }],
        },
      ]}
    />
  );
};

export default function TransitionOverlay({ visible }: { visible: boolean }) {
  const [shouldRender, setShouldRender] = useState(visible);
  const liquidAnim = useRef(new Animated.Value(height)).current;
  
  // ─── 2. 翻轉狀態 ───────────────────────────────────
  const [iconIndex, setIconIndex] = useState(0);
  const icons = ['🦃', '🥚', '🍚']; 
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setIconIndex(0); 
      flipAnim.setValue(0);
      
      // 水位上升
      Animated.timing(liquidAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start();

      // 🔄 翻轉定時器：調慢至 550ms，配合 1800ms 的總長，每張圖都能優雅亮相
      const flipInterval = setInterval(() => {
        Animated.timing(flipAnim, {
          toValue: 0.5,
          duration: 200, // 稍微增加翻轉過程的時間
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }).start(() => {
          setIconIndex(prev => (prev + 1) % icons.length);
          
          Animated.timing(flipAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }).start(() => {
            flipAnim.setValue(0); 
          });
        });
      }, 550); 

      return () => clearInterval(flipInterval);
    } else {
      Animated.timing(liquidAnim, {
        toValue: height,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }).start(() => setShouldRender(false));
    }
  }, [visible]);

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  if (!shouldRender) return null;

  return (
    <Animated.View 
      pointerEvents="none" 
      style={[styles.full, { transform: [{ translateY: liquidAnim }] }]}
    >
      <View style={styles.colaLiquid}>
        {[...Array(8)].map((_, i) => (
          <Bubble key={i} delay={i * 150} startX={(width / 8) * i + 10} />
        ))}
        
        <View style={styles.center}>
          <Animated.Text style={[styles.emoji, { transform: [{ rotateY }] }]}>
            {icons[iconIndex]}
          </Animated.Text>
          <Text style={styles.loadingTxt}>Delicious Loading</Text>
          <Text style={styles.subTxt}>嘉義美食探索中...</Text>
        </View>
      </View>
      
      {/* 輕量海浪 */}
      <View style={styles.waveContainer}>
         <View style={[styles.waveItem, { transform: [{ rotate: '4deg' }], left: -20 }]} />
         <View style={[styles.waveItem, { transform: [{ rotate: '-4deg' }], right: -20 }]} />
         <View style={styles.foamLine} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  full: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, elevation: 20 },
  colaLiquid: { flex: 1, backgroundColor: COLA_COLORS.main, justifyContent: 'center', alignItems: 'center' },
  center: { alignItems: 'center' },
  emoji: { fontSize: 110, marginBottom: 15 }, 
  loadingTxt: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  subTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 5 },
  bubble: { position: 'absolute', backgroundColor: COLA_COLORS.bubble },
  waveContainer: { position: 'absolute', top: -30, width: width, height: 50 },
  waveItem: {
    position: 'absolute',
    width: width * 0.7,
    height: 80,
    backgroundColor: COLA_COLORS.main,
    borderRadius: 30,
    top: 0,
  },
  foamLine: {
    position: 'absolute',
    top: 20,
    width: width,
    height: 4,
    backgroundColor: COLA_COLORS.foam,
    opacity: 0.4,
  },
});