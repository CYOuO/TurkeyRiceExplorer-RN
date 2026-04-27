import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Modal, Dimensions, Image, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { restaurants, Restaurant } from '../data/restaurantData';
import { getImage } from '../data/imageMap';
import StarRating from '../components/StarRating';
import { isOpenNow, isOpenOnDay, DAY_LABELS } from '../utils/timeUtils';
import { ColorScheme } from '../theme/colors';

const { width } = Dimensions.get('window');
type Props = StackScreenProps<HomeStackParamList, 'RestaurantInfo'>;

// ─── 🎨 標籤顏色產生器 ───
const TAG_PALETTE = [
  '#E57373', '#F06292', '#BA68C8', '#7986CB', '#4DD0E1', 
  '#4DB6AC', '#81C784', '#F5A623', '#FF8A65', '#A1887F'
];
function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
}

// ─── 營業狀態 Badge ───
function OpenBadge({ time, colors }: { time: string; colors: ColorScheme }) {
  const open = isOpenNow(time);
  return (
    <View style={[badge.wrap, { backgroundColor: open ? colors.openBadgeBg : colors.closedBadgeBg }]}> 
      <View style={[badge.dot, { backgroundColor: open ? colors.openBadge : colors.closedBadge }]} />
      <Text style={[badge.text, { color: open ? colors.openBadge : colors.closedBadge }]}>
        {open ? '營業中' : '已打烊'}
      </Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: 'bold' },
});

// ─── 餐廳卡片 ───
function RestaurantCard({
  restaurant, onPress, colors,
}: { restaurant: Restaurant; onPress: () => void; colors: ColorScheme }) {
  const src = getImage(restaurant.images[0]);
  return (
    <TouchableOpacity style={[cs.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]} onPress={onPress} activeOpacity={0.88}>
      <View style={cs.imgWrap}>
        {src ? <Image source={src} style={cs.img} resizeMode="cover" /> : (
          <View style={[cs.img, cs.placeholder, { backgroundColor: colors.primaryLight }]}>
            <Text style={{ fontSize: 28 }}>🍗</Text>
          </View>
        )}
        <View style={cs.ratingBadge}>
          <Text style={cs.ratingBadgeTxt}>⭐ {restaurant.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={cs.body}>
        <Text style={[cs.name, { color: colors.text }]} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={[cs.desc, { color: colors.textSecondary }]} numberOfLines={2}>{restaurant.shortDesc}</Text>
        <View style={cs.footer}>
          <OpenBadge time={restaurant.time} colors={colors} />
          <Text style={[cs.price, { color: colors.accent }]}>{restaurant.price}</Text>
        </View>
        
        <View style={cs.tagRow}>
          {restaurant.tags.slice(0, 2).map(t => {
            const tColor = getTagColor(t);
            return (
              <View key={t} style={[cs.tagChip, { 
                backgroundColor: tColor + '15',
                borderColor: tColor + '40',
                borderWidth: 1 
              }]}>
                <Text style={[cs.tagChipTxt, { color: tColor }]}>{t}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
}
const cs = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, overflow: 'hidden', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
  imgWrap: { position: 'relative', height: 130 },
  img: { width: '100%', height: '100%' },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  ratingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  ratingBadgeTxt: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  body: { padding: 10 },
  name: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  desc: { fontSize: 11, lineHeight: 16, marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 11, fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tagChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagChipTxt: { fontSize: 10, fontWeight: '600' },
});

// ─── 圖片畫廊 ───
function ImageGallery({ images, colors, onAllImages }: { images: string[]; colors: ColorScheme; onAllImages: () => void }) {
  const [current, setCurrent] = useState(0);
  return (
    <View style={gs.wrap}>
      <FlatList
        data={images} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={e => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={16} keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => {
          const src = getImage(item);
          return src ? <Image source={src} style={[gs.img, { width }]} resizeMode="cover" /> : (
            <View style={[gs.img, { width, backgroundColor: colors.primaryLight }, gs.placeholder]}><Text style={{ fontSize: 50 }}>🍗</Text></View>
          );
        }}
      />
      <TouchableOpacity style={gs.allBtn} onPress={onAllImages}><Text style={gs.allBtnTxt}>⊞ 所有圖片</Text></TouchableOpacity>
      <View style={gs.counter}><Text style={gs.counterTxt}>{current + 1} / {images.length}</Text></View>
      <View style={gs.dots}>
        {images.map((_, i) => <View key={i} style={[gs.dot, i === current ? [gs.dotActive, { backgroundColor: colors.primary }] : gs.dotInactive]} />)}
      </View>
    </View>
  );
}
const gs = StyleSheet.create({
  wrap: { position: 'relative', height: 260 }, img: { height: 260 }, placeholder: { justifyContent: 'center', alignItems: 'center' },
  allBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  allBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  counter: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  counterTxt: { color: '#FFF', fontSize: 12 },
  dots: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { height: 7, borderRadius: 4 }, dotActive: { width: 18 }, dotInactive: { width: 7, backgroundColor: 'rgba(255,255,255,0.5)' },
});

// ─── 主畫面 ────────────────────────────────────────────────
export default function RestaurantInfoScreen({ route, navigation }: Props) {
  const { colors, toggleFavorite, isFavorite } = useApp();

  const [search, setSearch]             = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [filterDay, setFilterDay]       = useState<number | null>(null);
  const [filterFavorite, setFilterFavorite] = useState(false); //我的收藏篩選
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortByRating, setSortByRating] = useState(false);
  const [selected, setSelected]         = useState<Restaurant | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const ALL_TAGS = useMemo(() => Array.from(new Set(restaurants.flatMap(r => r.tags))), []);// 所有存在的標籤列表

  // 判斷是否有任何篩選正在進行 (包含搜尋、星等、收藏、營業狀態)
  const isFilterActive = filterOpen || filterDay !== null || filterFavorite || selectedTags.length > 0 || sortByRating || appliedSearch.length > 0;

  // 清除所有篩選條件與搜尋
  const clearAllFilters = () => {
    setFilterOpen(false);
    setFilterDay(null);
    setFilterFavorite(false);
    setSelectedTags([]);
    setSortByRating(false);
    setAppliedSearch('');
    setSearch('');
    setSelected(null);
  };

  useEffect(() => {// 根據傳入的餐廳 ID 或預選 ID 來設定初始選擇的餐廳，這樣從其他頁面點擊進來時就能直接看到該餐廳的詳細資訊
    const targetId = route.params?.restaurantId || (route.params as any)?.preselect;
    if (targetId) {
      const target = restaurants.find(r => r.id === targetId);
      if (target) setSelected(target);
    }
  }, [route.params]);

  const filtered = useMemo(() => {// 根據搜尋、營業狀態、營業日、收藏狀態、標籤和排序條件過濾餐廳列表
    let result = restaurants.filter(r => {
      if (appliedSearch && !r.name.includes(appliedSearch) && !r.address.includes(appliedSearch)) 
        return false;
      if (filterOpen && !isOpenNow(r.time)) return false;
      if (filterDay !== null && !isOpenOnDay(r.time, filterDay)) return false;
      if (filterFavorite && !isFavorite(r.id)) return false;
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => r.tags.includes(tag));
        if (!hasAllTags) return false;
      }
      return true;
    });

    if (sortByRating) {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [appliedSearch, filterOpen, filterDay, selectedTags, sortByRating, filterFavorite, isFavorite]);

  const handleSearch = () => { setAppliedSearch(search.trim()); setSelected(null); };// 將搜尋字串套用到過濾器，並清除目前選擇的餐廳以顯示搜尋結果列表
  const clearSearch  = () => { setSearch(''); setAppliedSearch(''); setSelected(null); };

  const renderDropdownModal = () => (// 顯示符合搜尋條件的餐廳清單，讓使用者選擇
    <Modal visible={dropdownVisible} transparent animationType="slide" onRequestClose={() => setDropdownVisible(false)}>
      <TouchableOpacity style={ms.overlay} onPress={() => setDropdownVisible(false)} activeOpacity={1}>
        <View style={[ms.sheet, { backgroundColor: colors.surface }]}>
          <View style={[ms.handle, { backgroundColor: colors.border }]} />
          <Text style={[ms.title, { color: colors.text }]}>選擇店家（{filtered.length} 間）</Text>
          <FlatList
            data={filtered} keyExtractor={r => r.id} style={{ maxHeight: 420 }}
            renderItem={({ item }) => {
              const src = getImage(item.images[0]);
              const open = isOpenNow(item.time);
              return (
                <TouchableOpacity
                  style={[ms.item, { borderBottomColor: colors.divider }, selected?.id === item.id && { backgroundColor: colors.primaryLight }]}
                  onPress={() => { setSelected(item); setDropdownVisible(false); }}>
                  {src ? <Image source={src} style={ms.thumb} /> : <View style={[ms.thumb, { backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' }]}><Text>🍗</Text></View>}
                  <View style={{ flex: 1 }}>
                    <Text style={[ms.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[ms.itemAddr, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <StarRating rating={item.rating} size={12} />
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: open ? colors.openBadgeBg : colors.closedBadgeBg }}>
                        <Text style={{ fontSize: 10, color: open ? colors.openBadge : colors.closedBadge }}>{open ? '營業中' : '已打烊'}</Text>
                      </View>
                    </View>
                  </View>
                  {selected?.id === item.id && <Text style={{ color: colors.primary, fontSize: 18 }}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderDetail = () => {
    if (!selected) return null;
    const fav = isFavorite(selected.id);
    const infoRows = [
      { icon: '🕐', label: '營業時間', value: selected.time },
      { icon: '📍', label: '地址',     value: selected.address },
      { icon: '📞', label: '電話',     value: selected.phone },
      { icon: '💰', label: '消費',     value: selected.price },
    ];
    return (
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <ImageGallery images={selected.images} colors={colors} onAllImages={() => navigation.navigate('ImageOverview', { restaurant: selected }as any)} />
        <View style={[ds.pad, { backgroundColor: colors.background }]}>
          <View style={ds.header}>
            <View style={{ flex: 1 }}>
              <Text style={[ds.name, { color: colors.text }]}>{selected.name}</Text>
              <StarRating rating={selected.rating} size={16} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <OpenBadge time={selected.time} colors={colors} />
              <TouchableOpacity onPress={() => toggleFavorite(selected.id)}><Text style={{ fontSize: 26 }}>{fav ? '❤️' : '🤍'}</Text></TouchableOpacity>
            </View>
          </View>
          <View style={[ds.divider, { backgroundColor: colors.divider }]} />
          {infoRows.map(row => (
            <View key={row.label} style={ds.infoRow}>
              <Text style={ds.infoIcon}>{row.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[ds.infoLabel, { color: colors.textLight }]}>{row.label}</Text>
                <Text style={[ds.infoValue, { color: colors.text }]}>{row.value}</Text>
              </View>
            </View>
          ))}
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {selected.tags.map(t => {
              const tColor = getTagColor(t);
              return (
                <View key={t} style={[cs.tagChip, { 
                  backgroundColor: tColor + '15',
                  borderColor: tColor + '40',
                  borderWidth: 1 
                }]}>
                  <Text style={[cs.tagChipTxt, { color: tColor }]}>#{t}</Text>
                </View>
              );
            })}
          </View>
          
          <View style={[ds.divider, { backgroundColor: colors.divider }]} />
          <Text style={[ds.descLabel, { color: colors.textLight }]}>店家介紹</Text>
          <Text style={[ds.desc, { color: colors.text }]}>{selected.description}</Text>
          <View style={ds.actionRow}>
            <TouchableOpacity style={[ds.actionBtn, { backgroundColor: colors.primary, flex: 1 }]} onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`)}>
              <Text style={ds.actionBtnTxt}>🗺️ Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ds.actionBtn, { backgroundColor: colors.accent, width: 56 }]} onPress={() => Linking.openURL(`tel:${selected.phone}`)}>
              <Text style={ds.actionBtnTxt}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => (navigation as any).openDrawer()} style={styles.iconBtn}><Text style={{ fontSize: 22, color: colors.headerText }}>☰</Text></TouchableOpacity>
        
        {/* 原本的 Text 上加上 onPress 恢復清單 */}
        <Text style={[styles.appBarTitle, { color: colors.headerText }]} onPress={() => setSelected(null)}>探索店家</Text>
        
        {/* 右側清除按鈕：只有在有套用篩選時才出現 */}
        {isFilterActive && (
          <TouchableOpacity onPress={clearAllFilters} style={styles.iconBtn}><Text style={{ color: colors.headerText, fontSize: 13, fontWeight: 'bold' }}>全部</Text></TouchableOpacity>
        )}
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.header }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg }]}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} onSubmitEditing={handleSearch} placeholder="搜尋店名或地址..." placeholderTextColor={colors.textLight} style={[styles.searchInput, { color: colors.text }]} />
          {search.length > 0 && <TouchableOpacity onPress={clearSearch}><Text style={{ color: colors.textLight, fontSize: 16 }}>✕</Text></TouchableOpacity>}
        </View>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.accent }]} onPress={handleSearch}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>搜尋</Text></TouchableOpacity>
      </View>

      {/* 第一層篩選列：只放週一 ~ 週日 */}
      <View style={[styles.filterRow, { backgroundColor: colors.surface }]}>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={DAY_LABELS.map((l, i) => ({ key: `day${i}`, label: `週${l}`, dayIdx: i }))}
          keyExtractor={item => item.key}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 8 }}
          renderItem={({ item }) => {
            const isActive = filterDay === item.dayIdx;
            return (
              <TouchableOpacity
                style={[styles.chip, { borderColor: colors.border }, isActive && { backgroundColor: colors.secondary, borderColor: colors.secondary }]}
                onPress={() => {
                  setFilterDay(filterDay === item.dayIdx ? null : item.dayIdx);
                  setSelected(null);
                }}>
                <Text style={[styles.chipTxt, { color: isActive ? colors.accent : colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 第二層篩選列：營業中 -> 高分優先 -> 我的收藏 -> 標籤 */}
      <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10, gap: 8 }}>
          
          <TouchableOpacity
            style={[styles.chip, { borderColor: colors.border }, filterOpen && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => { setFilterOpen(v => !v); setSelected(null); }}>
            <Text style={[styles.chipTxt, { color: filterOpen ? '#FFF' : colors.text }]}>🟢 營業中</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, { borderColor: sortByRating ? colors.accent : colors.accent + '40', backgroundColor: sortByRating ? colors.accent : colors.accent + '15' }]}
            onPress={() => { setSortByRating(v => !v); setSelected(null); }}>
            <Text style={[styles.chipTxt, { color: sortByRating ? '#FFF' : colors.accent, fontWeight: 'bold' }]}>⭐ 高分優先</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, { borderColor: colors.border }, filterFavorite && { backgroundColor: '#EF5350', borderColor: '#EF5350' }]}
            onPress={() => { setFilterFavorite(v => !v); setSelected(null); }}>
            <Text style={[styles.chipTxt, { color: filterFavorite ? '#FFF' : colors.text }]}>❤️ 我的收藏</Text>
          </TouchableOpacity>
          
          {/* 接著 map 出所有的標籤 */}
          {ALL_TAGS.map(tag => {
            const isActive = selectedTags.includes(tag);
            const tColor = getTagColor(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.chip, { borderColor: isActive ? tColor : tColor + '40', backgroundColor: isActive ? tColor : tColor + '15' }]}
                onPress={() => {
                  setSelectedTags(prev => isActive ? prev.filter(t => t !== tag) : [...prev, tag]);
                  setSelected(null);
                }}>
                <Text style={[styles.chipTxt, { color: isActive ? '#FFF' : tColor }]}>#{tag}</Text>
              </TouchableOpacity>
            );
          })}

        </ScrollView>
      </View>

      <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setDropdownVisible(true)}>
        <Text style={{ fontSize: 16 }}>🍗</Text>
        <Text style={[styles.dropdownTxt, { color: selected ? colors.text : colors.textLight }]} numberOfLines={1}>
          {selected ? selected.name : `請選擇店家（共 ${filtered.length} 間）`}
        </Text>
        <Text style={{ color: colors.primary, fontSize: 18 }}>▾</Text>
      </TouchableOpacity>

      {selected ? renderDetail() : (
        <FlatList
          data={filtered} keyExtractor={r => r.id} numColumns={2}
          contentContainerStyle={{ padding: 12, paddingTop: 4, gap: 10 }} columnWrapperStyle={{ gap: 10 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>找不到符合的店家</Text>
            </View>
          }
          renderItem={({ item }) => <RestaurantCard restaurant={item} colors={colors} onPress={() => setSelected(item)} />}
        />
      )}

      {renderDropdownModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({// --- 主畫面基本結構 ---
  root:        { flex: 1 },
  appBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52 },
  iconBtn:     { padding: 8 },
  appBarTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', marginLeft: 4 },
  searchRow:   { flexDirection: 'row', padding: 10, gap: 8 },
  searchBox:   { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, fontSize: 15, height: 42 },
  searchBtn:   { borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', height: 42 },
  filterRow:   { }, 
  chip:        { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipTxt:     { fontSize: 13, fontWeight: '500' },
  dropdown: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 12, marginVertical: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  dropdownTxt: { flex: 1, fontSize: 15 },
});

const ms = StyleSheet.create({// --- 圖片選擇下拉清單的樣式 ---
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:   { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12, paddingBottom: 30, maxHeight: '80%' },
  handle:  { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  title:   { fontSize: 17, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 8 },
  item:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb:   { width: 52, height: 52, borderRadius: 8 },
  itemName:{ fontSize: 15, fontWeight: '600', marginBottom: 2 },
  itemAddr:{ fontSize: 12 },
});

const ds = StyleSheet.create({// --- 店家詳細資訊頁的樣式 ---
  pad:       { padding: 20 },
  header:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  name:      { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  divider:   { height: 1, marginVertical: 12 },
  infoRow:   { flexDirection: 'row', gap: 10, marginBottom: 10 },
  infoIcon:  { fontSize: 18, marginTop: 2 },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 15, lineHeight: 20 },
  descLabel: { fontSize: 12, marginBottom: 6 },
  desc:      { fontSize: 15, lineHeight: 24 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  actionBtnTxt:{ color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});