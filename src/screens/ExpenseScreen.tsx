import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { ExpenseEntry } from '../context/AppContext';
import { restaurants } from '../data/restaurantData';
import { ColorScheme } from '../theme/colors';

type Props = DrawerScreenProps<DrawerParamList, 'Expense'>;

// ─── 新增記帳 Modal ────────────────────────────────────────
function AddExpenseModal({
  visible, onClose, onSave, colors,
}: {
  visible: boolean; onClose: () => void;
  onSave: (entry: Omit<ExpenseEntry, 'id' | 'createdAt'>) => void;
  colors: ColorScheme;
}) {
  const [restaurantId, setRestaurantId] = useState('');
  const [amount, setAmount]             = useState('');
  const [items, setItems]               = useState('');
  const [showList, setShowList]         = useState(false);
  const [search, setSearch]             = useState('');

  const selectedRest = restaurants.find(r => r.id === restaurantId);
  const filteredRests = restaurants.filter(r => r.name.includes(search) || r.address.includes(search));

  const reset = () => {
    setRestaurantId(''); setAmount(''); setItems(''); setSearch('');
  };

  const handleSave = () => {
    if (!restaurantId) { Alert.alert('提示', '請先選擇店家'); return; }
    if (!amount || isNaN(Number(amount))) { Alert.alert('提示', '請輸入正確的金額'); return; }
    
    onSave({
      restaurantId,
      restaurantName: selectedRest!.name,
      amount: Number(amount),
      items: items.trim(),
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[m.root, { backgroundColor: colors.background }]}>
        <View style={[m.header, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }} style={m.headerBtn}>
            <Text style={{ color: colors.headerText, fontSize: 15 }}>取消</Text>
          </TouchableOpacity>
          <Text style={[m.headerTitle, { color: colors.headerText }]}>💰 新增記帳</Text>
          <TouchableOpacity onPress={handleSave} style={m.headerBtn}>
            <Text style={{ color: colors.headerText, fontSize: 15, fontWeight: 'bold' }}>儲存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <View>
            <Text style={[m.label, { color: colors.textLight }]}>店家</Text>
            <TouchableOpacity style={[m.picker, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowList(true)}>
              <Text style={{ fontSize: 16 }}>🍗</Text>
              <Text style={[m.pickerTxt, { color: selectedRest ? colors.text : colors.textLight }]}>
                {selectedRest ? selectedRest.name : '請選擇店家...'}
              </Text>
              <Text style={{ color: colors.primary }}>▾</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={[m.label, { color: colors.textLight }]}>花費金額 (元)</Text>
            <View style={[m.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 18, color: colors.textSecondary }}>$</Text>
              <TextInput
                value={amount} onChangeText={setAmount}
                keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textLight}
                style={[m.input, { color: colors.accent, fontSize: 20, fontWeight: 'bold' }]}
              />
            </View>
          </View>

          <View>
            <Text style={[m.label, { color: colors.textLight }]}>點了什麼？ (選填)</Text>
            <TextInput
              value={items} onChangeText={setItems}
              placeholder="例如：火雞肉飯便當、紫菜湯..." placeholderTextColor={colors.textLight}
              style={[m.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              multiline numberOfLines={3} textAlignVertical="top"
            />
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
  const { colors, expenses, addExpense, deleteExpense } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  const totalAmount = expenses.reduce((sum, current) => sum + current.amount, 0);

  const handleDelete = (id: string) =>
    Alert.alert('刪除紀錄', '確定要刪除這筆記帳嗎？', [
      { text: '取消' },
      { text: '刪除', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Text style={{ fontSize: 22, color: colors.headerText }}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.headerText }]}>💰 雞肉飯記帳本</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => setModalVisible(true)}>
          <Text style={{ color: colors.headerText, fontSize: 22 }}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' }}>累積總花費</Text>
        <Text style={{ color: '#FFF', fontSize: 36, fontWeight: 'bold', marginTop: 4 }}>
          <Text style={{ fontSize: 24 }}>$</Text> {totalAmount.toLocaleString()}
        </Text>
      </View>

      {expenses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>💸</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>還沒有記帳紀錄</Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>紀錄你每一筆吃雞肉飯的花費，看看你到底投資了多少在火雞肉飯上！</Text>
          <TouchableOpacity style={[styles.addEntryBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>＋ 新增第一筆花費</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={expenses} keyExtractor={e => e.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const date = new Date(item.createdAt);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return (
              <View style={[d.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={d.dateBox}>
                  <Text style={[d.dateTxt, { color: colors.textSecondary }]}>{dateStr}</Text>
                </View>
                <View style={d.body}>
                  <Text style={[d.name, { color: colors.text }]}>{item.restaurantName}</Text>
                  {Boolean(item.items) && <Text style={[d.items, { color: colors.textLight }]} numberOfLines={1}>{item.items}</Text>}
                </View>
                <Text style={[d.amount, { color: colors.accent }]}>${item.amount}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 8, marginLeft: 4 }}>
                  <Text style={{ fontSize: 16, color: colors.textLight }}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <AddExpenseModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={addExpense} colors={colors} />
    </SafeAreaView>
  );
}

// ─── 樣式設定 ──────────────────────────────────────────
const styles = StyleSheet.create({
  root:       { flex: 1 },
  appBar:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52 },
  iconBtn:    { padding: 8 },
  title:      { flex: 1, fontSize: 18, fontWeight: 'bold', marginLeft: 4 },
  addBtn:     { padding: 8, borderRadius: 20 },
  summaryCard:{ margin: 16, padding: 24, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
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
  card:       { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  dateBox:    { width: 46, height: 46, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dateTxt:    { fontSize: 13, fontWeight: 'bold' },
  body:       { flex: 1 },
  name:       { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  items:      { fontSize: 13 },
  amount:     { fontSize: 18, fontWeight: 'bold' },
});