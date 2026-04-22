import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        <Text key={`f${i}`} style={{ fontSize: size, color: colors.starFilled, lineHeight: size + 6 }}>★</Text>
      ))}
      {half && (
        <Text style={{ fontSize: size, color: colors.starFilled, lineHeight: size + 6 }}>⯨</Text>
      )}
      {Array(empty).fill(0).map((_, i) => (
        <Text key={`e${i}`} style={{ fontSize: size, color: colors.starEmpty, lineHeight: size + 6 }}>★</Text>
      ))}
      {showNumber && (
        <Text style={{ fontSize: size - 1, color: colors.textSecondary, lineHeight: size + 6, marginLeft: 3 }}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
