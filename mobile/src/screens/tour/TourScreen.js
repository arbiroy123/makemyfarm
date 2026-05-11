import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'leaf',
    color: '#4CAF50',
    bg: '#e8f5e9',
    title: 'Welcome to FarmSync',
    subtitle: 'Your smart farming companion',
    body: 'Manage your farms, track crops, get AI advice, and connect with farming communities — all in one app. Works in India and the USA.',
  },
  {
    id: '2',
    icon: 'home',
    color: '#2e7d32',
    bg: '#f1f8e9',
    title: 'Farm Management',
    subtitle: 'Create & manage multiple farms',
    body: 'Add backyard plots, greenhouses, or large fields. Invite collaborators, view activity timelines, and get season reports with yield stats.',
    tips: ['Tap + on the Home screen to create a farm', 'Open a farm → Season Report for yearly stats'],
  },
  {
    id: '3',
    icon: 'flower',
    color: '#388e3c',
    bg: '#e8f5e9',
    title: 'Crop Tracking',
    subtitle: '56 vegetables ready to plant',
    body: 'Plant crops from our database of 56 vegetables. Track growth stages, log diary entries with photos, and record your harvest yield.',
    tips: ['Open a farm → Plant Crop to get started', 'Use the Crop Diary to log progress with photos'],
  },
  {
    id: '4',
    icon: 'chatbubble-ellipses',
    color: '#4CAF50',
    bg: '#e8f5e9',
    title: 'KisanBot — AI Advisor',
    subtitle: '⭐ Pro subscribers only',
    body: 'Powered by Claude AI. Ask about pest control, soil health, the best crops for the season, or government schemes. Supports Hindi and English.\n\nAvailable exclusively with a FarmSync Pro subscription.',
    tips: ['Tap KisanBot on the Home screen', 'Try: "Which crops to plant in June in India?"'],
  },
  {
    id: '5',
    icon: 'shield-checkmark',
    color: '#2196F3',
    bg: '#e3f2fd',
    title: 'Disease Detection',
    subtitle: '⭐ Pro subscribers only',
    body: 'Take a photo of a sick plant and get an instant AI diagnosis with treatment recommendations. Works offline too.\n\nAvailable exclusively with a FarmSync Pro subscription.',
    tips: ['Open any crop → tap Diagnose Plant', 'Works best in good lighting'],
  },
  {
    id: '6',
    icon: 'ribbon',
    color: '#1976D2',
    bg: '#e3f2fd',
    title: 'Government Schemes',
    subtitle: 'India & USA • More regions coming soon',
    body: 'Discover schemes you qualify for. Currently covering India (PM-KISAN, PMFBY, Kisan Credit Card, e-NAM and more) and the USA (USDA FSA loans, EQIP, crop insurance).\n\nSupport for more regions coming soon.',
    tips: ['Tap Govt Schemes on the Home screen', 'Switch between 🇮🇳 India and 🇺🇸 USA tabs'],
  },
  {
    id: '7',
    icon: 'bar-chart',
    color: '#FF9800',
    bg: '#fff3e0',
    title: 'Farm Finances',
    subtitle: '⭐ Pro subscribers only',
    body: 'Log seeds, labor, fertilizer costs and crop sale income. See profit/loss, ROI, and monthly bar charts. Supports ₹ INR and $ USD.\n\nAvailable exclusively with a FarmSync Pro subscription.',
    tips: ['Tap Finances on the Home screen', 'Tap + to log any income or expense'],
  },
  {
    id: '8',
    icon: 'map',
    color: '#9C27B0',
    bg: '#f3e5f5',
    title: 'Community Map',
    subtitle: 'Find nearby farms & groups',
    body: 'See farms and community groups near you on an interactive map. Join groups, post in forums, and trade produce with neighbours.',
    tips: ['Tap the Map tab at the bottom', 'Join a group to access the community forum'],
  },
  {
    id: '9',
    icon: 'storefront',
    color: '#00796B',
    bg: '#e0f2f1',
    title: 'Marketplace',
    subtitle: 'Buy, sell & trade produce',
    body: 'List surplus vegetables for sale, free giveaway, or trade. Browse nearby listings and connect directly with local farmers.',
    tips: ['Tap the Market tab at the bottom', 'Create a listing with a photo for best results'],
  },
  {
    id: '10',
    icon: 'rocket',
    color: '#4CAF50',
    bg: '#e8f5e9',
    title: "You're all set!",
    subtitle: 'Start your farming journey',
    body: 'Create your first farm, plant a crop, and explore KisanBot. Your data syncs offline automatically — farm even without internet.',
  },
];

export default function TourScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const markSeen = () => AsyncStorage.setItem('tourSeen', 'true').catch(() => {});

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      markSeen();
      navigation.goBack();
    }
  };

  const skip = () => { markSeen(); navigation.goBack(); };

  const renderSlide = ({ item, index }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={64} color={item.color} />
      </View>

      <Text style={[styles.slideTitle, { color: item.color }]}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      <Text style={styles.slideBody}>{item.body}</Text>

      {item.tips && (
        <View style={styles.tipsBox}>
          {item.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={16} color={item.color} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const isLast = activeIndex === SLIDES.length - 1;
  const activeColor = SLIDES[activeIndex].color;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>{activeIndex + 1} / {SLIDES.length}</Text>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        scrollEventThrottle={16}
      />

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex
                ? [styles.dotActive, { backgroundColor: activeColor }]
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Next / Get Started button */}
      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: activeColor }]}
        onPress={goNext}
      >
        <Text style={styles.nextBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
        <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12,
  },
  skipText: { fontSize: 15, color: '#999', fontWeight: '500' },
  stepText: { fontSize: 13, color: '#bbb' },
  slide: {
    paddingHorizontal: 28, paddingTop: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 28,
  },
  slideTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  slideSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  slideBody: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 23, marginBottom: 20 },
  tipsBox: {
    backgroundColor: '#f9f9f9', borderRadius: 12,
    padding: 14, width: '100%', gap: 10,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipText: { fontSize: 13, color: '#444', flex: 1, lineHeight: 19 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 16 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  dotInactive: { width: 8, backgroundColor: '#ddd' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 24, marginBottom: 16,
    paddingVertical: 16, borderRadius: 14,
  },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
