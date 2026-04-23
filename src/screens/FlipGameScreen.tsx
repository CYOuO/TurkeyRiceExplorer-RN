import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, Dimensions, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { restaurants } from '../data/restaurantData';
import { getImage } from '../data/imageMap';
import { ColorScheme } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 6;
const CARD_SIZE = (width - 32 - CARD_MARGIN * 6) / 3; 

type Props = DrawerScreenProps<DrawerParamList, 'FlipGame'>;

interface GameCard {
  uid: string;
  restaurantId: string;
  name: string;
  imageKey: string;
}

// ─── 單個 Toast 通知元件 (處理滑入與淡出動畫) ───────────
function ToastMessage({ msg, colors }: { msg: string; colors: ColorScheme }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }], opacity, backgroundColor: colors.accent }]}>
      <Text style={styles.toastTxt}>{msg}</Text>
    </Animated.View>
  );
}

// ─── 單張卡片元件 ────────────────────────────────────
function FlipCard({
  card, isFlipped, isMatched, onPress, colors
}: {
  card: GameCard; isFlipped: boolean; isMatched: boolean;
  onPress: () => void; colors: ColorScheme;
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFlipped || isMatched ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, isMatched, animatedValue]);

  const frontInterpolate = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate  = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1} style={styles.cardWrap}>
      <Animated.View style={[styles.cardBase, styles.cardFront, { transform: [{ rotateY: frontInterpolate }], backgroundColor: colors.primary }]}>
        <Text style={{ fontSize: 32 }}>🍗</Text>
      </Animated.View>
      <Animated.View style={[styles.cardBase, styles.cardBack, { transform: [{ rotateY: backInterpolate }], backgroundColor: colors.surface }]}>
        {getImage(card.imageKey) ? (
          <Image source={getImage(card.imageKey)!} style={styles.cardImg} />
        ) : (
          <Text style={{ fontSize: 24 }}>🦃</Text>
        )}
        {isMatched && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── 主遊戲畫面 ────────────────────────────────────
export default function FlipGameScreen({ navigation }: Props) {
  const { colors } = useApp();

  const PAIRS_COUNT = 6;
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  // ✅ Toast 陣列管理：允許多個訊息同時存在
  type ToastType = { id: string; msg: string };
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = useCallback((msg: string) => {
    const id = Date.now().toString() + Math.random().toString();
    // ✅ 將新通知塞在陣列最前面，這會自然將舊的通知往下推
    setToasts(prev => [{ id, msg }, ...prev]);
    
    // 2.5 秒後自動移除該通知
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);

  const startGame = () => {
    const shuffledRests = [...restaurants].sort(() => 0.5 - Math.random()).slice(0, PAIRS_COUNT);
    const deck = [...shuffledRests, ...shuffledRests]
      .sort(() => 0.5 - Math.random())
      .map((r, i) => ({ uid: `${r.id}-${i}`, restaurantId: r.id, name: r.name, imageKey: r.images[0] }));

    setCards(deck);
    setMatchedIds([]);
    setFlippedIndices([]);
    setTime(0);
    setGameOver(false);
    setShowPreview(true);

    setTimeout(() => {
      setShowPreview(false);
      setIsPlaying(true);
    }, 5000);
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && !gameOver) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  const handleCardPress = (index: number) => {
    if (showPreview || !isPlaying || flippedIndices.length >= 2 || 
        flippedIndices.includes(index) || matchedIds.includes(cards[index].restaurantId)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.restaurantId === secondCard.restaurantId) {
        setMatchedIds(prev => {
          const next = [...prev, firstCard.restaurantId];
          if (next.length === PAIRS_COUNT) {
            setIsPlaying(false);
            setGameOver(true);
            if (!bestTime || time < bestTime) setBestTime(time);
          }
          return next;
        });
        showToast(`🎉 答對了！是「${firstCard.name}」`);
        setFlippedIndices([]);
      } else {
        setTimeout(() => setFlippedIndices([]), 1000);
      }
    }
  };

  const playedRestaurants = restaurants.filter(r => matchedIds.includes(r.id));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Text style={{ fontSize: 22, color: colors.headerText }}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.headerText }]}>🃏 雞肉飯翻牌大考驗</Text>
      </View>

      {/* ✅ 頂部 Toast 容器 */}
      <View style={styles.toastContainer}>
        {toasts.map(toast => (
          <ToastMessage key={toast.id} msg={toast.msg} colors={colors} />
        ))}
      </View>

      <View style={[styles.statBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Text style={[styles.statTxt, { color: colors.text }]}>⏱️ 耗時: <Text style={{fontWeight:'bold'}}>{time}s</Text></Text>
        {showPreview && <Text style={{ color: colors.primary, fontWeight: 'bold' }}>👀 記憶時間...</Text>}
        <Text style={[styles.statTxt, { color: colors.textSecondary }]}>🏆 最佳: {bestTime ? `${bestTime}s` : '--'}</Text>
      </View>

      <View style={styles.board}>
        {cards.length === 0 && !gameOver ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 60, marginBottom: 16 }}>🧠</Text>
            <Text style={[styles.hint, { color: colors.text }]}>考驗你對嘉義雞肉飯的記憶力！</Text>
            <Text style={[styles.hintSub, { color: colors.textSecondary }]}>一開始會有 5 秒鐘可以記憶位置</Text>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: colors.primary }]} onPress={startGame}>
              <Text style={styles.startBtnTxt}>開始遊戲</Text>
            </TouchableOpacity>
          </View>
        ) : gameOver ? (
          <View style={styles.gameOverContainer}>
            <Text style={{ fontSize: 50 }}>🎊</Text>
            <Text style={[styles.gameOverTitle, { color: colors.accent }]}>過關！耗時 {time} 秒</Text>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: colors.primary, marginBottom: 16 }]} onPress={startGame}>
              <Text style={styles.startBtnTxt}>再玩一次</Text>
            </TouchableOpacity>
            
            <Text style={[styles.listTitle, { color: colors.text }]}>👇 這次認識的店家 👇</Text>
            <FlatList
              data={playedRestaurants}
              keyExtractor={r => r.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  // ✅ 修正了這裡的 params 傳遞方式
                  onPress={() => navigation.navigate('HomeStack', { screen: 'RestaurantInfo', params: { restaurantId: item.id } } as never)}>
                  {getImage(item.images[0]) && <Image source={getImage(item.images[0])!} style={styles.resultImg} />}
                  <View style={{ flex: 1, padding: 10 }}>
                    <Text style={[styles.resultName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.resultAddr, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <View style={styles.grid}>
            {cards.map((card, index) => {
              const isFlipped = showPreview || flippedIndices.includes(index) || matchedIds.includes(card.restaurantId);
              const isMatched = matchedIds.includes(card.restaurantId);
              return (
                <FlipCard
                  key={card.uid} card={card} isFlipped={isFlipped}
                  isMatched={isMatched} onPress={() => handleCardPress(index)} colors={colors}
                />
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1 },
  appBar:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52, zIndex: 10 },
  iconBtn:   { padding: 8 },
  title:     { flex: 1, fontSize: 18, fontWeight: 'bold', marginLeft: 4 },
  
  // ✅ 更新 Toast 容器樣式
  toastContainer: { position: 'absolute', top: 65, left: 0, right: 0, alignItems: 'center', zIndex: 100, gap: 8 },
  toast: { width: '80%', padding: 12, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 10 },
  toastTxt:  { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  statBar:   { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  statTxt:   { fontSize: 16 },
  
  board:     { flex: 1, padding: 16 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint:      { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  hintSub:   { fontSize: 14, marginBottom: 24 },
  startBtn:  { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 25 },
  startBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  grid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  cardWrap:  { width: CARD_SIZE, height: CARD_SIZE * 1.2, margin: CARD_MARGIN },
  cardBase:  { position: 'absolute', width: '100%', height: '100%', borderRadius: 12, backfaceVisibility: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' },
  cardFront: { },
  cardBack:  { overflow: 'hidden' },
  cardImg:   { width: '100%', height: '100%', resizeMode: 'cover' },

  gameOverContainer: { flex: 1, alignItems: 'center', paddingTop: 20 },
  gameOverTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  listTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  resultCard: { flexDirection: 'row', width: width - 40, marginBottom: 10, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  resultImg: { width: 60, height: 60 },
  resultName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  resultAddr: { fontSize: 12 },
});