import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { C } from '../theme';

export default function SplashScreen() {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const ring  = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.spring(ring,  { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      {/* Decorative circles for depth */}
      <View style={[s.deco, s.decoA]} />
      <View style={[s.deco, s.decoB]} />

      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], alignItems: 'center' }}>
        <Animated.View style={[s.iconRing, { transform: [{ scale: ring }] }]}>
          <Text style={s.icon}>🌱</Text>
        </Animated.View>
        <Text style={s.name}>FarmSync</Text>
        <Text style={s.tagline}>GROW TOGETHER</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.forest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deco: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decoA: { width: 280, height: 280, top: -80,  right: -80 },
  decoB: { width: 200, height: 200, bottom: -60, left: -60 },

  iconRing: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  icon:    { fontSize: 54 },
  name:    { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, letterSpacing: 3, fontWeight: '600' },
});
