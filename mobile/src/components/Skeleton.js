import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { C, R, Sh } from '../theme';

export function SkeletonBox({ width, height, style, borderRadius = R.sm }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: C.border, opacity }, style]}
    />
  );
}

export function FarmCardSkeleton() {
  return (
    <View style={[sk.card, Sh.sm]}>
      <View style={sk.accent} />
      <View style={sk.body}>
        <View style={sk.top}>
          <SkeletonBox width={140} height={16} />
          <SkeletonBox width={58} height={20} borderRadius={R.pill} />
        </View>
        <View style={sk.meta}>
          <SkeletonBox width={64} height={12} />
          <SkeletonBox width={80} height={12} />
        </View>
      </View>
    </View>
  );
}

export function CropCardSkeleton() {
  return (
    <View style={sk.cropCard}>
      <View style={sk.accent} />
      <View style={sk.cropBody}>
        <View style={sk.row}>
          <SkeletonBox width={36} height={36} borderRadius={18} style={{ marginRight: 10 }} />
          <View style={{ flex: 1, gap: 7 }}>
            <SkeletonBox width={120} height={15} />
            <SkeletonBox width={80} height={11} />
          </View>
          <SkeletonBox width={60} height={22} borderRadius={R.pill} />
        </View>
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  card: {
    backgroundColor: C.card, borderRadius: R.md,
    flexDirection: 'row', alignItems: 'stretch',
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
  },
  accent:  { width: 4, backgroundColor: C.border },
  body:    { flex: 1, padding: 14 },
  top:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  meta:    { flexDirection: 'row', gap: 14 },

  cropCard: {
    backgroundColor: C.card, borderRadius: R.md,
    flexDirection: 'row', overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
  },
  cropBody: { flex: 1, padding: 12 },
  row:      { flexDirection: 'row', alignItems: 'center' },
});
