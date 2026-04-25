import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, Easing, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { restaurants, Restaurant } from '../data/restaurantData';
import { getImage } from '../data/imageMap';
import StarRating from '../components/StarRating';
import { isOpenNow } from '../utils/timeUtils';

type Props = DrawerScreenProps<DrawerParamList, 'Random'>;

export default function RandomPickerScreen({ navigation }: Props) {
  const { colors } = useApp();
  const [picked,   setPicked]   = useState<Restaurant | null>(null);
  const [spinning, setSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const openNow = restaurants.filter(r => isOpenNow(r.time));

  const spin = () => {
    if (spinning || openNow.length === 0) return;
    setSpinning(true);
    setPicked(null);
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setPicked(openNow[Math.floor(Math.random() * openNow.length)]);
      setSpinning(false);
    });
  };

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'],
  });

  const goToDetail = () => {
    if (!picked) return;
    navigation.navigate('HomeStack',
      { screen: 'RestaurantInfo', params: { preselect: picked.id } } as never);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Text style={{ fontSize: 22, color: colors.headerText }}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.headerText }]}>🎲 隨機選店</Text>
      </View>

      <View style={[styles.statBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Text style={[styles.statTxt, { color: colors.textSecondary }]}>
          目前有{' '}
          <Text style={[styles.statNum, { color: colors.primary }]}>{openNow.length}</Text>
          {' '}間店正在營業中
        </Text>
        <Text style={{ color: colors.textLight, fontSize: 12 }}>（共 {restaurants.length} 間）</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.body} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text style={[styles.dice, { transform: [{ rotate }] }]}>
          🎲
        </Animated.Text>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {openNow.length > 0
            ? '按下按鈕，讓命運決定你的晚餐！'
            : '目前沒有店家營業中，稍後再試試吧 😴'}
        </Text>

        <TouchableOpacity
          style={[styles.spinBtn, { backgroundColor: openNow.length > 0 ? colors.primary : colors.border },
            spinning && { opacity: 0.7 }]}
          onPress={spin}
          disabled={spinning || openNow.length === 0}>
          <Text style={styles.spinBtnTxt}>
            {spinning ? '抽籤中...' : '🎰 隨機選一間！'}
          </Text>
        </TouchableOpacity>

        {picked && !spinning && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <View style={styles.resultHeader}>
              <Text style={{ fontSize: 28 }}>🎉</Text>
              <Text style={[styles.resultTitle, { color: colors.text }]}>今天就去這間！</Text>
            </View>
            {getImage(picked.images[0]) && (
              <Image source={getImage(picked.images[0])!} style={styles.resultImg} resizeMode="cover" />
            )}
            <View style={{ padding: 16, gap: 8 }}>
              <Text style={[styles.resultName, { color: colors.text }]}>{picked.name}</Text>
              <StarRating rating={picked.rating} size={16} />
              <View style={[styles.openBadge, { backgroundColor: colors.openBadgeBg }]}>
                <Text style={{ color: colors.openBadge, fontWeight: 'bold', fontSize: 13 }}>
                  🟢 現在營業中
                </Text>
              </View>
              <Text style={[styles.resultAddr, { color: colors.textSecondary }]}>
                📍 {picked.address}
              </Text>
              <Text style={[styles.resultTime, { color: colors.textSecondary }]}>
                🕐 {picked.time}
              </Text>
              <Text style={[styles.resultDesc, { color: colors.text }]} numberOfLines={2}>
                {picked.shortDesc}
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 1 }]}
                  onPress={goToDetail}>
                  <Text style={styles.actionBtnTxt}>查看詳細資訊 →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.card,
                    borderWidth: 1, borderColor: colors.primary, width: 48 }]}
                  onPress={spin}>
                  <Text style={{ fontSize: 20 }}>🔀</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  appBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52 },
  iconBtn:     { padding: 8 },
  title:       { flex: 1, fontSize: 18, fontWeight: 'bold', marginLeft: 4 },
  statBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  statTxt:     { fontSize: 14 },
  statNum:     { fontSize: 18, fontWeight: 'bold' },
  body:        { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 10, gap: 20 },
  dice:        { fontSize: 80 },
  hint:        { fontSize: 15, textAlign: 'center' },
  spinBtn:     { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  spinBtnTxt:  { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  resultCard:  { width: '100%', borderRadius: 20, overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  resultTitle:  { fontSize: 16, fontWeight: 'bold' },
  resultImg:    { width: '100%', height: 180 },
  resultName:   { fontSize: 20, fontWeight: 'bold' },
  openBadge:    { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  resultAddr:   { fontSize: 13, lineHeight: 18 },
  resultTime:   { fontSize: 13 },
  resultDesc:   { fontSize: 14, lineHeight: 20 },
  actionRow:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn:    { borderRadius: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  actionBtnTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
