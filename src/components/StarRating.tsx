// 星星評分元件 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // 引入真正的圖示庫
import { useApp } from '../context/AppContext';

interface Props {
  rating: number;
  size?: number;
  showNumber?: boolean;
}

export default function StarRating({ rating, size = 14, showNumber = true }: Props) {
  const { colors } = useApp();
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View style={styles.row}>
      {Array(full).fill(0).map((_, i) => (
        <Icon key={`f${i}`} name="star" size={size} color={colors.starFilled} />
      ))}
      
      {half && (
        <Icon name="star-half" size={size} color={colors.starFilled} />
      )}
      
      {Array(empty).fill(0).map((_, i) => (
        <Icon key={`e${i}`} name="star-outline" size={size} color={colors.starEmpty} />
      ))}
      
      {showNumber && (
        <Text style={{ fontSize: size - 1, color: colors.textSecondary, marginLeft: 4 }}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 }, // gap 可以讓星星之間有漂亮的小間距
});