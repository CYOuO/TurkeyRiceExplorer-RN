import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Modal, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { getImage } from '../data/imageMap';
import { ColorScheme } from '../theme/colors';

const { width, height } = Dimensions.get('window');
type Props = StackScreenProps<HomeStackParamList, 'ImageOverview'>;

// ─── 全螢幕放大檢視器 ──────────────────────────────────────
function FullScreenViewer({
  images, initialIndex, restaurantName, onClose,
}: {
  images: string[];
  initialIndex: number;
  restaurantName: string;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={fs.root}>
        <FlatList
          data={images}
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onScroll={e => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
          scrollEventThrottle={16}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => {
            const src = getImage(item);
            return src
              ? <Image source={src} style={{ width, height }} resizeMode="contain" />
              : <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 60 }}>🍗</Text>
                </View>;
          }}
        />
        <View style={fs.topBar}>
          <TouchableOpacity onPress={onClose} style={fs.closeBtn}>
            <Text style={fs.closeTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={fs.title} numberOfLines={1}>{restaurantName}</Text>
          <Text style={fs.counter}>{current + 1} / {images.length}</Text>
        </View>
        <View style={fs.dots}>
          {images.map((_, i) => (
            <View key={i} style={[fs.dot,
              i === current ? fs.dotActive : fs.dotInactive]} />
          ))}
        </View>
      </View>
    </Modal>
  );
}

// ─── 長按資訊 Sheet ────────────────────────────────────────
function ImageInfoSheet({
  visible, imageKey, index, total,
  restaurantName, address, time, colors, onClose,
}: {
  visible: boolean;
  imageKey: string;
  index: number;
  total: number;
  restaurantName: string;
  address: string;
  time: string;
  colors: ColorScheme;
  onClose: () => void;
}) {
  if (!visible) return null;
  const src = getImage(imageKey);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={sh.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[sh.sheet, { backgroundColor: colors.surface }]}>
          <View style={[sh.handle, { backgroundColor: colors.border }]} />
          <View style={sh.row}>
            {src && <Image source={src} style={sh.thumb} />}
            <View style={{ flex: 1 }}>
              <Text style={[sh.imgTitle, { color: colors.text }]}>
                圖片 {index + 1} / {total}
              </Text>
              <Text style={[sh.imgSub, { color: colors.accent }]}>{restaurantName}</Text>
            </View>
          </View>
          <View style={[sh.divider, { backgroundColor: colors.divider }]} />
          {[
            { icon: '🏪', label: '店家', value: restaurantName },
            { icon: '📍', label: '地址', value: address },
            { icon: '🕐', label: '時間', value: time },
          ].map(row => (
            <View key={row.label} style={sh.infoRow}>
              <Text style={sh.icon}>{row.icon}</Text>
              <Text style={[sh.label, { color: colors.textLight }]}>{row.label}</Text>
              <Text style={[sh.value, { color: colors.text }]} numberOfLines={2}>{row.value}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── 主畫面 ────────────────────────────────────────────────
export default function ImageOverviewScreen({ route, navigation }: Props) {
  const { colors } = useApp();
  const { restaurant } = route.params;

  const [columns, setColumns]     = useState<2 | 3>(3);
  const [fsIndex, setFsIndex]     = useState<number | null>(null);
  const [sheetIdx, setSheetIdx]   = useState<number | null>(null);

  const images = restaurant.images;
  const cellSize = (width - 6 - (columns - 1) * 3) / columns;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {/* AppBar */}
      <View style={[styles.appBar, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Text style={{ fontSize: 22, color: colors.headerText }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.headerText }]} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <View style={styles.colToggle}>
          {([2, 3] as const).map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.colBtn, columns === n && { backgroundColor: 'rgba(255,255,255,0.25)' }]}
              onPress={() => setColumns(n)}>
              <Text style={{ color: colors.headerText, fontSize: 13,
                fontWeight: columns === n ? 'bold' : 'normal' }}>
                {n === 2 ? '⊟' : '⊞'} {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 餐廳資訊橫條 */}
      <View style={[styles.infoBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        {getImage(images[0]) && (
          <Image source={getImage(images[0])!} style={styles.infoThumb} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoAddr, { color: colors.text }]} numberOfLines={1}>
            {restaurant.address}
          </Text>
          <Text style={[styles.infoTime, { color: colors.textSecondary }]} numberOfLines={1}>
            {restaurant.time}
          </Text>
        </View>
        <Text style={[styles.imgCount, { color: colors.primary }]}>{images.length} 張</Text>
      </View>

      {/* 圖片格子 */}
      <FlatList
        key={columns}
        data={images}
        numColumns={columns}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 3 }}
        columnWrapperStyle={columns > 1 ? { gap: 3 } : undefined}
        renderItem={({ item, index }) => {
          const src = getImage(item);
          return (
            <TouchableOpacity
              style={{ width: cellSize, height: cellSize, marginBottom: 3 }}
              onPress={() => setFsIndex(index)}
              onLongPress={() => setSheetIdx(index)}
              activeOpacity={0.9}>
              {src
                ? <Image source={src} style={{ width: cellSize, height: cellSize, borderRadius: 3 }} />
                : <View style={{ width: cellSize, height: cellSize, borderRadius: 3,
                    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 30 }}>🍗</Text>
                  </View>
              }
              <View style={styles.indexBadge}>
                <Text style={styles.indexTxt}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {fsIndex !== null && (
        <FullScreenViewer
          images={images} initialIndex={fsIndex}
          restaurantName={restaurant.name}
          onClose={() => setFsIndex(null)}
        />
      )}

      {sheetIdx !== null && (
        <ImageInfoSheet
          visible
          imageKey={images[sheetIdx]}
          index={sheetIdx}
          total={images.length}
          restaurantName={restaurant.name}
          address={restaurant.address}
          time={restaurant.time}
          colors={colors}
          onClose={() => setSheetIdx(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  appBar:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 52 },
  iconBtn:    { padding: 8 },
  title:      { flex: 1, fontSize: 16, fontWeight: 'bold', marginLeft: 4 },
  colToggle:  { flexDirection: 'row', gap: 4 },
  colBtn:     { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  infoBar:    { flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  infoThumb:  { width: 44, height: 44, borderRadius: 8 },
  infoAddr:   { fontSize: 13, fontWeight: '500' },
  infoTime:   { fontSize: 12, marginTop: 2 },
  imgCount:   { fontSize: 13, fontWeight: 'bold' },
  indexBadge: { position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2 },
  indexTxt:   { color: '#FFF', fontSize: 10 },
});

const fs = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeBtn: { padding: 8 },
  closeTxt: { color: '#FFF', fontSize: 20 },
  title:    { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  counter:  { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  dots:     { position: 'absolute', bottom: 40, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot:      { height: 6, borderRadius: 3 },
  dotActive:   { width: 20, backgroundColor: '#FFF' },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.4)' },
});

const sh = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:    { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  handle:   { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  row:      { flexDirection: 'row', gap: 14, marginBottom: 16 },
  thumb:    { width: 72, height: 72, borderRadius: 10 },
  imgTitle: { fontSize: 20, fontWeight: 'bold' },
  imgSub:   { fontSize: 15, fontWeight: '600', marginTop: 4 },
  divider:  { height: 1, marginBottom: 12 },
  infoRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  icon:     { fontSize: 14, marginTop: 2 },
  label:    { fontSize: 12, width: 36, marginTop: 2 },
  value:    { flex: 1, fontSize: 13, lineHeight: 18 },
});
