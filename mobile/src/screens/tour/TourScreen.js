import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, StatusBar, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const HEADER_H = Math.round(height * 0.42);

// AI-generated images via Pollinations.ai (free, no API key, cached by prompt+seed)
function aiImg(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=700&height=420&nologo=true&seed=${seed}`;
}

const SLIDES = [
  {
    id: '1',
    icon: 'leaf',
    color: '#2e7d32',
    dark: '#1b5e20',
    image: aiImg('lush green vegetable farm at sunrise aerial view golden light professional photography vibrant crops', 101),
    title: 'Welcome to FarmSync',
    subtitle: 'Your smart farming companion',
    body: 'Manage farms, track crops, get AI advice, and connect with farming communities — all in one app. Works in India and the USA.',
  },
  {
    id: '2',
    icon: 'home',
    color: '#388e3c',
    dark: '#1b5e20',
    image: aiImg('organized raised garden beds backyard overhead view neat vegetable rows sunny day small farm', 202),
    title: 'Farm Management',
    subtitle: 'Create & manage multiple farms',
    body: 'Add backyard plots, greenhouses, or large fields. Invite collaborators and get season reports with yield stats.',
    tips: ['Tap + on Home to create a farm', 'Open a farm → Season Report for yearly stats'],
  },
  {
    id: '3',
    icon: 'flower',
    color: '#43a047',
    dark: '#2e7d32',
    image: aiImg('farmer inspecting healthy tomato plants ripe red tomatoes lush vegetable garden bright sunlight', 303),
    title: 'Crop Tracking',
    subtitle: '56 vegetables ready to plant',
    body: 'Plant crops from our database of 56 vegetables. Track growth stages, log diary entries with photos, and record harvest yields.',
    tips: ['Open a farm → Plant Crop to get started', 'Use the Crop Diary to log progress with photos'],
  },
  {
    id: '4',
    icon: 'chatbubble-ellipses',
    color: '#1565C0',
    dark: '#003c8f',
    pro: true,
    image: aiImg('smiling Indian farmer using smartphone in green wheat field agricultural technology golden hour', 404),
    title: 'KisanBot — AI Advisor',
    subtitle: 'Powered by Claude AI',
    body: 'Ask about pest control, soil health, best crops for the season, or government schemes. Supports Hindi and English.\n\nFree accounts get 5 questions/month.',
    tips: ['Try: "Which crops to plant in June in India?"', 'Ask about PM-KISAN eligibility or USDA loans'],
  },
  {
    id: '5',
    icon: 'shield-checkmark',
    color: '#00796B',
    dark: '#004d40',
    pro: true,
    image: aiImg('farmer closely examining plant leaves for disease natural sunlight magnifying glass green garden', 505),
    title: 'Disease Detection',
    subtitle: 'AI-powered plant diagnosis',
    body: 'Take a photo of a sick plant and get an instant AI diagnosis with treatment recommendations.',
    tips: ['Open any crop → tap Diagnose Plant', 'Works best in natural daylight'],
  },
  {
    id: '6',
    icon: 'ribbon',
    color: '#1565C0',
    dark: '#003c8f',
    image: aiImg('Indian farmer receiving government agricultural scheme benefit certificate happy smile official', 606),
    title: 'Government Schemes',
    subtitle: 'India & USA • More regions coming',
    body: 'Discover schemes you qualify for — PM-KISAN, PMFBY, Kisan Credit Card in India; USDA FSA loans, EQIP, crop insurance in the USA.',
    tips: ['Tap Govt Schemes on Home', 'Switch between 🇮🇳 India and 🇺🇸 USA tabs'],
  },
  {
    id: '7',
    icon: 'bar-chart',
    color: '#E65100',
    dark: '#bf360c',
    pro: true,
    image: aiImg('farm financial planning notebook calculator fresh vegetables on wooden table income tracking agriculture', 707),
    title: 'Farm Finances',
    subtitle: 'Track income, expenses & ROI',
    body: 'Log seeds, labor and fertilizer costs, and crop sale income. See profit/loss, ROI, and monthly bar charts in ₹ or $.',
    tips: ['Tap Finances on Home', 'Tap + to log any income or expense'],
  },
  {
    id: '8',
    icon: 'map',
    color: '#6A1B9A',
    dark: '#4a0072',
    image: aiImg('aerial view colorful community garden plots neighborhood urban farming diverse vegetable beds', 808),
    title: 'Community Map',
    subtitle: 'Find nearby farms & groups',
    body: 'See farms and community groups near you on an interactive map. Join groups, post in forums, and trade produce with neighbours.',
    tips: ['Tap the Map tab at the bottom', 'Join a group to access the community forum'],
  },
  {
    id: '9',
    icon: 'storefront',
    color: '#00695C',
    dark: '#004d40',
    image: aiImg('vibrant fresh vegetable market stall colorful tomatoes carrots greens produce display outdoor bazaar', 909),
    title: 'Marketplace',
    subtitle: 'Buy, sell & trade produce',
    body: 'List surplus vegetables for sale, giveaway, or trade. Browse nearby listings and connect directly with local farmers.',
    tips: ['Tap the Market tab at the bottom', 'Add a photo to your listing for best results'],
  },
  {
    id: '10',
    icon: 'rocket',
    color: '#E65100',
    dark: '#bf360c',
    last: true,
    image: aiImg('happy farmer holding overflowing basket of fresh harvested vegetables smiling in lush green field success', 1010),
    title: "You're All Set!",
    subtitle: 'Start your farming journey today',
    body: 'Create your first farm, plant a crop, and explore KisanBot. Your data syncs offline automatically — farm even without internet.',
  },
];

export default function TourScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
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

  const renderSlide = ({ item }) => {
    const isLast = !!item.last;
    const imgFailed = imgErrors[item.id];

    return (
      <View style={[styles.slide, { width }]}>
        {/* Photo header */}
        <ImageBackground
          source={(!imgFailed && item.image) ? { uri: item.image } : undefined}
          style={[styles.slideHeader, { backgroundColor: item.color, height: HEADER_H }]}
          resizeMode="cover"
          onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
        >
          {/* Gradient-like color overlay so the design stays on-brand */}
          {!imgFailed && (
            <View style={[styles.imgOverlay, { backgroundColor: item.dark }]} />
          )}

          {/* Decorative circles */}
          <View style={[styles.decCircle1, { backgroundColor: item.color }]} />
          <View style={[styles.decCircle2, { backgroundColor: item.dark }]} />

          {/* PRO badge */}
          {item.pro && (
            <View style={styles.proBadge}>
              <Ionicons name="star" size={11} color="#fff" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}

          {/* Last-slide star decorations */}
          {isLast && (
            <>
              <Text style={styles.starDec1}>✨</Text>
              <Text style={styles.starDec2}>⭐</Text>
              <Text style={styles.starDec3}>✨</Text>
            </>
          )}

          {/* Icon card */}
          <View style={styles.iconCard}>
            <Ionicons name={item.icon} size={54} color={item.color} />
          </View>
        </ImageBackground>

        {/* White content card overlapping header */}
        <View style={styles.contentCard}>
          <Text style={[styles.slideTitle, isLast && { color: '#E65100' }]}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          <Text style={styles.slideBody}>{item.body}</Text>

          {item.tips && (
            <View style={styles.tipsContainer}>
              {item.tips.map((tip, i) => (
                <View key={i} style={[styles.tipCard, { borderLeftColor: item.color }]}>
                  <Ionicons name="checkmark-circle" size={15} color={item.color} style={{ marginTop: 1 }} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const slide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;
  const progress = (activeIndex + 1) / SLIDES.length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={slide.color} />

      {/* Thin progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: slide.color }]} />
      </View>

      {/* Skip / step */}
      <SafeAreaView edges={['top']} style={styles.headerRow}>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>{activeIndex + 1} / {SLIDES.length}</Text>
      </SafeAreaView>

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
        style={{ flex: 1 }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex
                ? [styles.dotActive, { backgroundColor: slide.color }]
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Next / Get Started */}
      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: isLast ? '#F9A825' : slide.color }]}
        onPress={goNext}
        activeOpacity={0.88}
      >
        {isLast && <Ionicons name="star" size={18} color="#fff" style={{ marginRight: 4 }} />}
        <Text style={styles.nextBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
        <Ionicons name={isLast ? 'checkmark-circle' : 'arrow-forward'} size={20} color="#fff" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      <View style={{ height: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  progressTrack: { height: 4, backgroundColor: '#e8e8e8', width: '100%' },
  progressFill: { height: 4, borderRadius: 2 },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  skipBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  skipText: { fontSize: 15, color: '#999', fontWeight: '500' },
  stepText: { fontSize: 13, color: '#bbb', fontWeight: '500' },

  slide: { flex: 1 },

  slideHeader: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  imgOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.62,
  },

  decCircle1: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    opacity: 0.22, top: -70, right: -70,
  },
  decCircle2: {
    position: 'absolute', width: 170, height: 170, borderRadius: 85,
    opacity: 0.18, bottom: -45, left: -45,
  },

  proBadge: {
    position: 'absolute', top: 14, right: 18,
    backgroundColor: 'rgba(249,168,37,0.92)',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  proBadgeText: { fontSize: 11, color: '#fff', fontWeight: '800', letterSpacing: 0.5 },

  starDec1: { position: 'absolute', top: 20, left: 30, fontSize: 28, opacity: 0.9 },
  starDec2: { position: 'absolute', top: 28, right: 55, fontSize: 22, opacity: 0.9 },
  starDec3: { position: 'absolute', bottom: 24, left: 60, fontSize: 20, opacity: 0.9 },

  iconCard: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 14,
    zIndex: 10,
  },

  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    paddingHorizontal: 26,
    paddingTop: 28,
  },

  slideTitle: {
    fontSize: 26, fontWeight: '800', color: '#1a1a1a',
    marginBottom: 6, textAlign: 'center',
  },
  slideSubtitle: {
    fontSize: 14, color: '#777', textAlign: 'center',
    fontWeight: '600', marginBottom: 14,
  },
  slideBody: {
    fontSize: 14, color: '#555', textAlign: 'center',
    lineHeight: 22, marginBottom: 18,
  },

  tipsContainer: { gap: 10 },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#f8f8f8', borderRadius: 10,
    borderLeftWidth: 3, paddingHorizontal: 12, paddingVertical: 10,
  },
  tipText: { fontSize: 13, color: '#444', flex: 1, lineHeight: 20 },

  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, marginTop: 8, marginBottom: 12,
  },
  dot: { height: 7, borderRadius: 4 },
  dotActive: { width: 22 },
  dotInactive: { width: 7, backgroundColor: '#ddd' },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 24, paddingVertical: 16, borderRadius: 16,
  },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
