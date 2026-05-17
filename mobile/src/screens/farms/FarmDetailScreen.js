import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { farmAPI, cropAPI } from '../../api/client';
import { CropCardSkeleton } from '../../components/Skeleton';
import { C, R, Sh } from '../../theme';

const STATUS_COLOR = {
  planted:   C.planted,
  growing:   C.growing,
  harvested: C.harvested,
  failed:    C.failed,
  planned:   C.planned,
};

const STATUS_ICON = {
  planted:   'arrow-down-circle-outline',
  growing:   'trending-up-outline',
  harvested: 'basket-outline',
  failed:    'close-circle-outline',
  planned:   'time-outline',
};

const FARM_TYPE_META = {
  backyard:   { icon: 'home-outline',     color: C.farmType.backyard   },
  greenhouse: { icon: 'leaf-outline',     color: C.farmType.greenhouse },
  field:      { icon: 'earth-outline',    color: C.farmType.field      },
  rooftop:    { icon: 'business-outline', color: C.farmType.rooftop    },
  balcony:    { icon: 'flower-outline',   color: C.farmType.balcony    },
  community:  { icon: 'people-outline',   color: C.farmType.community  },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function harvestCountdownColor(days) {
  if (days === null) return C.muted;
  if (days < 0)   return C.harvested;
  if (days <= 7)  return C.failed;
  if (days <= 14) return C.harvested;
  return C.growing;
}

function harvestCountdownLabel(days) {
  if (days === null) return null;
  if (days < 0)  return 'Harvest overdue!';
  if (days === 0) return 'Harvest today!';
  return `Harvest in ${days}d`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const VEGGIE_EMOJI = {
  tomato: '🍅', pepper: '🫑', lettuce: '🥬', carrot: '🥕', cucumber: '🥒',
  bean: '🫘', pea: '🫛', corn: '🌽', potato: '🥔', onion: '🧅', garlic: '🧄',
  spinach: '🥬', broccoli: '🥦', eggplant: '🍆', okra: '🌱',
};
function vegEmoji(name) {
  const l = (name || '').toLowerCase();
  return Object.entries(VEGGIE_EMOJI).find(([k]) => l.includes(k))?.[1] || '🌱';
}

// Crop card with press-scale and staggered entrance animation
function CropCard({ item, onPress, entranceAnim }) {
  const scale = useRef(new Animated.Value(1)).current;
  const statusColor = STATUS_COLOR[item.status] || C.muted;
  const statusIcon  = STATUS_ICON[item.status]  || 'leaf-outline';
  const days        = daysUntil(item.expected_harvest_date);
  const cdColor     = harvestCountdownColor(days);
  const cdLabel     = harvestCountdownLabel(days);

  return (
    <Animated.View style={{
      opacity: entranceAnim,
      transform: [
        { translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
        { scale },
      ],
    }}>
      <TouchableOpacity
        style={[s.cropCard, Sh.xs]}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 10, tension: 80 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()}
        activeOpacity={1}
      >
        <View style={[s.cropAccent, { backgroundColor: statusColor }]} />
        <View style={s.cropBody}>
          <View style={s.cropTop}>
            <Text style={s.cropEmoji}>{vegEmoji(item.vegetable_name)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cropName}>{item.vegetable_name}</Text>
              <Text style={s.cropPlanted}>Planted {fmtDate(item.planting_date)}</Text>
            </View>
            <View style={[s.statusChip, { backgroundColor: statusColor + '1A' }]}>
              <Ionicons name={statusIcon} size={12} color={statusColor} />
              <Text style={[s.statusTxt, { color: statusColor }]}>{item.status}</Text>
            </View>
          </View>
          {cdLabel && (
            <View style={[s.countdownRow, { borderTopColor: C.border }]}>
              <Ionicons name="timer-outline" size={13} color={cdColor} />
              <Text style={[s.countdownTxt, { color: cdColor }]}>{cdLabel}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function FarmDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { farmId } = route.params;
  const [farm, setFarm]       = useState(null);
  const [crops, setCrops]     = useState([]);
  const [loading, setLoading] = useState(true);

  // Pre-allocated entrance animations for up to 20 crop cards
  const cropAnims = useRef(Array.from({ length: 20 }, () => new Animated.Value(0))).current;

  useEffect(() => { loadFarmDetails(); }, []);

  const loadFarmDetails = async () => {
    try {
      const [farmRes, cropsRes] = await Promise.all([
        farmAPI.getFarmDetail(farmId),
        cropAPI.getFarmCrops(farmId),
      ]);
      setFarm(farmRes.data);
      setCrops(cropsRes.data);
      const count = cropsRes.data.length;
      if (count > 0) {
        Animated.stagger(
          60,
          cropAnims.slice(0, count).map(a =>
            Animated.spring(a, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true })
          )
        ).start();
      }
    } catch (error) {
      console.error('Failed to load farm details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScrollView style={s.root} showsVerticalScrollIndicator={false}>
        {/* Hero placeholder — keeps the green bar visible while loading */}
        <View style={[s.hero, { minHeight: 110 }]}>
          <View style={[s.heroDeco, s.decoA]} />
          <View style={[s.heroDeco, s.decoB]} />
        </View>
        {/* Crop skeletons */}
        <View style={s.section}>
          <View style={[s.sectionHeader, { marginBottom: 12 }]}>
            <View style={{ width: 100, height: 17, backgroundColor: C.border, borderRadius: R.sm, opacity: 0.5 }} />
          </View>
          <View style={{ gap: 8 }}>
            <CropCardSkeleton />
            <CropCardSkeleton />
            <CropCardSkeleton />
          </View>
        </View>
      </ScrollView>
    );
  }

  if (!farm) {
    return <View style={s.center}><Text style={{ color: C.muted }}>{t('farmNotFound')}</Text></View>;
  }

  const typeMeta   = FARM_TYPE_META[farm.farm_type] || FARM_TYPE_META.backyard;
  const activeCrops = crops.filter(c => c.status !== 'harvested' && c.status !== 'failed').length;

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false}>

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <View style={s.hero}>
        <View style={[s.heroDeco, s.decoA]} />
        <View style={[s.heroDeco, s.decoB]} />
        <View style={s.heroContent}>
          <View style={[s.farmTypeIcon, { backgroundColor: typeMeta.color + '22' }]}>
            <Ionicons name={typeMeta.icon} size={22} color={typeMeta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroName}>{farm.name}</Text>
            <Text style={s.heroType}>{farm.farm_type}</Text>
          </View>
        </View>
        <View style={s.statRow}>
          <View style={s.statChip}>
            <Ionicons name="expand-outline" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={s.statTxt}>{farm.size_sqft} sq ft</Text>
          </View>
          <View style={s.statChip}>
            <Ionicons name="leaf-outline" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={s.statTxt}>{activeCrops} active crops</Text>
          </View>
          {farm.collaborators?.length > 0 && (
            <View style={s.statChip}>
              <Ionicons name="people-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={s.statTxt}>{farm.collaborators.length} {farm.collaborators.length === 1 ? 'person' : 'people'}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Info card ───────────────────────────────────────────────────── */}
      <View style={[s.infoCard, Sh.xs]}>
        {farm.address ? (
          <View style={s.infoRow}>
            <View style={s.infoIcon}><Ionicons name="location-outline" size={16} color={C.primary} /></View>
            <Text style={s.infoTxt}>{farm.address}</Text>
          </View>
        ) : null}
        {farm.climate_zone ? (
          <View style={[s.infoRow, { borderTopWidth: farm.address ? 1 : 0, borderTopColor: C.border }]}>
            <View style={s.infoIcon}><Ionicons name="partly-sunny-outline" size={16} color={C.primary} /></View>
            <Text style={s.infoTxt}>{farm.climate_zone} climate zone</Text>
          </View>
        ) : null}
      </View>

      {/* ── Crops ───────────────────────────────────────────────────────── */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{t('cropsCount', { count: crops.length })}</Text>
          <TouchableOpacity
            style={s.plantBtn}
            onPress={() => navigation.navigate('PlantCrop', { farmId })}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={s.plantBtnTxt}>Plant Crop</Text>
          </TouchableOpacity>
        </View>

        {crops.length === 0 ? (
          <View style={s.emptyCrops}>
            <Text style={s.emptyCropsIcon}>🌱</Text>
            <Text style={s.emptyCropsTxt}>{t('noCropsYet')}</Text>
            <Text style={s.emptyCropsSub}>Tap "Plant Crop" to get started</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {crops.map((item, i) => (
              <CropCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('CropDetail', { cropId: item.id })}
                entranceAnim={cropAnims[i]}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── Quick links ─────────────────────────────────────────────────── */}
      <View style={[s.quickCard, Sh.xs]}>
        {[
          { icon: 'stats-chart-outline', label: 'Season Report',     color: C.feature.financials, onPress: () => navigation.navigate('SeasonReport', { farmId, farmName: farm.name }) },
          { icon: 'calendar-outline',    label: 'Planting Calendar', color: C.feature.schemes,    onPress: () => navigation.navigate('PlantingCalendar') },
          { icon: 'grid-outline',        label: 'Garden Planner',    color: C.feature.succession, onPress: () => navigation.navigate('GardenPlanner') },
        ].map((item, i, arr) => (
          <TouchableOpacity
            key={item.label}
            style={[s.quickRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
            onPress={item.onPress}
            activeOpacity={0.75}
          >
            <View style={[s.quickIcon, { backgroundColor: item.color + '1A' }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={s.quickLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.border} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.page },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Hero
  hero: { backgroundColor: C.forest, paddingBottom: 16, overflow: 'hidden' },
  heroDeco: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)' },
  decoA:    { width: 220, height: 220, top: -80, right: -50 },
  decoB:    { width: 140, height: 140, bottom: -50, left: 10 },
  heroContent: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 16, marginBottom: 14,
  },
  farmTypeIcon: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center',
  },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroType: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2, textTransform: 'capitalize', fontWeight: '500' },
  statRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 5,
  },
  statTxt: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // Info card
  infoCard: {
    backgroundColor: C.card, marginHorizontal: 16, marginTop: 14,
    borderRadius: R.md, overflow: 'hidden', borderWidth: 1, borderColor: C.border,
  },
  infoRow:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  infoIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.pale, justifyContent: 'center', alignItems: 'center' },
  infoTxt:  { flex: 1, fontSize: 14, color: C.sub, fontWeight: '500' },

  // Section
  section:       { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { fontSize: 17, fontWeight: '800', color: C.ink },
  plantBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.primary, borderRadius: R.pill,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  plantBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Crop cards
  cropCard: {
    backgroundColor: C.card, borderRadius: R.md,
    flexDirection: 'row', overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
  },
  cropAccent: { width: 4 },
  cropBody:   { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  cropTop:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cropEmoji:  { fontSize: 26 },
  cropName:   { fontSize: 15, fontWeight: '700', color: C.ink },
  cropPlanted:{ fontSize: 11, color: C.muted, marginTop: 2 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusTxt:   { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  countdownRow:{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  countdownTxt:{ fontSize: 12, fontWeight: '600' },

  // Empty crops
  emptyCrops:    { alignItems: 'center', paddingVertical: 28 },
  emptyCropsIcon:{ fontSize: 36, marginBottom: 8 },
  emptyCropsTxt: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 4 },
  emptyCropsSub: { fontSize: 13, color: C.muted },

  // Quick links
  quickCard: {
    backgroundColor: C.card, marginHorizontal: 16, marginTop: 20,
    borderRadius: R.md, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
  },
  quickRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  quickLabel:{ flex: 1, fontSize: 14, fontWeight: '600', color: C.ink },
});
