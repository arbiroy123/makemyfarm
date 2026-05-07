import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { farmAPI } from '../../api/client';

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={28} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function SeasonReportScreen({ route }) {
  const { farmId, farmName } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmAPI.getSeasonReport(farmId)
      .then(r => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [farmId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }
  if (!report) {
    return <View style={styles.center}><Text style={styles.errorText}>Could not load report</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Season Report</Text>
        <Text style={styles.headerSub}>{farmName}</Text>
      </View>

      {/* Summary stats */}
      <View style={styles.statsRow}>
        <StatCard icon="leaf-outline"    label="Total Crops"  value={report.total}     color="#4CAF50" />
        <StatCard icon="basket-outline"  label="Harvested"    value={report.harvested} color="#FF9800" />
        <StatCard icon="close-circle-outline" label="Failed"  value={report.failed}    color="#f44336" />
      </View>

      {/* Success rate */}
      <View style={styles.rateCard}>
        <Text style={styles.rateLabel}>Success Rate</Text>
        <Text style={styles.rateValue}>{report.successRate}%</Text>
        <View style={styles.rateBar}>
          <View style={[styles.rateFill, { width: `${report.successRate}%`, backgroundColor: report.successRate >= 70 ? '#4CAF50' : report.successRate >= 40 ? '#FF9800' : '#f44336' }]} />
        </View>
        <Text style={styles.rateHint}>
          {report.successRate >= 80 ? 'Excellent season! 🌟' : report.successRate >= 50 ? 'Good work — keep improving! 🌱' : 'Keep going, every season teaches you more! 💪'}
        </Text>
      </View>

      {/* Total yield */}
      <View style={styles.yieldCard}>
        <Ionicons name="scale-outline" size={32} color="#2e7d32" />
        <Text style={styles.yieldValue}>{report.totalYieldKg.toFixed(1)} kg</Text>
        <Text style={styles.yieldLabel}>Total Yield This Season</Text>
      </View>

      {/* Top crops */}
      {report.topCrops?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Crops</Text>
          {report.topCrops.map((crop, i) => (
            <View key={i} style={styles.cropRow}>
              <Text style={styles.cropRank}>#{i + 1}</Text>
              <Text style={styles.cropName}>{crop.vegetable_name}</Text>
              <Text style={styles.cropYield}>
                {crop.total_yield ? `${parseFloat(crop.total_yield).toFixed(1)} kg` : '—'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Status breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crop Status Breakdown</Text>
        {Object.entries(report.counts || {}).map(([status, count]) => (
          <View key={status} style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] || '#999' }]} />
            <Text style={styles.statusLabel}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
            <Text style={styles.statusCount}>{count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const STATUS_COLORS = {
  planted: '#4CAF50', growing: '#2196F3',
  harvested: '#FF9800', planned: '#9E9E9E', failed: '#f44336',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#c62828' },

  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  statsRow: { flexDirection: 'row', margin: 12, gap: 8 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 12, alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#666', marginTop: 2, textAlign: 'center' },

  rateCard: {
    backgroundColor: '#fff', margin: 12, borderRadius: 12,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  rateLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  rateValue: { fontSize: 40, fontWeight: 'bold', color: '#4CAF50' },
  rateBar: { width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginVertical: 10, overflow: 'hidden' },
  rateFill: { height: '100%', borderRadius: 4 },
  rateHint: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 4 },

  yieldCard: {
    backgroundColor: '#e8f5e9', margin: 12, borderRadius: 12,
    padding: 20, alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: '#4CAF50',
  },
  yieldValue: { fontSize: 36, fontWeight: 'bold', color: '#2e7d32', marginTop: 8 },
  yieldLabel: { fontSize: 13, color: '#388e3c', marginTop: 4 },

  section: {
    backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },

  cropRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cropRank: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', width: 32 },
  cropName: { flex: 1, fontSize: 14, color: '#333' },
  cropYield: { fontSize: 14, fontWeight: '600', color: '#FF9800' },

  statusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  statusLabel: { flex: 1, fontSize: 14, color: '#333', textTransform: 'capitalize' },
  statusCount: { fontSize: 16, fontWeight: '700', color: '#333' },
});
