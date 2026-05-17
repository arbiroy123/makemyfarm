import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, Modal, Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { farmAPI, billingAPI, adsAPI } from '../../api/client';
import client from '../../api/client';
import { detectCountry } from '../../utils/country';
import { useFarmStore, useAuthStore } from '../../store';
import { C, R, Sh } from '../../theme';

const FEATURE_CARDS = [
  { key: 'tour',       label: 'Take a Tour',  sublabel: 'See features',   icon: 'rocket',              color: C.feature.tour,       screen: 'Tour',               pro: false },
  { key: 'chatbot',    label: 'KisanBot',     sublabel: 'AI Advisor',     icon: 'chatbubble-ellipses', color: C.feature.chatbot,    screen: 'Chatbot',            pro: true  },
  { key: 'schemes',    label: 'Govt Schemes', sublabel: 'India & US',     icon: 'ribbon',              color: C.feature.schemes,    screen: 'GovernmentSchemes',  pro: false },
  { key: 'financials', label: 'Finances',     sublabel: 'Track P&L',      icon: 'bar-chart',           color: C.feature.financials, screen: 'FinancialDashboard', pro: true  },
  { key: 'succession', label: 'Harvest Plan', sublabel: 'Never run dry',  icon: 'calendar',            color: C.feature.succession, screen: 'SuccessionPlanner',  pro: false },
  { key: 'stories',    label: 'Grow Stories', sublabel: 'Community feed', icon: 'people',              color: C.feature.stories,    screen: 'GrowStories',        pro: false },
];

const PRO_FEATURES = [
  { icon: 'chatbubble-ellipses', text: 'KisanBot — AI Agronomist (unlimited questions)' },
  { icon: 'bug',                 text: 'Disease Detection — AI-powered plant diagnosis' },
  { icon: 'bar-chart',           text: 'Farm Finances — income, expense & ROI tracking' },
  { icon: 'home',                text: 'Unlimited farms & crops (free tier: 1 farm, 5 crops)' },
];

function farmTypeColor(type) {
  return C.farmType[type] || C.farmType.default;
}

function farmTypeIcon(type) {
  const map = {
    backyard: 'home-outline', greenhouse: 'leaf-outline',
    field: 'earth-outline', rooftop: 'business-outline',
    balcony: 'flower-outline', community: 'people-outline',
  };
  return map[type] || 'leaf-outline';
}

function greeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${g}, ${name}`;
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { farms, setFarms } = useFarmStore();
  const { user } = useAuthStore();
  const firstName = user?.first_name || 'Farmer';

  const [loading, setLoading]   = useState(true);
  const [isPro, setIsPro]       = useState(false);
  const [proPrice, setProPrice] = useState('₹99');
  const [ad, setAd]             = useState(null);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [tasks, setTasks]       = useState([]);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    loadFarms();
    loadBillingStatus();
    loadTaskPreview();
  }, []);

  const loadTaskPreview = async () => {
    try {
      const res = await client.get('/tasks/today');
      const allTasks = res.data.tasks || [];
      setTasks(allTasks.filter(t => t.priority === 'high').slice(0, 2));
      setTaskCount(res.data.count || 0);
    } catch { /* non-critical */ }
  };

  const loadFarms = async () => {
    try {
      const response = await farmAPI.getMyFarms();
      setFarms(response.data);
    } catch (error) {
      console.error('Failed to load farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBillingStatus = async () => {
    try {
      const res = await billingAPI.getStatus();
      setIsPro(res.data.isPro);
      if (res.data.price) setProPrice(res.data.price);
      if (!res.data.isPro) {
        const country = res.data.country || detectCountry();
        adsAPI.getBanner(country).then(r => setAd(r.data)).catch(() => {});
      }
    } catch { /* default to free */ }
  };

  const handleFeaturePress = (card) => {
    if (card.pro && !isPro) {
      setPaywallFeature(card.label);
      setPaywallVisible(true);
      return;
    }
    if (card.screen === 'FinancialDashboard') {
      navigation.navigate(card.screen, farms.length > 0
        ? { farmId: farms[0].id, farmName: farms[0].name } : {});
    } else {
      navigation.navigate(card.screen);
    }
  };

  const renderFarmCard = ({ item }) => {
    const accent = farmTypeColor(item.farm_type);
    const activeCrops = item.crop_count ?? 0;
    return (
      <TouchableOpacity
        style={[s.farmCard, Sh.sm]}
        onPress={() => navigation.navigate('FarmDetail', { farmId: item.id })}
        activeOpacity={0.88}
      >
        {/* Left accent bar */}
        <View style={[s.farmAccent, { backgroundColor: accent }]} />
        <View style={s.farmBody}>
          <View style={s.farmTop}>
            <Text style={s.farmName} numberOfLines={1}>{item.name}</Text>
            {activeCrops > 0 && (
              <View style={[s.cropCountChip, { backgroundColor: accent + '22' }]}>
                <Text style={[s.cropCountTxt, { color: accent }]}>{activeCrops} crops</Text>
              </View>
            )}
          </View>
          <View style={s.farmMeta}>
            <View style={s.farmMetaItem}>
              <Ionicons name={farmTypeIcon(item.farm_type)} size={13} color={accent} />
              <Text style={s.farmMetaTxt}>{item.farm_type || 'farm'}</Text>
            </View>
            {item.size_sqft ? (
              <View style={s.farmMetaItem}>
                <Ionicons name="expand-outline" size={13} color={C.muted} />
                <Text style={s.farmMetaTxt}>{item.size_sqft} sq ft</Text>
              </View>
            ) : null}
            {item.climate_zone ? (
              <View style={s.farmMetaItem}>
                <Ionicons name="partly-sunny-outline" size={13} color={C.muted} />
                <Text style={s.farmMetaTxt}>{item.climate_zone}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.border} style={{ alignSelf: 'center' }} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={C.mid} /></View>;
  }

  return (
    <View style={s.root}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={[s.headerDeco, s.decoA]} />
        <View style={[s.headerDeco, s.decoB]} />
        <View style={s.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerGreeting}>{greeting(firstName)}</Text>
            <Text style={s.headerDate}>{todayLabel()}</Text>
          </View>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => navigation.navigate('CreateFarm')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={C.forest} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Feature strip ───────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.featureScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 12 }}
        >
          {FEATURE_CARDS.map(card => (
            <TouchableOpacity
              key={card.key}
              style={[s.featureCard, Sh.xs]}
              onPress={() => handleFeaturePress(card)}
              activeOpacity={0.85}
            >
              {card.pro && !isPro && (
                <View style={s.proBadge}>
                  <Ionicons name="star" size={7} color="#fff" />
                  <Text style={s.proBadgeTxt}>PRO</Text>
                </View>
              )}
              <View style={[s.featureIcon, { backgroundColor: card.color + '1A' }]}>
                <Ionicons name={card.icon} size={22} color={card.color} />
              </View>
              <Text style={[s.featureLabel, { color: card.color }]}>{card.label}</Text>
              <Text style={s.featureSub}>{card.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Today's Tasks widget ─────────────────────────────────────── */}
        {taskCount > 0 && (
          <TouchableOpacity
            style={[s.tasksCard, Sh.xs]}
            onPress={() => navigation.navigate('TodayTasks')}
            activeOpacity={0.88}
          >
            <View style={s.tasksHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-done-circle" size={18} color={C.mid} />
                <Text style={s.tasksTitle}>Today on Your Farm</Text>
              </View>
              <View style={s.tasksCountBadge}>
                <Text style={s.tasksCountTxt}>{taskCount}</Text>
              </View>
            </View>
            {tasks.map((task, i) => (
              <View key={i} style={s.taskRow}>
                <Ionicons
                  name={task.type === 'harvest' ? 'basket-outline' : task.type === 'water' ? 'water-outline' : 'leaf-outline'}
                  size={14}
                  color={task.color || C.mid}
                />
                <Text style={s.taskTxt} numberOfLines={1}>{task.title}</Text>
                {task.priority === 'high' && <View style={s.urgentDot} />}
              </View>
            ))}
            <Text style={s.tasksSeeAll}>See all tasks →</Text>
          </TouchableOpacity>
        )}

        {/* ── Ad banner (free tier) ────────────────────────────────────── */}
        {!isPro && ad && (
          <TouchableOpacity
            style={[s.adCard, Sh.xs]}
            onPress={() => Linking.openURL(ad.url)}
            activeOpacity={0.85}
          >
            <View style={s.adBadge}><Text style={s.adBadgeTxt}>AD</Text></View>
            <Text style={s.adEmoji}>{ad.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.adTitle}>{ad.title}</Text>
              <Text style={s.adSub}>{ad.subtitle}</Text>
            </View>
            <Ionicons name="open-outline" size={15} color={C.muted} />
          </TouchableOpacity>
        )}

        {/* ── Farms ────────────────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{t('yourFarms')}</Text>
          <Text style={s.sectionCount}>{farms.length} {farms.length === 1 ? 'farm' : 'farms'}</Text>
        </View>

        {farms.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🌿</Text>
            <Text style={s.emptyTitle}>{t('noFarmsYet')}</Text>
            <Text style={s.emptySub}>Tap the + button above to add your first farm</Text>
            <TouchableOpacity style={[s.createBtn, Sh.sm]} onPress={() => navigation.navigate('CreateFarm')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={s.createBtnTxt}>{t('createFirstFarm')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {farms.map(item => (
              <View key={item.id}>{renderFarmCard({ item })}</View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Pro paywall modal ────────────────────────────────────────── */}
      <Modal visible={paywallVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.sheetHandle} />
            <View style={s.crownCircle}>
              <Ionicons name="star" size={34} color="#F9A825" />
            </View>
            <Text style={s.paywallTitle}>Unlock Pro</Text>
            <Text style={s.paywallSub}>
              <Text style={{ fontWeight: '700', color: C.ink }}>{paywallFeature}</Text>
              {' '}is a Pro feature.
            </Text>

            <View style={s.divider} />
            <Text style={s.proLabel}>INCLUDED IN PRO</Text>
            {PRO_FEATURES.map((f, i) => (
              <View key={i} style={s.proRow}>
                <View style={s.proIconWrap}>
                  <Ionicons name={f.icon} size={15} color={C.primary} />
                </View>
                <Text style={s.proRowTxt}>{f.text}</Text>
              </View>
            ))}
            <View style={s.divider} />

            <View style={s.priceRow}>
              <Text style={s.price}>{proPrice}</Text>
              <Text style={s.pricePer}>/mo</Text>
            </View>
            <Text style={s.priceNote}>Cancel anytime · No hidden fees</Text>

            <TouchableOpacity
              style={[s.upgradeBtn, Sh.sm]}
              onPress={async () => {
                try {
                  const res = await billingAPI.createCheckoutSession();
                  if (res?.url) { setPaywallVisible(false); Linking.openURL(res.url); }
                } catch {
                  setPaywallVisible(false);
                  Linking.openURL('mailto:support@farmsync.app?subject=Pro%20Upgrade');
                }
              }}
            >
              <Ionicons name="star" size={17} color="#fff" />
              <Text style={s.upgradeBtnTxt}>Upgrade to Pro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.laterBtn} onPress={() => setPaywallVisible(false)}>
              <Text style={s.laterTxt}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.page },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    backgroundColor: C.forest, paddingBottom: 18, overflow: 'hidden',
  },
  headerDeco: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)' },
  decoA:      { width: 200, height: 200, top: -80, right: -40 },
  decoB:      { width: 130, height: 130, bottom: -50, left: 20 },
  headerContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, gap: 12,
  },
  headerGreeting: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerDate:     { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: '500' },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    ...Sh.xs,
  },

  // Feature strip
  featureScroll: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  featureCard: {
    width: 90, backgroundColor: C.card, borderRadius: R.md,
    padding: 12, alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: C.border,
  },
  featureIcon: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center',
  },
  featureLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  featureSub:   { fontSize: 10, color: C.muted, textAlign: 'center' },
  proBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: '#F9A825', borderRadius: 6,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 4, paddingVertical: 2, gap: 2,
  },
  proBadgeTxt: { fontSize: 7, color: '#fff', fontWeight: '800' },

  // Tasks widget
  tasksCard: {
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: C.card, borderRadius: R.md,
    padding: 14, borderLeftWidth: 3, borderLeftColor: C.mid,
  },
  tasksHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tasksTitle:     { fontSize: 14, fontWeight: '700', color: C.ink },
  tasksCountBadge:{ backgroundColor: C.mid, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  tasksCountTxt:  { fontSize: 11, color: '#fff', fontWeight: '700' },
  taskRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  taskTxt:        { flex: 1, fontSize: 13, color: C.sub },
  urgentDot:      { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.failed },
  tasksSeeAll:    { fontSize: 12, color: C.primary, fontWeight: '600', marginTop: 4 },

  // Ad card
  adCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.card, borderRadius: R.md,
    padding: 12, borderWidth: 1, borderColor: C.border,
  },
  adBadge:    { position: 'absolute', top: 6, right: 8, backgroundColor: '#e5e5e5', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  adBadgeTxt: { fontSize: 9, color: '#888', fontWeight: '700' },
  adEmoji:    { fontSize: 26 },
  adTitle:    { fontSize: 13, fontWeight: '700', color: C.ink },
  adSub:      { fontSize: 11, color: C.muted, marginTop: 1 },

  // Farms section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginTop: 18, marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.ink },
  sectionCount: { fontSize: 12, color: C.muted, fontWeight: '600' },

  farmCard: {
    backgroundColor: C.card, borderRadius: R.md,
    flexDirection: 'row', alignItems: 'stretch',
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
  },
  farmAccent: { width: 4 },
  farmBody:   { flex: 1, padding: 14 },
  farmTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  farmName:   { fontSize: 16, fontWeight: '700', color: C.ink, flex: 1 },
  cropCountChip: { borderRadius: R.pill, paddingHorizontal: 9, paddingVertical: 3, marginLeft: 8 },
  cropCountTxt:  { fontSize: 11, fontWeight: '700' },
  farmMeta:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  farmMetaItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmMetaTxt:   { fontSize: 12, color: C.muted, fontWeight: '500', textTransform: 'capitalize' },

  // Empty state
  empty: { alignItems: 'center', padding: 36 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.ink, marginBottom: 6 },
  emptySub:   { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  createBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.primary, borderRadius: R.pill,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  createBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Paywall modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: C.card,
    borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl,
    padding: 24, paddingBottom: 44, alignItems: 'center',
  },
  sheetHandle: { width: 38, height: 4, backgroundColor: C.border, borderRadius: 2, marginBottom: 18 },
  crownCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  paywallTitle: { fontSize: 22, fontWeight: '800', color: C.ink, marginBottom: 6 },
  paywallSub:   { fontSize: 14, color: C.sub, textAlign: 'center', lineHeight: 21, marginBottom: 4 },
  divider:      { width: '100%', height: 1, backgroundColor: C.border, marginVertical: 14 },
  proLabel:     { fontSize: 11, fontWeight: '700', color: C.muted, alignSelf: 'flex-start', letterSpacing: 0.8, marginBottom: 10 },
  proRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', marginBottom: 9, width: '100%' },
  proIconWrap:  { width: 28, height: 28, borderRadius: 14, backgroundColor: C.pale, justifyContent: 'center', alignItems: 'center' },
  proRowTxt:    { fontSize: 13, color: C.sub, flex: 1 },
  priceRow:     { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price:        { fontSize: 34, fontWeight: '800', color: C.ink },
  pricePer:     { fontSize: 16, color: C.muted, marginLeft: 3 },
  priceNote:    { fontSize: 12, color: C.muted, marginBottom: 22 },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9A825', borderRadius: R.pill,
    paddingVertical: 15, paddingHorizontal: 40, width: '100%',
    justifyContent: 'center', marginBottom: 12,
  },
  upgradeBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  laterBtn:      { paddingVertical: 8 },
  laterTxt:      { color: C.muted, fontSize: 14 },
});
