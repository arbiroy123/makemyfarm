import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cropAPI } from '../../api/client';
import { useAuthStore } from '../../store';

const STATUS_COLOR = {
  planted: '#4CAF50', growing: '#2196F3',
  harvested: '#FF9800', planned: '#9E9E9E', failed: '#f44336',
};

const LEVEL_ORDER = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];
const LEVEL_LABEL = {
  novice: 'Novice', beginner: 'Beginner', intermediate: 'Intermediate',
  advanced: 'Advanced', expert: 'Expert',
};

// Parse pipe-separated "Title: Detail" steps
function parseSteps(text) {
  if (!text) return [];
  return text.split('|').map((raw, i) => {
    const idx = raw.indexOf(': ');
    if (idx > -1) return { num: i + 1, title: raw.slice(0, idx).trim(), detail: raw.slice(idx + 2).trim() };
    return { num: i + 1, title: raw.trim(), detail: '' };
  }).filter(s => s.title);
}

function daysRemaining(expectedDate) {
  if (!expectedDate) return null;
  const diff = Math.ceil((new Date(expectedDate) - new Date()) / 86400000);
  return diff;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Specs row
function SpecRow({ icon, label, value }) {
  return (
    <View style={styles.specRow}>
      <Ionicons name={icon} size={16} color="#4CAF50" />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

// A single step rendered based on skill level
function StepCard({ step, level }) {
  const isExpert = level === 'advanced' || level === 'expert';
  const isNovice = level === 'novice' || level === 'beginner';

  if (isExpert) {
    return (
      <View style={styles.stepExpert}>
        <Text style={styles.stepExpertBullet}>▸</Text>
        <Text style={styles.stepExpertText}>{step.title}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.stepCard, isNovice && styles.stepCardNovice]}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{step.num}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        {isNovice && step.detail ? (
          <Text style={styles.stepDetail}>{step.detail}</Text>
        ) : null}
        {!isNovice && !isExpert && step.detail ? (
          <Text style={styles.stepDetailMid}>{step.detail.split('.')[0]}.</Text>
        ) : null}
      </View>
    </View>
  );
}

function Section({ title, icon, children, collapsed = false }) {
  const [open, setOpen] = useState(!collapsed);
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <Ionicons name={icon} size={18} color="#4CAF50" />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#aaa" />
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function CropDetailScreen({ route, navigation }) {
  const { cropId } = route.params;
  const { user } = useAuthStore();
  const level = user?.experienceLevel || user?.experience_level || 'novice';

  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cropAPI.getCropDetail(cropId)
      .then(r => setCrop(r.data))
      .catch(() => setError('Could not load crop details'))
      .finally(() => setLoading(false));
  }, [cropId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }
  if (error || !crop) {
    return <View style={styles.center}><Text style={{ color: '#c62828' }}>{error || 'Crop not found'}</Text></View>;
  }

  const plantingSteps = parseSteps(crop.planting_tips);
  const careSteps = parseSteps(crop.care_tips);
  const pestSteps = parseSteps(crop.pest_diseases);
  const days = daysRemaining(crop.expected_harvest_date);
  const isExpert = level === 'advanced' || level === 'expert';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.cropName}>{crop.vegetable_name}</Text>
        {crop.scientific_name ? (
          <Text style={styles.scientific}>{crop.scientific_name}</Text>
        ) : null}
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[crop.status] || '#999' }]}>
          <Text style={styles.statusText}>{crop.status?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timelineCard}>
        <View style={styles.timelineItem}>
          <Ionicons name="calendar" size={16} color="#4CAF50" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.timelineLabel}>Planted</Text>
            <Text style={styles.timelineValue}>{formatDate(crop.planting_date)}</Text>
          </View>
        </View>
        <View style={styles.timelineDivider} />
        <View style={styles.timelineItem}>
          <Ionicons name="basket" size={16} color="#FF9800" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.timelineLabel}>Expected Harvest</Text>
            <Text style={styles.timelineValue}>{formatDate(crop.expected_harvest_date)}</Text>
          </View>
        </View>
        {days !== null && crop.status !== 'harvested' && (
          <View style={styles.daysRemaining}>
            <Text style={styles.daysNumber}>{days > 0 ? days : 0}</Text>
            <Text style={styles.daysLabel}>{days > 0 ? 'days to harvest' : 'harvest time!'}</Text>
          </View>
        )}
      </View>

      {/* Skill level indicator */}
      <View style={styles.levelBar}>
        <Ionicons name="person" size={14} color="#666" />
        <Text style={styles.levelText}>Guide adapted for: </Text>
        <Text style={styles.levelName}>{LEVEL_LABEL[level] || 'Novice'}</Text>
        {isExpert && <Text style={styles.levelNote}> · Basics omitted</Text>}
      </View>

      {/* Quick specs — always shown */}
      <Section title="Quick Specs" icon="information-circle-outline">
        <SpecRow icon="thermometer-outline" label="Temperature" value={`${crop.min_temp_celsius}°C – ${crop.max_temp_celsius}°C (ideal ${crop.optimal_temp_celsius}°C)`} />
        <SpecRow icon="water-outline" label="Watering" value={`Every ${crop.water_frequency_days} days`} />
        <SpecRow icon="sunny-outline" label="Sunlight" value={`${crop.sunlight_hours} hrs/day`} />
        <SpecRow icon="leaf-outline" label="Soil pH" value={`${crop.ph_min} – ${crop.ph_max}`} />
        <SpecRow icon="resize-outline" label="Spacing" value={`${crop.spacing_cm} cm`} />
        <SpecRow icon="time-outline" label="Days to harvest" value={`${crop.days_to_harvest} days`} />
        {crop.yields_per_plant ? (
          <SpecRow icon="basket-outline" label="Yield per plant" value={`~${crop.yields_per_plant} kg`} />
        ) : null}
        {crop.quantity_planted ? (
          <SpecRow icon="apps-outline" label="Plants" value={`${crop.quantity_planted} planted`} />
        ) : null}
      </Section>

      {/* Planting guide */}
      {!isExpert || plantingSteps.length > 0 ? (
        <Section title="How to Plant" icon="earth-outline" collapsed={isExpert}>
          {isExpert && (
            <Text style={styles.expertNote}>Key steps only — expand for detail</Text>
          )}
          {plantingSteps.map(step => (
            <StepCard key={step.num} step={step} level={level} />
          ))}
        </Section>
      ) : null}

      {/* Care guide */}
      <Section title="Ongoing Care" icon="flower-outline">
        {careSteps.map(step => (
          <StepCard key={step.num} step={step} level={level} />
        ))}
      </Section>

      {/* Pests & diseases */}
      <Section title="Pests & Diseases" icon="bug-outline" collapsed={true}>
        {pestSteps.map(step => (
          <View key={step.num} style={styles.pestCard}>
            <Text style={styles.pestName}>{step.title}</Text>
            {step.detail ? <Text style={styles.pestDetail}>{step.detail}</Text> : null}
          </View>
        ))}
      </Section>

      {/* Companion plants */}
      {crop.companion_plants?.length > 0 && (
        <Section title="Companion Plants" icon="heart-outline" collapsed={true}>
          <View style={styles.companionRow}>
            {crop.companion_plants.map(p => (
              <View key={p} style={styles.companionChip}>
                <Text style={styles.companionText}>{p}</Text>
              </View>
            ))}
          </View>
        </Section>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: '#4CAF50', padding: 20, paddingTop: 24,
  },
  cropName: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  scientific: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start', marginTop: 10,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  timelineCard: {
    backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
    elevation: 2,
  },
  timelineItem: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 130 },
  timelineLabel: { fontSize: 11, color: '#888' },
  timelineValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  timelineDivider: { width: 1, height: 32, backgroundColor: '#eee', marginHorizontal: 12 },
  daysRemaining: { alignItems: 'center', marginLeft: 12 },
  daysNumber: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50' },
  daysLabel: { fontSize: 11, color: '#888' },

  levelBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginBottom: 4,
    backgroundColor: '#fff', borderRadius: 8, padding: 10,
    borderLeftWidth: 3, borderLeftColor: '#4CAF50',
  },
  levelText: { fontSize: 12, color: '#666', marginLeft: 6 },
  levelName: { fontSize: 12, fontWeight: '700', color: '#2e7d32' },
  levelNote: { fontSize: 12, color: '#888', fontStyle: 'italic' },

  section: {
    backgroundColor: '#fff', marginHorizontal: 12, marginTop: 10,
    borderRadius: 12, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10,
  },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#333' },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14 },
  expertNote: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 8 },

  specRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  specLabel: { flex: 1, fontSize: 13, color: '#555', marginLeft: 10 },
  specValue: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'right', maxWidth: '55%' },

  // Step cards
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#f9f9f9', borderRadius: 8,
    padding: 10, marginBottom: 8,
  },
  stepCardNovice: { backgroundColor: '#f1f8f1', borderLeftWidth: 3, borderLeftColor: '#a5d6a7' },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center',
    marginRight: 10, flexShrink: 0,
  },
  stepNumText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  stepTitle: { fontSize: 13, fontWeight: '600', color: '#222' },
  stepDetail: { fontSize: 12, color: '#555', marginTop: 4, lineHeight: 18 },
  stepDetailMid: { fontSize: 12, color: '#666', marginTop: 3 },

  stepExpert: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  stepExpertBullet: { color: '#4CAF50', fontWeight: 'bold', marginRight: 8, fontSize: 14 },
  stepExpertText: { fontSize: 13, color: '#333', flex: 1 },

  pestCard: {
    backgroundColor: '#fff8f0', borderRadius: 8, borderLeftWidth: 3,
    borderLeftColor: '#FF9800', padding: 10, marginBottom: 8,
  },
  pestName: { fontSize: 13, fontWeight: '700', color: '#e65100' },
  pestDetail: { fontSize: 12, color: '#555', marginTop: 3, lineHeight: 17 },

  companionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  companionChip: {
    backgroundColor: '#e8f5e9', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  companionText: { fontSize: 13, color: '#2e7d32', fontWeight: '500' },
});
