import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, Linking, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { schemesAPI } from '../../api/client';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'income_support', label: 'Income Support' },
  { id: 'crop_insurance', label: 'Crop Insurance' },
  { id: 'credit', label: 'Credit / Loan' },
  { id: 'organic', label: 'Organic' },
  { id: 'conservation', label: 'Conservation' },
  { id: 'solar_energy', label: 'Solar / Energy' },
  { id: 'market_access', label: 'Market Access' },
  { id: 'soil_health', label: 'Soil Health' },
  { id: 'infrastructure', label: 'Infrastructure' },
];

const CATEGORY_COLORS = {
  income_support: '#4CAF50',
  crop_insurance: '#2196F3',
  credit: '#FF9800',
  organic: '#8BC34A',
  conservation: '#009688',
  solar_energy: '#FFC107',
  market_access: '#9C27B0',
  soil_health: '#795548',
  infrastructure: '#607D8B',
};

export default function GovernmentSchemesScreen() {
  const [country, setCountry] = useState('IN');
  const [schemes, setSchemes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => { loadSchemes(); }, [country]);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFiltered(schemes);
    } else {
      setFiltered(schemes.filter(s => s.category === activeCategory));
    }
  }, [activeCategory, schemes]);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const res = await schemesAPI.getSchemes(country);
      setSchemes(res.data.schemes || []);
      setFiltered(res.data.schemes || []);
      setActiveCategory('all');
    } catch {
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const renderSchemeCard = ({ item }) => {
    const color = CATEGORY_COLORS[item.category] || '#4CAF50';
    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelectedScheme(item)}>
        <View style={[styles.cardAccent, { backgroundColor: color }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.schemeName}>{item.name}</Text>
              {item.fullName && country === 'IN' && (
                <Text style={styles.schemeNameHindi}>{item.fullName}</Text>
              )}
              {item.fullName && country === 'US' && (
                <Text style={styles.schemeNameHindi}>{item.fullName}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#bbb" />
          </View>
          <View style={[styles.benefitBadge, { backgroundColor: `${color}18` }]}>
            <Ionicons name="gift-outline" size={13} color={color} />
            <Text style={[styles.benefitText, { color }]} numberOfLines={2}>
              {item.benefit}
            </Text>
          </View>
          <Text style={styles.ministry} numberOfLines={1}>{item.ministry}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Country Toggle */}
      <View style={styles.countryToggle}>
        <TouchableOpacity
          style={[styles.countryBtn, country === 'IN' && styles.countryBtnActive]}
          onPress={() => setCountry('IN')}
        >
          <Text style={styles.flag}>🇮🇳</Text>
          <Text style={[styles.countryLabel, country === 'IN' && styles.countryLabelActive]}>India</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.countryBtn, country === 'US' && styles.countryBtnActive]}
          onPress={() => setCountry('US')}
        >
          <Text style={styles.flag}>🇺🇸</Text>
          <Text style={[styles.countryLabel, country === 'US' && styles.countryLabelActive]}>USA</Text>
        </TouchableOpacity>
        <View style={[styles.countryBtn, styles.countryBtnSoon]}>
          <Text style={styles.flag}>🌍</Text>
          <Text style={styles.countryLabelSoon}>More Soon</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, activeCategory === cat.id && styles.filterChipActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={[styles.filterChipText, activeCategory === cat.id && styles.filterChipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderSchemeCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No schemes found for this category.</Text>
            </View>
          }
        />
      )}

      {/* Scheme Detail Modal */}
      <Modal visible={!!selectedScheme} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedScheme && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle}>{selectedScheme.name}</Text>
                      {selectedScheme.fullName && (
                        <Text style={styles.modalSubtitle}>{selectedScheme.fullName}</Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => setSelectedScheme(null)}>
                      <Ionicons name="close-circle" size={28} color="#bbb" />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.benefitBox, { borderColor: CATEGORY_COLORS[selectedScheme.category] || '#4CAF50' }]}>
                    <Ionicons name="gift" size={18} color={CATEGORY_COLORS[selectedScheme.category] || '#4CAF50'} />
                    <Text style={styles.benefitBoxText}>{selectedScheme.benefit}</Text>
                  </View>

                  <Text style={styles.detailLabel}>About</Text>
                  <Text style={styles.detailText}>{selectedScheme.description}</Text>

                  <Text style={styles.detailLabel}>How to Apply</Text>
                  <Text style={styles.detailText}>{selectedScheme.howToApply}</Text>

                  {selectedScheme.documents && (
                    <>
                      <Text style={styles.detailLabel}>Documents Required</Text>
                      {selectedScheme.documents.map((doc, i) => (
                        <View key={i} style={styles.docRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                          <Text style={styles.docText}>{doc}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  <Text style={styles.detailLabel}>Ministry / Agency</Text>
                  <Text style={styles.detailText}>{selectedScheme.ministry}</Text>

                  {selectedScheme.tags && (
                    <View style={styles.tagsRow}>
                      {selectedScheme.tags.map((tag, i) => (
                        <View key={i} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {selectedScheme.applyUrl && (
                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={() => Linking.openURL(selectedScheme.applyUrl)}
                    >
                      <Ionicons name="open-outline" size={18} color="#fff" />
                      <Text style={styles.applyBtnText}>Apply / Learn More</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.kisanBtn}
                    onPress={() => { setSelectedScheme(null); }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#4CAF50" />
                    <Text style={styles.kisanBtnText}>Ask KisanBot how to apply →</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyText: { color: '#aaa', fontSize: 15, textAlign: 'center' },
  countryToggle: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  countryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  countryBtnActive: { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
  countryBtnSoon: { borderStyle: 'dashed', opacity: 0.6 },
  flag: { fontSize: 20 },
  countryLabel: { fontSize: 14, color: '#888', fontWeight: '500' },
  countryLabelActive: { color: '#2e7d32', fontWeight: '700' },
  countryLabelSoon: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  filterRow: { maxHeight: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa', marginVertical: 6 },
  filterChipActive: { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
  filterChipText: { fontSize: 12, color: '#666' },
  filterChipTextActive: { color: '#2e7d32', fontWeight: '700' },
  list: { padding: 12, paddingBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, flexDirection: 'row', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4 },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  schemeName: { fontSize: 16, fontWeight: '700', color: '#333' },
  schemeNameHindi: { fontSize: 12, color: '#888', marginTop: 2 },
  benefitBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, borderRadius: 8, padding: 8, marginBottom: 8 },
  benefitText: { fontSize: 13, fontWeight: '500', flex: 1 },
  ministry: { fontSize: 11, color: '#aaa' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  modalSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  benefitBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1.5, borderRadius: 10, padding: 12, marginBottom: 16 },
  benefitBoxText: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1 },
  detailLabel: { fontSize: 13, fontWeight: '700', color: '#4CAF50', marginBottom: 4, marginTop: 12 },
  detailText: { fontSize: 14, color: '#555', lineHeight: 21 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  docText: { fontSize: 13, color: '#555', flex: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 11, color: '#666' },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4CAF50', borderRadius: 12, padding: 15, marginTop: 20 },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  kisanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#4CAF50', borderRadius: 12, padding: 12, marginTop: 10 },
  kisanBtnText: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },
});
