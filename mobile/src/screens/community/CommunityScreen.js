import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EXPERTS = [
  { name: 'Dr. Ramesh Patel', specialty: 'Soil & Crop Health', flag: '🇮🇳', rating: '4.9' },
  { name: 'Sarah Mitchell', specialty: 'Organic Farming', flag: '🇺🇸', rating: '4.8' },
  { name: 'Dr. Anita Singh', specialty: 'Pest Management', flag: '🇮🇳', rating: '4.7' },
];

const COMING_SOON = [
  { icon: 'people-outline', label: 'Farmer Forums', desc: 'Discuss crops, weather & markets with local growers' },
  { icon: 'storefront-outline', label: 'Co-op Buying', desc: 'Pool orders for seeds & fertilizer at bulk prices' },
  { icon: 'megaphone-outline', label: 'Crop Price Alerts', desc: 'Get notified when mandi/market prices spike' },
];

export default function CommunityScreen() {
  function handleBookExpert(expert) {
    Alert.alert(
      `Book ${expert.name}`,
      `${expert.specialty} specialist\n\nIndia: ₹299/session\nUSA: $4.99/session\n\nThis feature is launching soon!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Get Notified', onPress: () => Linking.openURL('mailto:experts@farmsync.app?subject=Expert Booking Interest') },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="people" size={32} color="#fff" />
        <Text style={styles.headerTitle}>FarmSync Community</Text>
        <Text style={styles.headerSub}>Connect · Learn · Grow together</Text>
      </View>

      {/* Ask a Pro */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={20} color="#6a1b9a" />
          <Text style={styles.sectionTitle}>Ask a Pro</Text>
          <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>COMING SOON</Text></View>
        </View>
        <Text style={styles.sectionDesc}>
          Get a personalised 1-on-1 session with a certified agronomist. AI gives a first answer — experts go deeper.
        </Text>

        {EXPERTS.map((e, i) => (
          <TouchableOpacity key={i} style={styles.expertCard} onPress={() => handleBookExpert(e)} activeOpacity={0.85}>
            <View style={styles.expertAvatar}>
              <Text style={styles.expertFlag}>{e.flag}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.expertName}>{e.name}</Text>
              <Text style={styles.expertSpec}>{e.specialty}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F9A825" />
              <Text style={styles.ratingText}>{e.rating}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.bookAllBtn}
          onPress={() => Linking.openURL('mailto:experts@farmsync.app?subject=Expert Consultation Interest')}
        >
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text style={styles.bookAllBtnText}>Notify Me When Live</Text>
        </TouchableOpacity>
      </View>

      {/* Coming Soon features */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="rocket-outline" size={20} color="#FF9800" />
          <Text style={styles.sectionTitle}>Coming Soon</Text>
        </View>
        {COMING_SOON.map((f, i) => (
          <View key={i} style={styles.comingCard}>
            <View style={styles.comingIcon}>
              <Ionicons name={f.icon} size={20} color="#FF9800" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.comingLabel}>{f.label}</Text>
              <Text style={styles.comingDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: { backgroundColor: '#4CAF50', padding: 24, alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  section: {
    backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', flex: 1 },
  sectionDesc: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 14 },

  liveBadge: { backgroundColor: '#e3f2fd', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  liveBadgeText: { fontSize: 10, fontWeight: '700', color: '#1565c0' },

  expertCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  expertAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
  },
  expertFlag: { fontSize: 22 },
  expertName: { fontSize: 14, fontWeight: '700', color: '#333' },
  expertSpec: { fontSize: 12, color: '#888', marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fff8e1', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#F9A825' },

  bookAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#6a1b9a', borderRadius: 10, padding: 13, marginTop: 14,
  },
  bookAllBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  comingCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  comingIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff3e0', justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  comingLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  comingDesc: { fontSize: 12, color: '#888', marginTop: 3, lineHeight: 17 },
});
