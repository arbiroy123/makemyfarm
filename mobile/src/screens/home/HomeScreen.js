import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, Modal, Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { farmAPI, billingAPI, adsAPI } from '../../api/client';
import { detectCountry } from '../../utils/country';
import { useFarmStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';

const FEATURE_CARDS = [
  { key: 'tour',       label: 'Take a Tour',  sublabel: 'See features',  icon: 'rocket',               color: '#9C27B0', bg: '#f3e5f5', screen: 'Tour',              pro: false },
  { key: 'chatbot',    label: 'KisanBot',     sublabel: 'AI Advisor',    icon: 'chatbubble-ellipses',  color: '#4CAF50', bg: '#e8f5e9', screen: 'Chatbot',           pro: true  },
  { key: 'schemes',    label: 'Govt Schemes', sublabel: 'India & US',    icon: 'ribbon',               color: '#2196F3', bg: '#e3f2fd', screen: 'GovernmentSchemes', pro: false },
  { key: 'financials', label: 'Finances',     sublabel: 'Track P&L',     icon: 'bar-chart',            color: '#FF9800', bg: '#fff3e0', screen: 'FinancialDashboard',pro: true  },
];

const PRO_FEATURES = [
  { icon: 'chatbubble-ellipses', text: 'KisanBot — AI Agronomist (unlimited questions)' },
  { icon: 'bug',                 text: 'Disease Detection — AI-powered plant diagnosis' },
  { icon: 'bar-chart',           text: 'Farm Finances — income, expense & ROI tracking' },
  { icon: 'home',                text: 'Unlimited farms & crops (free tier: 1 farm, 5 crops)' },
];

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { farms, setFarms } = useFarmStore();
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [proPrice, setProPrice] = useState('₹99');
  const [ad, setAd] = useState(null);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  useEffect(() => {
    loadFarms();
    loadBillingStatus();
  }, []);

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
    } catch {
      // default to free if billing endpoint unreachable
    }
  };

  const handleFeaturePress = (card) => {
    if (card.pro && !isPro) {
      setPaywallFeature(card.label);
      setPaywallVisible(true);
      return;
    }
    if (card.screen === 'FinancialDashboard') {
      navigation.navigate(card.screen, farms.length > 0
        ? { farmId: farms[0].id, farmName: farms[0].name }
        : {}
      );
    } else {
      navigation.navigate(card.screen);
    }
  };

  const renderFarmCard = ({ item }) => (
    <TouchableOpacity style={styles.farmCard} onPress={() => navigation.navigate('FarmDetail', { farmId: item.id })}>
      <View style={styles.cardHeader}>
        <Text style={styles.farmName}>{item.name}</Text>
        <Text style={styles.farmType}>{item.farm_type}</Text>
      </View>
      <Text style={styles.farmDescription} numberOfLines={2}>
        {item.description || t('noDescription')}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.farmSize}>{t('sqFt', { value: item.size_sqft })}</Text>
        <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('yourFarms')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateFarm')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Feature Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.featureRow}
        contentContainerStyle={{ paddingHorizontal: 15, gap: 10 }}
      >
        {FEATURE_CARDS.map(card => (
          <TouchableOpacity
            key={card.key}
            style={[styles.featureCard, { backgroundColor: card.bg }]}
            onPress={() => handleFeaturePress(card)}
          >
            {/* PRO badge */}
            {card.pro && (
              <View style={styles.proBadge}>
                <Ionicons name="star" size={8} color="#fff" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
            <View style={[styles.featureIcon, { backgroundColor: card.color }]}>
              <Ionicons name={card.icon} size={22} color="#fff" />
            </View>
            <Text style={[styles.featureLabel, { color: card.color }]}>{card.label}</Text>
            <Text style={styles.featureSublabel}>{card.sublabel}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sponsored card — free tier only, backend-driven */}
      {!isPro && ad && (
        <TouchableOpacity
          style={styles.sponsoredCard}
          activeOpacity={0.85}
          onPress={() => Linking.openURL(ad.url)}
        >
          <View style={styles.sponsoredBadge}><Text style={styles.sponsoredBadgeText}>AD</Text></View>
          <Text style={styles.sponsoredEmoji}>{ad.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.sponsoredTitle}>{ad.title}</Text>
            <Text style={styles.sponsoredSub}>{ad.subtitle}</Text>
          </View>
          <Ionicons name="open-outline" size={16} color="#888" />
        </TouchableOpacity>
      )}

      {farms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('noFarmsYet')}</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateFarm')}>
            <Text style={styles.createButtonText}>{t('createFirstFarm')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={farms}
          renderItem={renderFarmCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Pro Paywall Modal */}
      <Modal visible={paywallVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Crown */}
            <View style={styles.crownCircle}>
              <Ionicons name="star" size={36} color="#F9A825" />
            </View>

            <Text style={styles.paywallTitle}>Pro Subscription Required</Text>
            <Text style={styles.paywallSubtitle}>
              <Text style={styles.paywallFeatureName}>{paywallFeature}</Text>
              {' '}is available exclusively to FarmSync Pro subscribers.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.proIncludedLabel}>Everything included in Pro:</Text>
            {PRO_FEATURES.map((f, i) => (
              <View key={i} style={styles.proFeatureRow}>
                <Ionicons name={f.icon} size={16} color="#4CAF50" />
                <Text style={styles.proFeatureText}>{f.text}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.price}>{proPrice}</Text>
              <Text style={styles.pricePer}> / month</Text>
            </View>
            <Text style={styles.priceNote}>Cancel anytime. No hidden fees.</Text>

            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => {
                setPaywallVisible(false);
                // TODO: navigate to in-app Stripe checkout when live
              }}
            >
              <Ionicons name="star" size={18} color="#fff" />
              <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterBtn} onPress={() => setPaywallVisible(false)}>
              <Text style={styles.laterText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15,
    backgroundColor: '#fff', borderBottomColor: '#eee', borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: {
    backgroundColor: '#4CAF50', width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  listContent: { padding: 15 },
  farmCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  farmName: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  farmType: {
    backgroundColor: '#e8f5e9', color: '#2e7d32',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    fontSize: 12, fontWeight: '600',
  },
  farmDescription: { fontSize: 14, color: '#666', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  farmSize: { fontSize: 12, color: '#999' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#999', marginBottom: 20 },
  createButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Feature strip
  featureRow: { paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  featureCard: { width: 100, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6 },
  featureIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  featureLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  featureSublabel: { fontSize: 10, color: '#999', textAlign: 'center' },
  proBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: '#F9A825', borderRadius: 8,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 5, paddingVertical: 2, gap: 2,
  },
  proBadgeText: { fontSize: 8, color: '#fff', fontWeight: '800' },

  // Paywall modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, alignItems: 'center',
  },
  crownCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFF8E1', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  paywallTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 8, textAlign: 'center' },
  paywallSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 21, marginBottom: 16 },
  paywallFeatureName: { fontWeight: '700', color: '#333' },
  divider: { width: '100%', height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },
  proIncludedLabel: { fontSize: 12, fontWeight: '700', color: '#999', alignSelf: 'flex-start', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  proFeatureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, alignSelf: 'flex-start', marginBottom: 9 },
  proFeatureText: { fontSize: 13, color: '#444', flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontSize: 32, fontWeight: '800', color: '#333' },
  pricePer: { fontSize: 16, color: '#888' },
  priceNote: { fontSize: 12, color: '#aaa', marginBottom: 20 },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9A825', borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 40, width: '100%',
    justifyContent: 'center', marginBottom: 12,
  },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  laterBtn: { paddingVertical: 8 },
  laterText: { color: '#aaa', fontSize: 14 },

  sponsoredCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 15, marginTop: 10, marginBottom: 4,
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#eee',
  },
  sponsoredBadge: {
    position: 'absolute', top: 6, right: 8,
    backgroundColor: '#e0e0e0', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1,
  },
  sponsoredBadgeText: { fontSize: 9, color: '#888', fontWeight: '700' },
  sponsoredEmoji: { fontSize: 26 },
  sponsoredTitle: { fontSize: 13, fontWeight: '700', color: '#333' },
  sponsoredSub: { fontSize: 11, color: '#888', marginTop: 1 },
});
