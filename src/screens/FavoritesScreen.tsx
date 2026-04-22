import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { restaurants } from '../data/restaurantData';
import { getImage } from '../data/imageMap';
import StarRating from '../components/StarRating';
import { isOpenNow } from '../utils/timeUtils';

type Props = DrawerScreenProps<DrawerParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: Props) {
  const { colors, favorites, toggleFavorite } = useApp();
  const favList = restaurants.filter(r => favorites.includes(r.id));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Text style={{ fontSize: 22, color: colors.headerText }}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.appBarTitle, { color: colors.headerText }]}>
          ❤️ 我的收藏{favList.length > 0 ? `（${favList.length}）` : ''}
        </Text>
      </View>

      {favList.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>🤍</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>還沒有收藏店家</Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
            在店家詳情頁點愛心，就能把喜歡的店加入這裡！
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('HomeStack', { screen: 'RestaurantInfo' } as never)}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>去探索店家 →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favList}
          keyExtractor={r => r.id}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => {
            const src  = getImage(item.images[0]);
            const open = isOpenNow(item.time);
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
                onPress={() => navigation.navigate('HomeStack',
                  { screen: 'RestaurantInfo', params: { preselect: item.id } } as never)}
                activeOpacity={0.85}>
                <View style={styles.imgWrap}>
                  {src
                    ? <Image source={src} style={styles.img} />
                    : <View style={[styles.img, { backgroundColor: colors.primaryLight,
                        justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 30 }}>🍗</Text>
                      </View>
                  }
                  <TouchableOpacity style={styles.unfavBtn} onPress={() => toggleFavorite(item.id)}>
                    <Text style={{ fontSize: 16 }}>❤️</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <StarRating rating={item.rating} size={13} />
                  <Text style={[styles.addr, { color: colors.textSecondary }]}
                    numberOfLines={1}>{item.address}</Text>
                  <View style={styles.footer}>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                      backgroundColor: open ? colors.openBadgeBg : colors.closedBadgeBg }}>
                      <Text style={{ fontSize: 11, fontWeight: '600',
                        color: open ? colors.openBadge : colors.closedBadge }}>
                        {open ? '🟢 營業中' : '🔴 已打烊'}
                      </Text>
                    </View>
                    <Text style={[styles.price, { color: colors.accent }]}>{item.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  appBar:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52 },
  iconBtn:    { padding: 8 },
  appBarTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', marginLeft: 4 },
  empty:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  emptyHint:  { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  exploreBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 25 },
  card: {
    borderRadius: 14, flexDirection: 'row', overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },
  imgWrap:  { position: 'relative' },
  img:      { width: 110, height: 110 },
  unfavBtn: { position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 4 },
  info:    { flex: 1, padding: 12, gap: 4 },
  name:    { fontSize: 16, fontWeight: 'bold' },
  addr:    { fontSize: 12, marginTop: 2 },
  footer:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price:   { fontSize: 12, fontWeight: '600' },
});
