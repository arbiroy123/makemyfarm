import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Alert, Share, Linking, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { cropAPI, achievementsAPI } from '../../api/client';
import { useAuthStore } from '../../store';
import { detectCountry } from '../../utils/country';
import { amazonInUrl, amazonUsUrl, burpeeUrl, flipkartUrl } from '../../utils/affiliateLinks';

const STATUS_COLOR = {
  planted: '#4CAF50', growing: '#2196F3',
  harvested: '#FF9800', planned: '#9E9E9E', failed: '#f44336',
};

const LEVEL_LABEL = {
  novice: 'Novice', beginner: 'Beginner', intermediate: 'Intermediate',
  advanced: 'Advanced', expert: 'Expert',
};

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
  return Math.ceil((new Date(expectedDate) - new Date()) / 86400000);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function growthProgress(plantingDate, harvestDate) {
  if (!plantingDate || !harvestDate) return null;
  const start = new Date(plantingDate).getTime();
  const end = new Date(harvestDate).getTime();
  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
}

// ── Spec tile ─────────────────────────────────────────────────────────────────
function SpecTile({ icon, label, value, color }) {
  return (
    <View style={[styles.specTile, { borderTopColor: color }]}>
      <View style={[styles.specTileIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.specTileValue}>{value}</Text>
      <Text style={styles.specTileLabel}>{label}</Text>
    </View>
  );
}

// ── Temperature range bar ─────────────────────────────────────────────────────
function TempRangeBar({ min, optimal, max }) {
  const range = (max - min) || 1;
  return (
    <View style={styles.tempBarWrap}>
      <View style={styles.tempBarHeader}>
        <Ionicons name="thermometer-outline" size={14} color="#FF7043" />
        <Text style={styles.tempBarTitle}> Temperature range</Text>
      </View>
      <View style={styles.tempBarTrack}>
        <View style={[styles.tempBarCold, { flex: optimal - min }]} />
        <View style={[styles.tempBarWarm, { flex: max - optimal }]} />
      </View>
      <View style={styles.tempBarLabels}>
        <Text style={styles.tempBarMin}>{min}°C min</Text>
        <Text style={styles.tempBarOpt}>{optimal}°C ideal</Text>
        <Text style={styles.tempBarMax}>{max}°C max</Text>
      </View>
    </View>
  );
}

// ── Step wizard ───────────────────────────────────────────────────────────────
function StepWizard({ steps }) {
  const [current, setCurrent] = useState(0);
  if (!steps.length) return null;
  const step = steps[current];
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  return (
    <View style={styles.wizard}>
      <View style={styles.wizardProgressTrack}>
        <View style={[styles.wizardProgressFill, { width: `${((current + 1) / steps.length) * 100}%` }]} />
      </View>
      <Text style={styles.wizardCounter}>{current + 1} of {steps.length}</Text>

      <View style={styles.wizardCard}>
        <View style={styles.wizardNumBadge}>
          <Text style={styles.wizardNumText}>{current + 1}</Text>
        </View>
        <Text style={styles.wizardStepTitle}>{step.title}</Text>
        {step.detail ? <Text style={styles.wizardStepDetail}>{step.detail}</Text> : null}
      </View>

      <View style={styles.wizardNav}>
        <TouchableOpacity
          style={styles.wizardNavBtn}
          onPress={() => setCurrent(c => c - 1)}
          disabled={isFirst}
        >
          <Ionicons name="chevron-back" size={18} color={isFirst ? '#ccc' : '#4CAF50'} />
          <Text style={[styles.wizardNavText, isFirst && styles.wizardNavOff]}>Prev</Text>
        </TouchableOpacity>

        <View style={styles.wizardDots}>
          {steps.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setCurrent(i)}>
              <View style={[styles.wizardDot, i === current && styles.wizardDotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.wizardNavBtn, styles.wizardNavBtnRight]}
          onPress={() => setCurrent(c => c + 1)}
          disabled={isLast}
        >
          <Text style={[styles.wizardNavText, isLast && styles.wizardNavOff]}>Next</Text>
          <Ionicons name="chevron-forward" size={18} color={isLast ? '#ccc' : '#4CAF50'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Care checklist ────────────────────────────────────────────────────────────
function CareChecklist({ steps }) {
  const [checked, setChecked] = useState({});
  return (
    <View>
      {steps.map(step => (
        <TouchableOpacity
          key={step.num}
          style={styles.careItem}
          onPress={() => setChecked(prev => ({ ...prev, [step.num]: !prev[step.num] }))}
          activeOpacity={0.7}
        >
          <View style={[styles.careCheck, checked[step.num] && styles.careCheckDone]}>
            {checked[step.num] ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.careTitle, checked[step.num] && styles.careTitleDone]}>{step.title}</Text>
            {step.detail ? <Text style={styles.careDetail}>{step.detail}</Text> : null}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const NUTRITION_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#F44336'];

// ── Fun fact — tap to reveal ──────────────────────────────────────────────────
function FunFactCard({ text }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <TouchableOpacity
      style={styles.funFactCard}
      onPress={() => setRevealed(true)}
      activeOpacity={revealed ? 1 : 0.85}
    >
      <View style={styles.funFactHeader}>
        <Ionicons name="bulb-outline" size={18} color="#e65100" />
        <Text style={styles.funFactTitle}>Did you know?</Text>
        {!revealed && (
          <View style={styles.funFactTapPill}>
            <Text style={styles.funFactTapText}>tap to reveal</Text>
          </View>
        )}
      </View>
      {revealed ? (
        <Text style={styles.funFactText}>{text}</Text>
      ) : (
        <View style={styles.funFactHidden}>
          <Text style={styles.funFactHiddenIcon}>💡</Text>
          <Text style={styles.funFactHiddenText}>A surprising fact awaits…</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Nutrition — sentence bullets ──────────────────────────────────────────────
function NutritionCard({ text }) {
  const bullets = text.split(/\.\s+/).filter(Boolean).map(s => s.replace(/\.$/, '').trim());
  return (
    <View style={styles.nutritionCard}>
      <View style={styles.nutritionHeader}>
        <Ionicons name="fitness-outline" size={18} color="#00695c" />
        <Text style={styles.nutritionTitle}>Nutrition</Text>
      </View>
      {bullets.map((b, i) => (
        <View key={i} style={styles.nutritionBullet}>
          <View style={[styles.nutritionDot, { backgroundColor: NUTRITION_COLORS[i % NUTRITION_COLORS.length] }]} />
          <Text style={styles.nutritionBulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Recipe card ───────────────────────────────────────────────────────────────
function RecipeCard({ text }) {
  // Data format: "Recipe Name — Instructions text"
  const dashIdx = text.indexOf(' — ');
  const recipeName = dashIdx > -1 ? text.slice(0, dashIdx).trim() : null;
  const instructions = dashIdx > -1 ? text.slice(dashIdx + 3).trim() : text;
  return (
    <View style={styles.recipeCard}>
      <View style={styles.recipeTopBar}>
        <Ionicons name="restaurant-outline" size={14} color="#fff" />
        <Text style={styles.recipeTopBarText}> TRY IT IN THE KITCHEN</Text>
      </View>
      <View style={styles.recipeBody}>
        {recipeName ? <Text style={styles.recipeName}>{recipeName}</Text> : null}
        <Text style={styles.recipeText}>{instructions}</Text>
      </View>
    </View>
  );
}

// ── Story card with audio ─────────────────────────────────────────────────────
function StoryCard({ text }) {
  const [speaking, setSpeaking] = useState(false);

  async function toggleSpeech() {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      Speech.stop();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      Speech.speak(text, {
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  }

  return (
    <View style={styles.storyCard}>
      <Text style={styles.storyQuoteMark}>"</Text>
      <Text style={styles.storyText}>{text}</Text>
      <View style={styles.storyFooter}>
        <Ionicons name="person-circle-outline" size={16} color="#1976d2" />
        <Text style={styles.storyAttrib}>Community grower</Text>
        <TouchableOpacity style={[styles.storyAudioBtn, speaking && styles.storyAudioBtnActive]} onPress={toggleSpeech}>
          <Ionicons name={speaking ? 'stop-circle' : 'volume-medium-outline'} size={16} color={speaking ? '#fff' : '#1976d2'} />
          <Text style={[styles.storyAudioText, speaking && styles.storyAudioTextActive]}>
            {speaking ? 'Stop' : 'Listen'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────────
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

// ── Main screen ───────────────────────────────────────────────────────────────
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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  if (error || !crop) return <View style={styles.center}><Text style={{ color: '#c62828' }}>{error || 'Crop not found'}</Text></View>;

  const plantingSteps = parseSteps(crop.planting_tips);
  const careSteps = parseSteps(crop.care_tips);
  const pestSteps = parseSteps(crop.pest_diseases);
  const days = daysRemaining(crop.expected_harvest_date);
  const prog = growthProgress(crop.planting_date, crop.expected_harvest_date);
  const isExpert = level === 'advanced' || level === 'expert';

  const specTiles = [
    { icon: 'water-outline',  label: 'Watering',    value: `Every ${crop.water_frequency_days}d`,    color: '#2196F3' },
    { icon: 'sunny-outline',  label: 'Sunlight',    value: `${crop.sunlight_hours} hrs/day`,         color: '#FFC107' },
    { icon: 'leaf-outline',   label: 'Soil pH',     value: `${crop.ph_min} – ${crop.ph_max}`,       color: '#66BB6A' },
    { icon: 'resize-outline', label: 'Spacing',     value: `${crop.spacing_cm} cm`,                  color: '#AB47BC' },
    { icon: 'time-outline',   label: 'Harvest in',  value: `${crop.days_to_harvest} days`,           color: '#FF9800' },
    ...(crop.yields_per_plant ? [{ icon: 'basket-outline', label: 'Yield/plant', value: `~${crop.yields_per_plant} kg`, color: '#26A69A' }] : []),
    ...(crop.quantity_planted ? [{ icon: 'apps-outline',   label: 'Plants',      value: `${crop.quantity_planted} planted`, color: '#EC407A' }] : []),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero image */}
      {crop.image_url ? (
        <Image source={{ uri: crop.image_url }} style={styles.headerImage} resizeMode="cover" />
      ) : null}
      <View style={[styles.headerInfo, !crop.image_url && styles.headerInfoNoImg]}>
        <Text style={styles.cropName}>{crop.vegetable_name}</Text>
        {crop.scientific_name ? <Text style={styles.scientific}>{crop.scientific_name}</Text> : null}
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[crop.status] || '#999' }]}>
          <Text style={styles.statusText}>{crop.status?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Actions */}
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

      {/* Harvest modal */}
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

      {/* YouTube + Diary CTAs */}
      <TouchableOpacity style={styles.youtubeCta} activeOpacity={0.85} onPress={handleYouTube}>
        <Ionicons name="logo-youtube" size={20} color="#fff" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.youtubeCtaTitle}>Watch on YouTube</Text>
          <Text style={styles.youtubeCtaSub}>How to grow {crop.vegetable_name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

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

      {/* Timeline + growth progress bar */}
      <View style={styles.timelineCard}>
        <View style={styles.timelineRow}>
          <View style={styles.timelineItem}>
            <Ionicons name="calendar" size={16} color="#4CAF50" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.timelineLabel}>Planted</Text>
              <Text style={styles.timelineValue}>{formatDate(crop.planting_date)}</Text>
            </View>
          </View>
          <View style={styles.timelineDivider} />
          <View style={styles.timelineItem}>
            <Ionicons name="basket" size={16} color="#FF9800" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.timelineLabel}>Harvest</Text>
              <Text style={styles.timelineValue}>{formatDate(crop.expected_harvest_date)}</Text>
            </View>
          </View>
          {days !== null && crop.status !== 'harvested' && (
            <View style={styles.daysChip}>
              <Text style={styles.daysNumber}>{days > 0 ? days : 0}</Text>
              <Text style={styles.daysLabel}>{days > 0 ? 'days left' : 'ready!'}</Text>
            </View>
          )}
        </View>
        {prog !== null && crop.status !== 'harvested' && (
          <View style={styles.growthBarWrap}>
            <View style={styles.growthBarTrack}>
              <View style={[styles.growthBarFill, { width: `${Math.round(prog * 100)}%` }]} />
            </View>
            <View style={styles.growthBarLabels}>
              <Text style={styles.growthBarEdge}>🌱 Planted</Text>
              <Text style={styles.growthBarPct}>{Math.round(prog * 100)}% grown</Text>
              <Text style={styles.growthBarEdge}>🌾 Harvest</Text>
            </View>
          </View>
        )}
      </View>

      {/* Skill level */}
      <View style={styles.levelBar}>
        <Ionicons name="person" size={14} color="#666" />
        <Text style={styles.levelText}>Guide adapted for: </Text>
        <Text style={styles.levelName}>{LEVEL_LABEL[level] || 'Novice'}</Text>
        {isExpert && <Text style={styles.levelNote}> · Expert mode</Text>}
      </View>

      {/* Quick Specs — tile grid */}
      <Section title="Quick Specs" icon="information-circle-outline">
        <View style={styles.specTilesGrid}>
          {specTiles.map(t => <SpecTile key={t.label} {...t} />)}
        </View>
        <TempRangeBar
          min={crop.min_temp_celsius}
          optimal={crop.optimal_temp_celsius}
          max={crop.max_temp_celsius}
        />
      </Section>

      {/* How to Plant — step wizard */}
      {plantingSteps.length > 0 && (
        <Section title="How to Plant" icon="earth-outline">
          <StepWizard steps={plantingSteps} />
        </Section>
      )}

      {/* Ongoing Care — checklist */}
      {careSteps.length > 0 && (
        <Section title="Ongoing Care" icon="flower-outline">
          <CareChecklist steps={careSteps} />
        </Section>
      )}

      {/* Pests & Diseases */}
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
      {crop.fun_fact ? <FunFactCard text={crop.fun_fact} /> : null}

      {/* Nutrition */}
      {crop.nutrition ? <NutritionCard text={crop.nutrition} /> : null}

      {/* Simple recipe */}
      {crop.simple_recipe ? <RecipeCard text={crop.simple_recipe} /> : null}

      {/* Buy seeds */}
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
      {crop.growing_story ? <StoryCard text={crop.growing_story} /> : null}
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

  headerImage: { width: '100%', height: 200 },
  headerInfo: { backgroundColor: '#2e7d32', padding: 16 },
  headerInfoNoImg: { paddingTop: 24 },
  cropName: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  scientific: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  youtubeCta: {
    flexDirection: 'row', alignItems: 'center', margin: 12, marginBottom: 0,
    backgroundColor: '#FF0000', borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 2,
  },
  youtubeCtaTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  youtubeCtaSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  diaryCta: {
    flexDirection: 'row', alignItems: 'center', margin: 12, marginBottom: 0,
    backgroundColor: '#1976d2', borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 2,
  },
  diaryCtaTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  diaryCtaSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  // Timeline
  timelineCard: {
    backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'center' },
  timelineItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  timelineLabel: { fontSize: 11, color: '#888' },
  timelineValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  timelineDivider: { width: 1, height: 32, backgroundColor: '#eee', marginHorizontal: 12 },
  daysChip: {
    alignItems: 'center', backgroundColor: '#f1f8f1',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  daysNumber: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', lineHeight: 26 },
  daysLabel: { fontSize: 10, color: '#888' },
  growthBarWrap: { marginTop: 14 },
  growthBarTrack: { height: 8, backgroundColor: '#e8f5e9', borderRadius: 4, overflow: 'hidden' },
  growthBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
  growthBarLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  growthBarEdge: { fontSize: 10, color: '#888' },
  growthBarPct: { fontSize: 11, fontWeight: '700', color: '#4CAF50' },

  levelBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 4,
    backgroundColor: '#fff', borderRadius: 8, padding: 10,
    borderLeftWidth: 3, borderLeftColor: '#4CAF50',
  },
  levelText: { fontSize: 12, color: '#666', marginLeft: 6 },
  levelName: { fontSize: 12, fontWeight: '700', color: '#2e7d32' },
  levelNote: { fontSize: 12, color: '#888', fontStyle: 'italic' },

  section: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#333' },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14 },

  // Spec tiles
  specTilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  specTile: {
    flexGrow: 1, minWidth: '28%',
    backgroundColor: '#fafafa', borderRadius: 10, borderTopWidth: 3,
    padding: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  specTileIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  specTileValue: { fontSize: 13, fontWeight: '700', color: '#222', textAlign: 'center' },
  specTileLabel: { fontSize: 10, color: '#999', marginTop: 3, textAlign: 'center' },

  // Temp bar
  tempBarWrap: { backgroundColor: '#fff8f3', borderRadius: 10, padding: 12, marginTop: 2 },
  tempBarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tempBarTitle: { fontSize: 11, color: '#888' },
  tempBarTrack: { height: 10, borderRadius: 5, overflow: 'hidden', flexDirection: 'row' },
  tempBarCold: { backgroundColor: '#81d4fa', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 },
  tempBarWarm: { backgroundColor: '#ff8a65', borderTopRightRadius: 5, borderBottomRightRadius: 5 },
  tempBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  tempBarMin: { fontSize: 10, color: '#1565c0' },
  tempBarOpt: { fontSize: 10, fontWeight: '700', color: '#2e7d32', textAlign: 'center' },
  tempBarMax: { fontSize: 10, color: '#c62828' },

  // Step wizard
  wizard: { marginTop: 4 },
  wizardProgressTrack: { height: 4, backgroundColor: '#e8f5e9', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  wizardProgressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 2 },
  wizardCounter: { fontSize: 11, color: '#aaa', textAlign: 'right', marginBottom: 10 },
  wizardCard: {
    backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: '#4CAF50',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  wizardNumBadge: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  wizardNumText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  wizardStepTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 6 },
  wizardStepDetail: { fontSize: 13, color: '#555', lineHeight: 19 },
  wizardNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wizardNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 6, paddingHorizontal: 8 },
  wizardNavBtnRight: { justifyContent: 'flex-end' },
  wizardNavText: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
  wizardNavOff: { color: '#ccc' },
  wizardDots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  wizardDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ddd' },
  wizardDotActive: { backgroundColor: '#4CAF50', width: 18 },

  // Care checklist
  careItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  careCheck: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  careCheckDone: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  careTitle: { fontSize: 13, fontWeight: '600', color: '#222' },
  careTitleDone: { color: '#aaa', textDecorationLine: 'line-through' },
  careDetail: { fontSize: 12, color: '#666', marginTop: 3, lineHeight: 17 },

  pestCard: {
    backgroundColor: '#fff8f0', borderRadius: 8, borderLeftWidth: 3,
    borderLeftColor: '#FF9800', padding: 10, marginBottom: 8,
  },
  pestName: { fontSize: 13, fontWeight: '700', color: '#e65100' },
  pestDetail: { fontSize: 12, color: '#555', marginTop: 3, lineHeight: 17 },

  companionCard: {
    marginHorizontal: 12, marginTop: 10, backgroundColor: '#f1f8e9',
    borderRadius: 16, borderWidth: 1, borderColor: '#c8e6c9', padding: 14,
  },
  companionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  companionCardIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#c8e6c9', justifyContent: 'center', alignItems: 'center' },
  companionCardTitle: { fontSize: 14, fontWeight: '700', color: '#1b5e20' },
  companionCardSubtitle: { fontSize: 11, color: '#558b2f', marginTop: 1 },
  companionPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  companionPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#a5d6a7', paddingHorizontal: 11, paddingVertical: 6 },
  companionPillEmoji: { fontSize: 12 },
  companionPillText: { fontSize: 13, color: '#2e7d32', fontWeight: '600' },

  // Fun fact — tap to reveal
  funFactCard: { marginHorizontal: 12, marginTop: 10, backgroundColor: '#fff8e1', borderRadius: 12, borderWidth: 1, borderColor: '#FFE082', padding: 14 },
  funFactHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  funFactTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#e65100' },
  funFactTapPill: { backgroundColor: '#FF9800', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  funFactTapText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  funFactHidden: { alignItems: 'center', paddingVertical: 12, gap: 6 },
  funFactHiddenIcon: { fontSize: 28 },
  funFactHiddenText: { fontSize: 13, color: '#BF8000', fontStyle: 'italic' },
  funFactText: { fontSize: 13, color: '#4e342e', lineHeight: 20 },

  // Nutrition — bullet sentences
  nutritionCard: { marginHorizontal: 12, marginTop: 10, backgroundColor: '#e0f2f1', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#00695c', padding: 14 },
  nutritionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  nutritionTitle: { fontSize: 14, fontWeight: '700', color: '#00695c' },
  nutritionBullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 7 },
  nutritionDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  nutritionBulletText: { flex: 1, fontSize: 13, color: '#004d40', lineHeight: 19 },

  // Recipe card — named recipe style
  recipeCard: { marginHorizontal: 12, marginTop: 10, backgroundColor: '#FAFAF0', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#C8E6C9' },
  recipeTopBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#558b2f', paddingHorizontal: 14, paddingVertical: 8 },
  recipeTopBarText: { fontSize: 11, color: '#fff', fontWeight: '700', letterSpacing: 0.8 },
  recipeBody: { padding: 14 },
  recipeName: { fontSize: 17, fontWeight: '800', color: '#2e7d32', marginBottom: 8 },
  recipeText: { fontSize: 13, color: '#33691e', lineHeight: 20 },

  seedSection: { marginHorizontal: 12, marginTop: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#c8e6c9', padding: 14 },
  seedHeader: { fontSize: 14, fontWeight: '700', color: '#2e7d32', marginBottom: 10 },
  seedRow: { flexDirection: 'row', gap: 8 },
  seedBtn: { flex: 1, alignItems: 'center', backgroundColor: '#f1f8f1', borderRadius: 10, paddingVertical: 10, gap: 4 },
  seedBtnIcon: { fontSize: 20 },
  seedBtnLabel: { fontSize: 11, fontWeight: '600', color: '#2e7d32' },

  // Story — typographic quote card with audio
  storyCard: { marginHorizontal: 12, marginTop: 10, marginBottom: 10, backgroundColor: '#e3f2fd', borderRadius: 12, padding: 16 },
  storyQuoteMark: { fontSize: 56, lineHeight: 48, color: '#90CAF9', fontWeight: '900', marginBottom: -8 },
  storyText: { fontSize: 13, color: '#1a237e', lineHeight: 21, fontStyle: 'italic', marginBottom: 12 },
  storyFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#BBDEFB', paddingTop: 10 },
  storyAttrib: { flex: 1, fontSize: 12, color: '#1976d2', fontWeight: '600' },
  storyAudioBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#1976d2' },
  storyAudioBtnActive: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  storyAudioText: { fontSize: 12, fontWeight: '700', color: '#1976d2' },
  storyAudioTextActive: { color: '#fff' },
});
