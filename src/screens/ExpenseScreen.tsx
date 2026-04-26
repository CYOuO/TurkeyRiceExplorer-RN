import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { ExpenseEntry } from '../context/AppContext';
import { restaurants } from '../data/restaurantData';
import { ColorScheme } from '../theme/colors';

type Props = DrawerScreenProps<DrawerParamList, 'Expense'>;

// ─── 視覺化圖表元件：花費統計與排行 ──────────────────────────
function ExpenseStats({ expenses, colors, isFiltered, filteredName }: { expenses: ExpenseEntry[]; colors: ColorScheme; isFiltered: boolean; filteredName?: string }) {
  if (expenses.length === 0) return null;

  const totalAmount = expenses.reduce((sum, current) => sum + current.amount, 0);

  const topRestaurants = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.restaurantName] = (map[e.restaurantName] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [expenses]);

  const maxTotal = topRestaurants.length > 0 ? topRestaurants[0].total : 1;

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[s.title, { color: colors.textSecondary }]}>
        {isFiltered ? `💰 ${filteredName || '篩選結果'} 總花費` : '累積總花費'}
      </Text>
      <Text style={[s.total, { color: colors.accent }]}>
        <Text style={{ fontSize: 24 }}>$</Text>{totalAmount.toLocaleString()}
      </Text>
      
      {!isFiltered && (
        <>
          <View style={[s.divider, { backgroundColor: colors.divider }]} />
          <Text style={[s.subTitle, { color: colors.textLight }]}>🏆 花費排行榜</Text>
          
          {topRestaurants.map((rest, index) => (
            <View key={rest.name} style={s.barRow}>
              <Text style={[s.rank, { color: colors.textLight }]}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <View style={s.barHeader}>
                  <Text style={[s.barName, { color: colors.text }]} numberOfLines={1}>{rest.name}</Text>
                  <Text style={[s.barNum, { color: colors.accent }]}>${rest.total}</Text>
                </View>
                <View style={[s.barBg, { backgroundColor: colors.border }]}>
                  <View style={[s.barFill, { 
                    backgroundColor: index === 0 ? colors.accent : colors.primary, 
                    width: `${(rest.total / maxTotal) * 100}%` 
                  }]} />
                </View>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card:     { margin: 16, padding: 20, borderRadius: 20, borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  title:    { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  total:    { fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  divider:  { height: 1, marginVertical: 16 },
  subTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 12 },
  barRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  rank:     { fontSize: 16, fontWeight: 'bold', width: 14, textAlign: 'center' },
  barHeader:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barName:  { fontSize: 13, flex: 1 },
  barNum:   { fontSize: 13, fontWeight: 'bold' },
  barBg:    { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 4 },
});

// ─── 新增/編輯記帳 Modal ────────────────────────────────────────
function AddExpenseModal({
  visible, onClose, onSave, colors, initialData
}: {
  visible: boolean; onClose: () => void;
  onSave: (entry: Omit<ExpenseEntry, 'id' | 'createdAt'> & { createdAt: number }) => void;
  colors: ColorScheme;
  initialData?: ExpenseEntry | null;
}) {
  const [restaurantId, setRestaurantId] = useState('');
  const [amount, setAmount]             = useState('');
  const [items, setItems]               = useState('');
  const [date, setDate]                 = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showList, setShowList]         = useState(false);
  const [search, setSearch]             = useState('');

  useEffect(() => {
    if (initialData) {
      setRestaurantId(initialData.restaurantId);
      setAmount(initialData.amount.toString());
      setItems(initialData.items);
      setDate(new Date(initialData.createdAt));
    } else {
      setRestaurantId(''); setAmount(''); setItems(''); setSearch('');
      setDate(new Date());
    }
  }, [initialData, visible]);

  const selectedRest = restaurants.find(r => r.id === restaurantId);
  const filteredRests = restaurants.filter(r => r.name.includes(search) || r.address.includes(search));

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = () => {
    if (!restaurantId) { Alert.alert('提示', '請先選擇店家'); return; }
    if (!amount || isNaN(Number(amount))) { Alert.alert('提示', '請輸入正確的金額'); return; }
    
    onSave({
      restaurantId,
      restaurantName: selectedRest ? selectedRest.name : initialData!.restaurantName,
      amount: Number(amount),
      items: items.trim(),
      createdAt: date.getTime(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[m.root, { backgroundColor: colors.background }]}>
        <View style={[m.header, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={onClose} style={m.headerBtn}>
            <Text style={{ color: colors.headerText, fontSize: 15 }}>取消</Text>
          </TouchableOpacity>
          <Text style={[m.headerTitle, { color: colors.headerText }]}>
            {initialData ? '✏️ 編輯記帳' : '💰 新增記帳'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={m.headerBtn}>
            <Text style={{ color: colors.headerText, fontSize: 15, fontWeight: 'bold' }}>儲存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <View>
            <Text style={[m.label, { color: colors.textLight }]}>消費日期</Text>
            <TouchableOpacity style={[m.picker, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowDatePicker(true)}>
              <Text style={{ fontSize: 16 }}>📅</Text>
              <Text style={[m.pickerTxt, { color: colors.text }]}>{`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`}</Text>
              <Text style={{ color: colors.primary }}>修改</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />}

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
            <Text style={[m.label, { color: colors.textLight }]}>花費金額 (元)</Text>
            <View style={[m.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 18, color: colors.textSecondary }}>$</Text>
              <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textLight} style={[m.input, { color: colors.accent, fontSize: 20, fontWeight: 'bold' }]} />
            </View>
          </View>

          <View>
            <Text style={[m.label, { color: colors.textLight }]}>點了什麼？ (選填)</Text>
            <TextInput value={items} onChangeText={setItems} placeholder="例如：火雞肉飯便當、紫菜湯..." placeholderTextColor={colors.textLight} style={[m.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} multiline numberOfLines={3} textAlignVertical="top" />
          </View>
        </ScrollView>

        <Modal visible={showList} transparent animationType="slide" onRequestClose={() => setShowList(false)}>
          <View style={l.overlay}>
            <View style={[l.sheet, { backgroundColor: colors.surface }]}>
              <View style={[l.searchRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={{ fontSize: 16 }}>🔍</Text>
                <TextInput value={search} onChangeText={setSearch} placeholder="搜尋店名或地址..." placeholderTextColor={colors.textLight} style={[l.searchInput, { color: colors.text }]} />
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

// ─── 主畫面 ────────────────────────────────────────────────
export default function ExpenseScreen({ navigation }: Props) {
  const { colors, expenses, addExpense, deleteExpense, updateExpense } = useApp();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<ExpenseEntry | null>(null);
  const [searchText, setSearchText]     = useState('');

  // 篩選與排序狀態
  const [filterYear, setFilterYear]     = useState<number | null>(null);
  const [filterMonth, setFilterMonth]   = useState<number | null>(null);
  const [filterRestId, setFilterRestId] = useState<string | null>(null);
  const [sortOrder, setSortOrder]       = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showFilters, setShowFilters]   = useState(false);

  const years = useMemo(() => {
    const ys = new Set(expenses.map(e => new Date(e.createdAt).getFullYear()));
    return Array.from(ys).sort((a, b) => b - a);
  }, [expenses]);

  const expenseRestaurants = useMemo(() => {
    const ids = new Set(expenses.map(e => e.restaurantId));
    return restaurants.filter(r => ids.has(r.id));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let result = expenses.filter(e => {
      const date = new Date(e.createdAt);
      if (filterYear !== null && date.getFullYear() !== filterYear) return false;
      if (filterMonth !== null && date.getMonth() + 1 !== filterMonth) return false;
      if (filterRestId && e.restaurantId !== filterRestId) return false;
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        if (!e.restaurantName.toLowerCase().includes(q) && !e.items.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (sortOrder === 'newest') return timeB - timeA;
      if (sortOrder === 'oldest') return timeA - timeB;
      if (sortOrder === 'highest') return b.amount - a.amount;
      if (sortOrder === 'lowest') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, filterYear, filterMonth, filterRestId, searchText, sortOrder]);

  const hasFilter = filterYear !== null || filterMonth !== null || filterRestId !== null || searchText.trim().length > 0;
  const filteredRestName = filterRestId ? restaurants.find(r => r.id === filterRestId)?.name : undefined;

  const clearFilters = () => {
    setFilterYear(null); setFilterMonth(null); setFilterRestId(null);
    setSearchText(''); setSortOrder('newest');
  };

  const handleOpenAdd = () => { setCurrentEntry(null); setModalVisible(true); };
  const handleOpenEdit = (entry: ExpenseEntry) => { setCurrentEntry(entry); setModalVisible(true); };
  
  const handleSave = async (data: Omit<ExpenseEntry, 'id' | 'createdAt'> & { createdAt: number }) => {
    if (currentEntry) await updateExpense(currentEntry.id, data as any);
    else await addExpense(data as any);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Text style={{ fontSize: 22, color: colors.headerText }}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.headerText }]}>💰 雞肉飯記帳本</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={handleOpenAdd}>
          <Text style={{ color: colors.headerText, fontSize: 22 }}>+</Text>
        </TouchableOpacity>
      </View>

      {expenses.length > 0 && (
        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Text style={{ fontSize: 14 }}>🔍</Text>
            <TextInput value={searchText} onChangeText={setSearchText} placeholder="搜尋店名或品項..." placeholderTextColor={colors.textLight} style={[styles.searchInput, { color: colors.text }]} />
            {searchText.length > 0 && <TouchableOpacity onPress={() => setSearchText('')}><Text style={{ color: colors.textLight }}>✕</Text></TouchableOpacity>}
          </View>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: showFilters ? colors.primary : colors.primaryLight }]} onPress={() => setShowFilters(!showFilters)}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ 篩選面板：完全對齊 DiaryScreen 的樣式 */}
      {showFilters && expenses.length > 0 && (
        <View style={[styles.filterPanel, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          
          <Text style={[styles.panelSubtitle, { color: colors.textLight }]}>排列順序</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              <TouchableOpacity style={[styles.chip, sortOrder === 'newest' ? { backgroundColor: colors.secondary, borderColor: colors.secondary } : { borderColor: colors.border }]} onPress={() => setSortOrder('newest')}>
                <Text style={{ color: sortOrder === 'newest' ? colors.accent : colors.text, fontSize: 12, fontWeight: 'bold' }}>⬇️ 最新日期</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, sortOrder === 'oldest' ? { backgroundColor: colors.secondary, borderColor: colors.secondary } : { borderColor: colors.border }]} onPress={() => setSortOrder('oldest')}>
                <Text style={{ color: sortOrder === 'oldest' ? colors.accent : colors.text, fontSize: 12, fontWeight: 'bold' }}>⬆️ 最舊日期</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, sortOrder === 'highest' ? { backgroundColor: colors.secondary, borderColor: colors.secondary } : { borderColor: colors.border }]} onPress={() => setSortOrder('highest')}>
                <Text style={{ color: sortOrder === 'highest' ? colors.accent : colors.text, fontSize: 12, fontWeight: 'bold' }}>💰 金額高</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, sortOrder === 'lowest' ? { backgroundColor: colors.secondary, borderColor: colors.secondary } : { borderColor: colors.border }]} onPress={() => setSortOrder('lowest')}>
                <Text style={{ color: sortOrder === 'lowest' ? colors.accent : colors.text, fontSize: 12, fontWeight: 'bold' }}>🪙 金額低</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
          <Text style={[styles.panelSubtitle, { color: colors.textLight }]}>篩選條件</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              {hasFilter && <TouchableOpacity style={[styles.chip, { backgroundColor: colors.accent, borderColor: colors.accent }]} onPress={clearFilters}><Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✕ 清除</Text></TouchableOpacity>}
              {years.map(y => (
                <TouchableOpacity key={y} style={[styles.chip, filterYear === y ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }]} onPress={() => setFilterYear(filterYear === y ? null : y)}>
                  <Text style={{ color: filterYear === y ? '#FFF' : colors.text, fontSize: 12 }}>{y}年</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <TouchableOpacity key={m} style={[styles.chip, filterMonth === m ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }]} onPress={() => setFilterMonth(filterMonth === m ? null : m)}>
                  <Text style={{ color: filterMonth === m ? '#FFF' : colors.text, fontSize: 12 }}>{m}月</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              {expenseRestaurants.map(r => (
                <TouchableOpacity key={r.id} style={[styles.chip, filterRestId === r.id ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }]} onPress={() => setFilterRestId(filterRestId === r.id ? null : r.id)}>
                  <Text style={{ color: filterRestId === r.id ? '#FFF' : colors.text, fontSize: 12 }}>{r.name.slice(0, 8)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {expenses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>💸</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>還沒有記帳紀錄</Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>紀錄你每一筆吃雞肉飯的花費，看看你到底投資了多少在火雞肉飯上！</Text>
          <TouchableOpacity style={[styles.addEntryBtn, { backgroundColor: colors.primary }]} onPress={handleOpenAdd}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>＋ 新增第一筆花費</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses} 
          keyExtractor={e => e.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={<ExpenseStats expenses={filteredExpenses} colors={colors} isFiltered={hasFilter} filteredName={filteredRestName} />}
          ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}><Text style={{ fontSize: 36 }}>🔍</Text><Text style={{ color: colors.textSecondary }}>找不到符合的記帳紀錄</Text></View>}
          renderItem={({ item }) => {
            const date = new Date(item.createdAt);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return (
              <View style={[d.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
                <View style={[d.dateBox, { backgroundColor: colors.background }]}>
                  <Text style={[d.dateTxt, { color: colors.textSecondary }]}>{dateStr}</Text>
                </View>
                <View style={d.body}>
                  <TouchableOpacity onPress={() => setFilterRestId(item.restaurantId)}>
                    <Text style={[d.name, { color: colors.text }]}>{item.restaurantName}</Text>
                  </TouchableOpacity>
                  {Boolean(item.items) && <Text style={[d.items, { color: colors.textLight }]} numberOfLines={1}>{item.items}</Text>}
                </View>
                <Text style={[d.amount, { color: colors.accent }]}>${item.amount}</Text>
                <View style={{ flexDirection: 'row', marginLeft: 12, gap: 10 }}>
                  <TouchableOpacity onPress={() => handleOpenEdit(item)}><Text style={{ fontSize: 16 }}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { Alert.alert('刪除紀錄', '確定要刪除？', [{ text: '取消' }, { text: '刪除', style: 'destructive', onPress: () => deleteExpense(item.id) }]) }}><Text style={{ fontSize: 16, color: colors.textLight }}>✕</Text></TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <AddExpenseModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={handleSave} colors={colors} initialData={currentEntry} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  appBar:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52 },
  iconBtn:    { padding: 8 },
  title:      { flex: 1, fontSize: 18, fontWeight: 'bold', marginLeft: 4 },
  addBtn:     { padding: 8, borderRadius: 20 },
  searchRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  searchBox:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 40, borderRadius: 12, borderWidth: 1 },
  searchInput:{ flex: 1, fontSize: 14 },
  filterBtn:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  // ✅ 篩選面板樣式統一
  filterPanel:{ paddingHorizontal: 12, paddingVertical: 14, borderBottomWidth: 1 },
  panelSubtitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
  dividerLine: { height: 1, marginVertical: 10, opacity: 0.5 },
  chip:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  empty:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold' },
  emptyHint:  { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  addEntryBtn:{ marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
});

const m = StyleSheet.create({
  root:       { flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 52 },
  headerBtn:  { padding: 8 },
  headerTitle:{ fontSize: 18, fontWeight: 'bold' },
  label:      { fontSize: 13, marginBottom: 8, fontWeight: '500' },
  picker:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  pickerTxt:  { flex: 1, fontSize: 15 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, height: 52 },
  input:      { flex: 1, marginLeft: 8 },
  textarea:   { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, lineHeight: 22, minHeight: 100 },
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
  card:       { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  dateBox:    { width: 46, height: 46, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dateTxt:    { fontSize: 13, fontWeight: 'bold' },
  body:       { flex: 1 },
  name:       { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  items:      { fontSize: 13 },
  amount:     { fontSize: 18, fontWeight: 'bold' },
});