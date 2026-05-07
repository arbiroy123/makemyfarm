import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recommendationAPI, farmAPI } from '../../api/client';
import { useFarmStore } from '../../store';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PlantingCalendarScreen({ navigation }) {
  const { farms } = useFarmStore();
  const [selectedFarm, setSelectedFarm] = useState(farms?.[0]?.id || null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [calData, setCalData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFarm) return;
    setLoading(true);
    recommendationAPI.getCalendar(selectedFarm)
      .then(r => setCalData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedFarm]);

  const monthData = calData?.monthlyPlanting?.[selectedMonth];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planting Calendar</Text>
        {calData && (
          <View style={styles.zoneBadge}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.zoneBadgeText}>{calData.climateZone}</Text>
          </View>
        )}
      </View>

      {/* Farm picker */}
      {farms?.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.farmPicker}>
          {farms.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.farmChip, selectedFarm === f.id && styles.farmChipActive]}
              onPress={() => setSelectedFarm(f.id)}
            >
              <Text style={[styles.farmChipText, selectedFarm === f.id && styles.farmChipTextActive]}>
                {f.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Month scroller */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthRow}>
        {MONTHS.map((m, i) => {
          const monthNum = i + 1;
          const isFrost = calData?.monthlyPlanting?.[monthNum]?.frostRisk;
          return (
            <TouchableOpacity
              key={monthNum}
              style={[
                styles.monthBtn,
                selectedMonth === monthNum && styles.monthBtnActive,
                isFrost && styles.monthBtnFrost,
              ]}
              onPress={() => setSelectedMonth(monthNum)}
            >
              <Text style={[styles.monthBtnText, selectedMonth === monthNum && styles.monthBtnTextActive]}>
                {m}
              </Text>
              {isFrost && <Ionicons name="snow-outline" size={10} color={selectedMonth === monthNum ? '#fff' : '#2196F3'} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>
      ) : !calData ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {farms?.length === 0 ? 'Create a farm first to see your planting calendar.' : 'Could not load calendar.'}
          </Text>
        </View>
      ) : (
        <>
          {/* Frost warning */}
          {monthData?.frostRisk && (
            <View style={styles.frostBanner}>
              <Ionicons name="snow-outline" size={18} color="#1565c0" />
              <Text style={styles.frostText}>Frost risk this month — plant cold-hardy varieties only or use a greenhouse.</Text>
            </View>
          )}

          {/* Safe to plant */}
          {monthData?.safe?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.sectionTitle}>Safe to Plant ({monthData.safe.length})</Text>
              </View>
              <View style={styles.vegGrid}>
                {monthData.safe.slice(0, 20).map(v => (
                  <View key={v.id} style={[styles.vegChip, { backgroundColor: '#e8f5e9' }]}>
                    <Text style={styles.vegChipText}>{v.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Caution */}
          {monthData?.caution?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.dot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.sectionTitle}>With Protection Only ({monthData.caution.length})</Text>
              </View>
              <View style={styles.vegGrid}>
                {monthData.caution.slice(0, 10).map(v => (
                  <View key={v.id} style={[styles.vegChip, { backgroundColor: '#fff3e0' }]}>
                    <Text style={[styles.vegChipText, { color: '#e65100' }]}>{v.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* My crops timeline */}
          {calData.currentCrops?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Active Crops</Text>
              {calData.currentCrops.map(crop => (
                <View key={crop.id} style={styles.cropRow}>
                  <Ionicons name="leaf-outline" size={16} color="#4CAF50" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.cropName}>{crop.vegetable_name}</Text>
                    <Text style={styles.cropDates}>
                      Planted {formatDate(crop.planting_date)} · Harvest {formatDate(crop.expected_harvest_date)}
                    </Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: crop.status === 'growing' ? '#2196F3' : '#4CAF50' }]} />
                </View>
              ))}
            </View>
          )}

          {/* Frost info */}
          {(calData.frostInfo.lastFrost || calData.frostInfo.firstFrost) && (
            <View style={styles.frostInfo}>
              <Text style={styles.frostInfoTitle}>Frost Window for {calData.climateZone}</Text>
              <Text style={styles.frostInfoText}>
                Last frost: Month {calData.frostInfo.lastFrost} · First frost: Month {calData.frostInfo.firstFrost}
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', textAlign: 'center', fontSize: 14 },

  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  zoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  zoneBadgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },

  farmPicker: { paddingHorizontal: 12, paddingVertical: 8 },
  farmChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  farmChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  farmChipText: { fontSize: 13, color: '#555' },
  farmChipTextActive: { color: '#fff', fontWeight: '700' },

  monthRow: { paddingHorizontal: 10, paddingVertical: 10 },
  monthBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, marginRight: 6, backgroundColor: '#fff', alignItems: 'center', minWidth: 48, borderWidth: 1, borderColor: '#e0e0e0' },
  monthBtnActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  monthBtnFrost: { borderColor: '#2196F3' },
  monthBtnText: { fontSize: 12, color: '#555', fontWeight: '600' },
  monthBtnTextActive: { color: '#fff' },

  frostBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#e3f2fd', margin: 12, borderRadius: 10, padding: 12, borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  frostText: { flex: 1, fontSize: 13, color: '#1565c0', lineHeight: 19 },

  section: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 2, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  dot: { width: 10, height: 10, borderRadius: 5 },

  vegGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vegChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  vegChipText: { fontSize: 12, color: '#2e7d32', fontWeight: '500' },

  cropRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cropName: { fontSize: 14, fontWeight: '600', color: '#333' },
  cropDates: { fontSize: 11, color: '#888', marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  frostInfo: { margin: 12, backgroundColor: '#e8f5e9', borderRadius: 10, padding: 12 },
  frostInfoTitle: { fontSize: 13, fontWeight: '700', color: '#2e7d32' },
  frostInfoText: { fontSize: 12, color: '#388e3c', marginTop: 4 },
});
