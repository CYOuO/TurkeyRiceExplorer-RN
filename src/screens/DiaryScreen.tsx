// 日記頁面：搜尋、年月篩選、店家篩選
import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Image, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { DiaryEntry } from '../context/AppContext';
import { restaurants } from '../data/restaurantData';
import { ColorScheme } from '../theme/colors';

import RNFS from 'react-native-fs';
let launchImageLibrary: ((options: any) => Promise<any>) | null = null;
try {
  launchImageLibrary = require('react-native-image-picker').launchImageLibrary;
} catch { /* 未安裝時略過 */ }

type Props = DrawerScreenProps<DrawerParamList, 'Diary'>;

// ─── 新增/編輯日記 Modal ────────────────────────────────────
function AddDiaryModal({
  visible, onClose, onSave, initialData, colors,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void;
  colors: ColorScheme;
  initialData?: DiaryEntry | null;
}) {
  const [restaurantId, setRestaurantId] = useState('');
  const [rating,       setRating]       = useState(5);
  const [note,         setNote]         = useState('');
  const [photoUri,     setPhotoUri]     = useState<string | null>(null);
  const [showList,     setShowList]     = useState(false);
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    if (initialData) {
      setRestaurantId(initialData.restaurantId);
      setRating(initialData.rating);
      setNote(initialData.note);
      setPhotoUri(initialData.photoUri);
    } else {
      setRestaurantId(''); setRating(5); setNote(''); setPhotoUri(null); setSearch('');
    }
  }, [initialData, visible]);

  const selectedRest  = restaurants.find(r => r.id === restaurantId);
  const filteredRests = restaurants.filter(r => r.name.includes(search) || r.address.includes(search));

  const pickPhoto = async () => {
    if (!launchImageLibrary) { Alert.alert('提示', '需要安裝 react-native-image-picker'); return; }
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (!result.didCancel && result.assets?.[0]) {
        const tempUri = result.assets[0].uri as string;
        const fileName = tempUri.split('/').pop() || `photo_${Date.now()}.jpg`;
        const permanentPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.copyFile(tempUri, permanentPath);
        setPhotoUri(`file://${permanentPath}`);
      }
    } catch { Alert.alert('錯誤', '無法儲存圖片'); }
  };

  const handleSave = () => {
    if (!restaurantId) { Alert.alert('提示', '請先選擇店家'); return; }
    onSave({
      restaurantId,
      restaurantName: selectedRest ? selectedRest.name : initialData!.restaurantName,
      rating, note: note.trim(), photoUri,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[m.root, { backgroundColor: colors.background }]}>
        <View style={[m.header, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={onClose} style={m.headerBtn}>
            <Text style={{ color: colors.headerText, fontSize: 15 }}>取消</Text>
          </TouchableOpacity>
          <Text style={[m.headerTitle, { color: colors.headerText }]}>
            {initialData ? '✏️ 編輯日記' : '📔 新增日記'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={m.headerBtn}>
            <Text style={{ color: colors.headerText, fontSize: 15, fontWeight: 'bold' }}>儲存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <View>
            <Text style={[m.label, { color: colors.textLight }]}>店家</Text>
            <TouchableOpacity style={[m.picker, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowList(true)}>
              <Text style={{ fontSize: 16 }}>🍗</Text>
              <Text style={[m.pickerTxt, { color: restaurantId ? colors.text : colors.textLight }]}>
                {selectedRest ? selectedRest.name : (initialData?.restaurantName || '請選擇店家...')}
              </Text>
              <Text style={{ color: colors.primary }}>▾</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={[m.label, { color: colors.textLight }]}>照片</Text>
            <TouchableOpacity style={[m.photoArea, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={pickPhoto}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={m.photoImg} />
                : <><Text style={{ fontSize: 36 }}>📷</Text><Text style={[m.photoHint, { color: colors.textLight }]}>點擊上傳照片</Text></>
              }
            </TouchableOpacity>
          </View>

          <View>
            <Text style={[m.label, { color: colors.textLight }]}>我的評分 {rating} ⭐</Text>
            <View style={m.starRow}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text style={[m.star, { color: n <= rating ? colors.starFilled : colors.starEmpty }]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={[m.label, { color: colors.textLight }]}>心得</Text>
            <TextInput
              value={note} onChangeText={setNote}
              placeholder="寫下你的用餐心得..." placeholderTextColor={colors.textLight}
              style={[m.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              multiline numberOfLines={5} textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <Modal visible={showList} transparent animationType="slide" onRequestClose={() => setShowList(false)}>
          <View style={l.overlay}>
            <View style={[l.sheet, { backgroundColor: colors.surface }]}>
              <View style={[l.searchRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={{ fontSize: 16 }}>🔍</Text>
                <TextInput value={search} onChangeText={setSearch} placeholder="搜尋店名..." placeholderTextColor={colors.textLight} style={[l.searchInput, { color: colors.text }]} />
              </View>
              <FlatList
                data={filteredRests} keyExtractor={r => r.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={[l.item, { borderBottomColor: colors.divider }, restaurantId === item.id && { backgroundColor: colors.primaryLight }]} onPress={() => { setRestaurantId(item.id); setShowList(false); }}>
                    <Text style={[l.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[l.addr, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={[l.closeBtn, { backgroundColor: colors.primary }]} onPress={() => setShowList(false)}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>關閉</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

// ─── 日記卡片 ──────────────────────────────────────────────
function DiaryCard({ entry, colors, onDelete, onEdit }: {
  entry: DiaryEntry; colors: ColorScheme; onDelete: () => void; onEdit: () => void;
}) {
  const date    = new Date(entry.createdAt);
  const dateStr = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
  return (
    <View style={[d.root, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      {entry.photoUri && <Image source={{ uri: entry.photoUri }} style={d.photo} />}
      <View style={d.body}>
        <View style={d.topRow}>
          <Text style={[d.name, { color: colors.text }]}>{entry.restaurantName}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={onEdit}><Text style={{ fontSize: 17 }}>✏️</Text></TouchableOpacity>
            <TouchableOpacity onPress={onDelete}><Text style={{ fontSize: 17, color: colors.textLight }}>🗑️</Text></TouchableOpacity>
          </View>
        </View>
        <View style={d.ratingRow}>
          {Array(5).fill(0).map((_, i) => (
            <Text key={i} style={{ color: i < entry.rating ? colors.starFilled : colors.starEmpty }}>★</Text>
          ))}
          <Text style={[d.date, { color: colors.textLight }]}>{dateStr}</Text>
        </View>
        {Boolean(entry.note) && <Text style={[d.note, { color: colors.textSecondary }]}>{entry.note}</Text>}
      </View>
    </View>
  );
}

// ─── 主畫面 ────────────────────────────────────────────────
export default function DiaryScreen({ navigation }: Props) {
  const { colors, diary, addDiaryEntry, deleteDiaryEntry, updateDiaryEntry } = useApp();

  const [modalVisible, setModalVisible]   = useState(false);
  const [currentEntry, setCurrentEntry]   = useState<DiaryEntry | null>(null);
  const [searchText,   setSearchText]     = useState('');
  const [filterYear,   setFilterYear]     = useState<number | null>(null);
  const [filterMonth,  setFilterMonth]    = useState<number | null>(null);
  const [filterRestId, setFilterRestId]   = useState<string | null>(null);
  const [filterRating, setFilterRating]   = useState<number | null>(null);
  const [showFilters,  setShowFilters]    = useState(false);

  // 年份清單
  const years = useMemo(() => {
    const ys = new Set(diary.map(e => new Date(e.createdAt).getFullYear()));
    return Array.from(ys).sort((a, b) => b - a);
  }, [diary]);

  // 店家清單（只有出現在日記的）
  const diaryRestaurants = useMemo(() => {
    const ids = new Set(diary.map(e => e.restaurantId));
    return restaurants.filter(r => ids.has(r.id));
  }, [diary]);

  const filtered = useMemo(() => {
    return diary.filter(e => {
      const date = new Date(e.createdAt);
      if (filterYear  !== null && date.getFullYear() !== filterYear)  return false;
      if (filterMonth !== null && date.getMonth() + 1 !== filterMonth) return false;
      if (filterRestId && e.restaurantId !== filterRestId)             return false;
      if (filterRating !== null && e.rating !== filterRating)          return false;
      if (searchText.trim()) {
        const q = searchText.trim();
        if (!e.restaurantName.includes(q) && !e.note.includes(q))     return false;
      }
      return true;
    });
  }, [diary, filterYear, filterMonth, filterRestId, filterRating, searchText]);

  const hasFilter = filterYear !== null || filterMonth !== null || filterRestId !== null || filterRating !== null || searchText.trim().length > 0;

  const clearFilters = () => {
    setFilterYear(null); setFilterMonth(null); setFilterRestId(null);
    setFilterRating(null); setSearchText('');
  };

  const handleDelete  = (id: string) => Alert.alert('刪除日記', '確定要刪除？', [{ text: '取消' }, { text: '刪除', style: 'destructive', onPress: () => deleteDiaryEntry(id) }]);
  const handleOpenAdd = () => { setCurrentEntry(null); setModalVisible(true); };
  const handleOpenEdit = (entry: DiaryEntry) => { setCurrentEntry(entry); setModalVisible(true); };
  const handleClose   = () => { setModalVisible(false); setTimeout(() => setCurrentEntry(null), 300); };

  const handleSave = async (data: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
    if (currentEntry) await updateDiaryEntry(currentEntry.id, data);
    else await addDiaryEntry(data);
    handleClose();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Text style={{ fontSize: 22, color: colors.headerText }}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.headerText }]}>📔 雞肉飯日記</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={handleOpenAdd}>
          <Text style={{ color: colors.headerText, fontSize: 22 }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 搜尋列 */}
      {diary.length > 0 && (
        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Text style={{ fontSize: 14 }}>🔍</Text>
            <TextInput
              value={searchText} onChangeText={setSearchText}
              placeholder="搜尋店名或日記內容..." placeholderTextColor={colors.textLight}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {searchText.length > 0 && <TouchableOpacity onPress={() => setSearchText('')}><Text style={{ color: colors.textLight }}>✕</Text></TouchableOpacity>}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: showFilters ? colors.primary : colors.primaryLight }]}
            onPress={() => setShowFilters(v => !v)}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 篩選面板 */}
      {showFilters && diary.length > 0 && (
        <View style={[styles.filterPanel, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          {/* 年份 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              {hasFilter && (
                <TouchableOpacity style={[styles.chip, { backgroundColor: colors.accent, borderColor: colors.accent }]} onPress={clearFilters}>
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✕ 清除</Text>
                </TouchableOpacity>
              )}
              {years.map(y => (
                <TouchableOpacity key={y}
                  style={[styles.chip, filterYear === y ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }]}
                  onPress={() => setFilterYear(filterYear === y ? null : y)}>
                  <Text style={{ color: filterYear === y ? '#FFF' : colors.text, fontSize: 12 }}>{y}年</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* 月份 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <TouchableOpacity key={m}
                  style={[styles.chip, filterMonth === m ? { backgroundColor: colors.secondary, borderColor: colors.secondary } : { borderColor: colors.border }]}
                  onPress={() => setFilterMonth(filterMonth === m ? null : m)}>
                  <Text style={{ color: filterMonth === m ? colors.accent : colors.text, fontSize: 12 }}>{m}月</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* 評分篩選 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              {[5,4,3,2,1].map(r => (
                <TouchableOpacity key={r}
                  style={[styles.chip, filterRating === r ? { backgroundColor: colors.starFilled, borderColor: colors.starFilled } : { borderColor: colors.border }]}
                  onPress={() => setFilterRating(filterRating === r ? null : r)}>
                  <Text style={{ color: filterRating === r ? '#FFF' : colors.text, fontSize: 12 }}>{'★'.repeat(r)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* 店家篩選 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              {diaryRestaurants.map(r => (
                <TouchableOpacity key={r.id}
                  style={[styles.chip, filterRestId === r.id ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }]}
                  onPress={() => setFilterRestId(filterRestId === r.id ? null : r.id)}>
                  <Text style={{ color: filterRestId === r.id ? '#FFF' : colors.text, fontSize: 12 }}>{r.name.slice(0, 8)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {diary.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>📔</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>還沒有日記</Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>記錄你吃過的火雞肉飯，上傳照片、寫心得、給評分！</Text>
          <TouchableOpacity style={[styles.addEntryBtn, { backgroundColor: colors.primary }]} onPress={handleOpenAdd}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>＋ 新增第一篇日記</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered} keyExtractor={e => e.id}
          contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}>
              <Text style={{ fontSize: 36 }}>🔍</Text>
              <Text style={{ color: colors.textSecondary }}>找不到符合的日記</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={{ color: colors.primary }}>清除篩選條件</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <DiaryCard entry={item} colors={colors} onDelete={() => handleDelete(item.id)} onEdit={() => handleOpenEdit(item)} />
          )}
        />
      )}

      <AddDiaryModal visible={modalVisible} onClose={handleClose} onSave={handleSave} initialData={currentEntry} colors={colors} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  appBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52 },
  iconBtn:     { padding: 8 },
  title:       { flex: 1, fontSize: 18, fontWeight: 'bold', marginLeft: 4 },
  addBtn:      { padding: 8, borderRadius: 20 },
  searchRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  searchBox:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 40, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  filterBtn:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterPanel: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  chip:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTitle:  { fontSize: 20, fontWeight: 'bold' },
  emptyHint:   { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  addEntryBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
});

const m = StyleSheet.create({
  root:       { flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 52 },
  headerBtn:  { padding: 8 },
  headerTitle:{ fontSize: 18, fontWeight: 'bold' },
  label:      { fontSize: 13, marginBottom: 8, fontWeight: '500' },
  picker:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  pickerTxt:  { flex: 1, fontSize: 15 },
  photoArea:  { height: 160, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 8, overflow: 'hidden' },
  photoImg:   { width: '100%', height: '100%', borderRadius: 12 },
  photoHint:  { fontSize: 14 },
  starRow:    { flexDirection: 'row', gap: 8, marginTop: 4 },
  star:       { fontSize: 36 },
  textarea:   { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, lineHeight: 22, minHeight: 120 },
});

const l = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:      { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', paddingTop: 16 },
  searchRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, height: 42 },
  searchInput:{ flex: 1, fontSize: 15, height: 42 },
  item:       { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  name:       { fontSize: 15, fontWeight: '600' },
  addr:       { fontSize: 12, marginTop: 2 },
  closeBtn:   { margin: 16, padding: 14, borderRadius: 12, alignItems: 'center' },
});

const d = StyleSheet.create({
  root:      { borderRadius: 14, overflow: 'hidden', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
  photo:     { width: '100%', height: 180 },
  body:      { padding: 14, gap: 6 },
  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name:      { fontSize: 16, fontWeight: 'bold', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  date:      { marginLeft: 8, fontSize: 12 },
  note:      { fontSize: 14, lineHeight: 20, marginTop: 4 },
});