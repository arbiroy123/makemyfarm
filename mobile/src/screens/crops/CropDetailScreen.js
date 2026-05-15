import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Alert, Share, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cropAPI, achievementsAPI } from '../../api/client';
import { useAuthStore } from '../../store';
import { detectCountry } from '../../utils/country';
import { amazonInUrl, amazonUsUrl, burpeeUrl, flipkartUrl } from '../../utils/affiliateLinks';

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
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [yieldKg, setYieldKg] = useState('');
  const [updating, setUpdating] = useState(false);

  function daysGrown(plantingDate) {
    if (!plantingDate) return null;
    return Math.max(0, Math.floor((new Date() - new Date(plantingDate)) / 86400000));
  }

  useEffect(() => {
    cropAPI.getCropDetail(cropId)
      .then(r => setCrop(r.data))
      .catch(() => setError('Could not load crop details'))
      .finally(() => setLoading(false));
  }, [cropId]);

  // Set header share button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleShare} style={{ marginRight: 14 }}>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [crop]);

  function handleYouTube() {
    const query = encodeURIComponent(`how to grow ${crop?.vegetable_name || ''}`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
  }

  async function handleShare() {
    if (!crop) return;
    const days = daysGrown(crop.planting_date);
    const planted = crop.planting_date ? new Date(crop.planting_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
    const harvest = crop.expected_harvest_date ? new Date(crop.expected_harvest_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '';
    await Share.share({
      message: `🌱 Growing ${crop.vegetable_name} with FarmSync!\n\n📅 Planted: ${planted}\n⏱ Day ${days ?? '?'} of growing\n🌾 Expected harvest: ${harvest}\n\nGrown with FarmSync — Smart farming made accessible.`,
      title: `My ${crop.vegetable_name} on FarmSync`,
    });
  }

  async function markHarvested() {
    if (!yieldKg && yieldKg !== '0') {
      Alert.alert('Yield required', 'Please enter a yield amount (enter 0 if none).');
      return;
    }
    setUpdating(true);
    try {
      await cropAPI.updateCrop(cropId, {
        status: 'harvested',
        yieldQuantity: parseFloat(yieldKg) || 0,
        harvestDate: new Date().toISOString().split('T')[0],
      });
      achievementsAPI.checkAchievements().catch(() => {});
      setCrop(prev => ({ ...prev, status: 'harvested', yield_quantity: parseFloat(yieldKg) || 0 }));
      setShowHarvestModal(false);
      setYieldKg('');
      Alert.alert('Harvested!', 'Your crop has been marked as harvested. 🎉');
    } catch {
      Alert.alert('Error', 'Could not update crop status.');
    } finally {
      setUpdating(false);
    }
  }

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

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FF9800' }]}
          onPress={() => navigation.navigate('DiseaseDetection', { cropId: crop.id, cropName: crop.vegetable_name })}
        >
          <Text style={styles.actionBtnText}>🔬 Diagnose</Text>
        </TouchableOpacity>
        {crop.status !== 'harvested' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}
            onPress={() => setShowHarvestModal(true)}
          >
            <Text style={styles.actionBtnText}>🌾 Harvest</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Harvest yield modal */}
      <Modal visible={showHarvestModal} transparent animationType="slide" onRequestClose={() => setShowHarvestModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Record Harvest 🌾</Text>
            <Text style={styles.modalLabel}>How much did you harvest? (kg)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              placeholder="e.g. 2.5"
              placeholderTextColor="#aaa"
              value={yieldKg}
              onChangeText={setYieldKg}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowHarvestModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, updating && { opacity: 0.6 }]} onPress={markHarvested} disabled={updating}>
                <Text style={styles.modalConfirmText}>{updating ? 'Saving…' : 'Confirm Harvest'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* YouTube search */}
      <TouchableOpacity style={styles.youtubeCta} activeOpacity={0.85} onPress={handleYouTube}>
        <Ionicons name="logo-youtube" size={20} color="#fff" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.youtubeCtaTitle}>Watch on YouTube</Text>
          <Text style={styles.youtubeCtaSub}>How to grow {crop.vegetable_name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Diary CTA */}
      <TouchableOpacity
        style={styles.diaryCta}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CropDiary', {
          cropId: crop.id,
          cropName: crop.vegetable_name,
          plantingDate: crop.planting_date,
        })}
      >
        <Ionicons name="book-outline" size={20} color="#fff" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.diaryCtaTitle}>Crop Diary</Text>
          <Text style={styles.diaryCtaSub}>Photos & notes from planting to harvest</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

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
        <View style={styles.companionCard}>
          <View style={styles.companionCardHeader}>
            <View style={styles.companionCardIconWrap}>
              <Ionicons name="leaf" size={16} color="#2e7d32" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.companionCardTitle}>Grows Well With</Text>
              <Text style={styles.companionCardSubtitle}>Plant nearby for better growth</Text>
            </View>
          </View>
          <View style={styles.companionPillRow}>
            {crop.companion_plants.map(p => (
              <View key={p} style={styles.companionPill}>
                <Text style={styles.companionPillEmoji}>🌱</Text>
                <Text style={styles.companionPillText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Fun fact */}
      {crop.fun_fact ? (
        <View style={styles.funFactCard}>
          <View style={styles.funFactHeader}>
            <Ionicons name="bulb-outline" size={18} color="#e65100" />
            <Text style={styles.funFactTitle}>Did you know?</Text>
          </View>
          <Text style={styles.funFactText}>{crop.fun_fact}</Text>
        </View>
      ) : null}

      {/* Nutrition */}
      {crop.nutrition ? (
        <View style={styles.nutritionCard}>
          <View style={styles.nutritionHeader}>
            <Ionicons name="fitness-outline" size={18} color="#00695c" />
            <Text style={styles.nutritionTitle}>Nutrition</Text>
          </View>
          <Text style={styles.nutritionText}>{crop.nutrition}</Text>
        </View>
      ) : null}

      {/* Simple recipe */}
      {crop.simple_recipe ? (
        <View style={styles.recipeCard}>
          <View style={styles.recipeHeader}>
            <Ionicons name="restaurant-outline" size={18} color="#2e7d32" />
            <Text style={styles.recipeTitle}>Try it in the kitchen</Text>
          </View>
          <Text style={styles.recipeText}>{crop.simple_recipe}</Text>
        </View>
      ) : null}

      {/* Buy seeds — region-aware, affiliate-tagged */}
      {(() => {
        const country = user?.country_code || detectCountry();
        const vegName = crop.vegetable_name;
        const shops = country === 'US'
          ? [
              { label: 'Amazon',       url: amazonUsUrl(`${vegName} seeds`), icon: '📦' },
              { label: 'Burpee Seeds', url: burpeeUrl(vegName),              icon: '🌿' },
            ]
          : [
              { label: 'Amazon.in', url: amazonInUrl(`${vegName} seeds`), icon: '📦' },
              { label: 'Flipkart',  url: flipkartUrl(`${vegName} seeds`), icon: '🛒' },
              { label: 'IndiaMART', url: `https://www.indiamart.com/search.mp?ss=${encodeURIComponent(vegName + ' seeds')}`, icon: '🌱' },
            ];
        return (
          <View style={styles.seedSection}>
            <Text style={styles.seedHeader}>🌱 Buy {crop.vegetable_name} Seeds</Text>
            <View style={styles.seedRow}>
              {shops.map(s => (
                <TouchableOpacity key={s.label} style={styles.seedBtn} onPress={() => Linking.openURL(s.url)} activeOpacity={0.8}>
                  <Text style={styles.seedBtnIcon}>{s.icon}</Text>
                  <Text style={styles.seedBtnLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })()}

      {/* Growing story */}
      {crop.growing_story ? (
        <View style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <Ionicons name="people-outline" size={18} color="#1565c0" />
            <Text style={styles.storyTitle}>From a real grower</Text>
          </View>
          <Text style={styles.storyText}>{crop.growing_story}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  actionRow: { flexDirection: 'row', marginHorizontal: 12, marginTop: 10, gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 14, textAlign: 'center' },
  modalLabel: { fontSize: 13, color: '#555', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#f0f0f0' },
  modalCancelText: { color: '#555', fontWeight: '600' },
  modalConfirm: { flex: 2, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#4CAF50' },
  modalConfirmText: { color: '#fff', fontWeight: '700' },

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

  youtubeCta: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, marginBottom: 0,
    backgroundColor: '#FF0000', borderRadius: 12,
    padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3,
    elevation: 2,
  },
  youtubeCtaTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  youtubeCtaSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  diaryCta: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, marginBottom: 0,
    backgroundColor: '#1976d2', borderRadius: 12,
    padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3,
    elevation: 2,
  },
  diaryCtaTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  diaryCtaSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

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

  companionCard: {
    marginHorizontal: 12, marginTop: 10,
    backgroundColor: '#f1f8e9',
    borderRadius: 16,
    borderWidth: 1, borderColor: '#c8e6c9',
    padding: 14,
  },
  companionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  companionCardIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#c8e6c9', justifyContent: 'center', alignItems: 'center',
  },
  companionCardTitle: { fontSize: 14, fontWeight: '700', color: '#1b5e20' },
  companionCardSubtitle: { fontSize: 11, color: '#558b2f', marginTop: 1 },
  companionPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  companionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: '#a5d6a7',
    paddingHorizontal: 11, paddingVertical: 6,
  },
  companionPillEmoji: { fontSize: 12 },
  companionPillText: { fontSize: 13, color: '#2e7d32', fontWeight: '600' },

  funFactCard: {
    marginHorizontal: 12, marginTop: 10,
    backgroundColor: '#fff8e1', borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: '#FF9800',
    padding: 14,
  },
  funFactHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  funFactTitle: { fontSize: 14, fontWeight: '700', color: '#e65100' },
  funFactText: { fontSize: 13, color: '#4e342e', lineHeight: 20 },

  nutritionCard: {
    marginHorizontal: 12, marginTop: 10,
    backgroundColor: '#e0f2f1', borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: '#00695c',
    padding: 14,
  },
  nutritionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  nutritionTitle: { fontSize: 14, fontWeight: '700', color: '#00695c' },
  nutritionText: { fontSize: 13, color: '#004d40', lineHeight: 20 },

  recipeCard: {
    marginHorizontal: 12, marginTop: 10,
    backgroundColor: '#f1f8e9', borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: '#558b2f',
    padding: 14,
  },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  recipeTitle: { fontSize: 14, fontWeight: '700', color: '#2e7d32' },
  recipeText: { fontSize: 13, color: '#1b5e20', lineHeight: 20 },

  seedSection: { marginHorizontal: 12, marginTop: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#c8e6c9', padding: 14 },
  seedHeader: { fontSize: 14, fontWeight: '700', color: '#2e7d32', marginBottom: 10 },
  seedRow: { flexDirection: 'row', gap: 8 },
  seedBtn: { flex: 1, alignItems: 'center', backgroundColor: '#f1f8f1', borderRadius: 10, paddingVertical: 10, gap: 4 },
  seedBtnIcon: { fontSize: 20 },
  seedBtnLabel: { fontSize: 11, fontWeight: '600', color: '#2e7d32' },

  storyCard: {
    marginHorizontal: 12, marginTop: 10, marginBottom: 10,
    backgroundColor: '#e3f2fd', borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: '#1976d2',
    padding: 14,
  },
  storyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  storyTitle: { fontSize: 14, fontWeight: '700', color: '#1565c0' },
  storyText: { fontSize: 13, color: '#1a237e', lineHeight: 20, fontStyle: 'italic' },
});
