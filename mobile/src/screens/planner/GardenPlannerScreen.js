import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { plannerAPI, achievementsAPI } from '../../api/client';
import { useFarmStore } from '../../store';

const { width: SCREEN_W } = Dimensions.get('window');
const CELL = 46;
const EMPTY = null;

const PLOT_SIZES = [
  { key: 'small',  label: 'Small',  desc: '4 × 5 ft',  cols: 5,  rows: 4  },
  { key: 'medium', label: 'Medium', desc: '6 × 8 ft',  cols: 8,  rows: 6  },
  { key: 'large',  label: 'Large',  desc: '8 × 12 ft', cols: 12, rows: 8  },
];

const COLORS = [
  '#ef9a9a','#f48fb1','#ce93d8','#9fa8da','#90caf9','#80deea',
  '#a5d6a7','#c5e1a5','#fff59d','#ffcc80','#ffab91','#bcaaa4',
  '#b0bec5','#80cbc4','#ffe082','#f0f4c3',
];

const EMOJI_MAP = {
  tomato:'🍅', pepper:'🫑', lettuce:'🥬', carrot:'🥕', cucumber:'🥒',
  bean:'🫘', pea:'🫛', corn:'🌽', potato:'🥔', onion:'🧅', garlic:'🧄',
  spinach:'🥬', kale:'🥬', broccoli:'🥦', squash:'🎃', pumpkin:'🎃',
  basil:'🌿', mint:'🌿', herb:'🌿', rosemary:'🌿', purslane:'🌿',
  lentil:'🫘', chickpea:'🫘', sorghum:'🌾', pigeon:'🫘', radish:'🌱',
  beet:'🌱', cabbage:'🥬', cauliflower:'🥦', eggplant:'🍆', okra:'🌱',
  fenugreek:'🌿', coriander:'🌿',
};

const MODE = { PLANT: 'plant', ERASE: 'erase', INSPECT: 'inspect' };

function vegEmoji(name) {
  const l = (name || '').toLowerCase();
  return Object.entries(EMOJI_MAP).find(([k]) => l.includes(k))?.[1] || '🌱';
}
function cellKey(r, c) { return `${r}-${c}`; }
function makeGrid(rows, cols) {
  const g = {};
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      g[cellKey(r, c)] = EMPTY;
  return g;
}

export default function GardenPlannerScreen({ navigation }) {
  const { farms } = useFarmStore();
  const [vegetables, setVegetables] = useState([]);
  const [plotSize, setPlotSize]     = useState(PLOT_SIZES[1]);
  const [grid, setGrid]             = useState(() => makeGrid(PLOT_SIZES[1].rows, PLOT_SIZES[1].cols));
  const [mode, setMode]             = useState(MODE.PLANT);
  const [selectedVeg, setSelectedVeg]   = useState(null);
  const [inspectedCell, setInspectedCell] = useState(null);
  const [search, setSearch]         = useState('');
  const [planName, setPlanName]     = useState('My Garden');
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const colorMap = useRef({});

  useEffect(() => {
    plannerAPI.getVegetables()
      .then(r => {
        const vegs = r.data || [];
        setVegetables(vegs);
        vegs.forEach((v, i) => { colorMap.current[v.id] = COLORS[i % COLORS.length]; });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const placed = Object.values(grid).filter(Boolean);
    const total  = placed.length;
    const varieties = new Set(placed).size;
    const totalCells = plotSize.rows * plotSize.cols;
    return { total, varieties, free: totalCells - total };
  }, [grid, plotSize]);

  const filteredVegs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? vegetables.filter(v => v.name.toLowerCase().includes(q)) : vegetables;
  }, [vegetables, search]);

  function getCompanionNames(vegId) {
    return vegetables.find(v => v.id === vegId)?.companion_plants || [];
  }

  function isCompanionOf(sourceKey, r, c) {
    if (!sourceKey || !grid[sourceKey]) return false;
    const companions = getCompanionNames(grid[sourceKey]);
    const targetVeg  = vegetables.find(v => v.id === grid[cellKey(r, c)]);
    return !!targetVeg && companions.some(cp => targetVeg.name.toLowerCase().includes(cp.toLowerCase()));
  }

  function handleCellPress(r, c) {
    const key = cellKey(r, c);
    if (mode === MODE.PLANT && selectedVeg) {
      setGrid(prev => ({ ...prev, [key]: selectedVeg }));
    } else if (mode === MODE.ERASE) {
      setGrid(prev => ({ ...prev, [key]: EMPTY }));
    } else if (mode === MODE.INSPECT) {
      setInspectedCell(prev => (prev === key ? null : key));
    }
  }

  function switchMode(m) {
    setMode(m);
    if (m !== MODE.PLANT)   setSelectedVeg(null);
    if (m !== MODE.INSPECT) setInspectedCell(null);
  }

  function pickVeg(id) {
    if (mode !== MODE.PLANT) switchMode(MODE.PLANT);
    setSelectedVeg(prev => (prev === id ? null : id));
    setInspectedCell(null);
  }

  function changePlotSize(size) {
    if (size.key === plotSize.key) return;
    const hasPlants = Object.values(grid).some(Boolean);
    const apply = () => {
      setPlotSize(size);
      setGrid(makeGrid(size.rows, size.cols));
      setInspectedCell(null);
    };
    hasPlants
      ? Alert.alert('Change Plot Size?', 'All placed plants will be cleared.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Change', style: 'destructive', onPress: apply },
        ])
      : apply();
  }

  function clearAll() {
    if (!Object.values(grid).some(Boolean)) return;
    Alert.alert('Clear All?', 'Remove every plant from the grid?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => {
        setGrid(makeGrid(plotSize.rows, plotSize.cols));
        setInspectedCell(null);
      }},
    ]);
  }

  async function savePlan() {
    setSaving(true);
    try {
      const farmId = farms?.[0]?.id || null;
      await plannerAPI.savePlan({ farmId, name: planName, gridData: grid, plotSize: plotSize.key });
      achievementsAPI.checkAchievements().catch(() => {});
      Alert.alert('Saved!', `"${planName}" is saved to your garden.`, [
        { text: 'Done', onPress: () => navigation.goBack() },
        { text: 'Keep Editing' },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  const inspectedVeg = inspectedCell ? vegetables.find(v => v.id === grid[inspectedCell]) : null;
  const companions   = inspectedVeg ? getCompanionNames(grid[inspectedCell]) : [];

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={styles.container}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Ionicons name="leaf" size={20} color="#fff" style={{ marginRight: 6 }} />
        <TextInput
          style={styles.planNameInput}
          value={planName}
          onChangeText={setPlanName}
          placeholder="Plan name…"
          placeholderTextColor="rgba(255,255,255,0.65)"
        />
        <TouchableOpacity onPress={clearAll} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={19} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <TouchableOpacity onPress={savePlan} style={[styles.saveBtn, saving && { opacity: 0.55 }]} disabled={saving}>
          <Ionicons name="save-outline" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Plot size ───────────────────────────────────────────────────── */}
      <View style={styles.sizeBar}>
        {PLOT_SIZES.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sizeChip, plotSize.key === s.key && styles.sizeChipOn]}
            onPress={() => changePlotSize(s)}
          >
            <Text style={[styles.sizeChipLabel, plotSize.key === s.key && styles.sizeChipLabelOn]}>{s.label}</Text>
            <Text style={[styles.sizeChipSub,   plotSize.key === s.key && styles.sizeChipSubOn  ]}>{s.desc}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.cellNote}>
          <Ionicons name="information-circle-outline" size={12} color="#aaa" />
          <Text style={styles.cellNoteText}> 1 cell = 1 sq ft</Text>
        </View>
      </View>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      {stats.total > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLbl}>plants</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{stats.varieties}</Text>
            <Text style={styles.statLbl}>varieties</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{stats.free}</Text>
            <Text style={styles.statLbl}>sq ft free</Text>
          </View>
        </View>
      )}

      {/* ── Mode bar ────────────────────────────────────────────────────── */}
      <View style={styles.modeBar}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === MODE.PLANT && styles.modeBtnPlant]}
          onPress={() => switchMode(MODE.PLANT)}
        >
          <Text style={styles.modeBtnIcon}>🌱</Text>
          <Text style={[styles.modeBtnTxt, mode === MODE.PLANT && styles.modeBtnTxtOn]}>Plant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === MODE.ERASE && styles.modeBtnErase]}
          onPress={() => switchMode(MODE.ERASE)}
        >
          <Text style={styles.modeBtnIcon}>🧹</Text>
          <Text style={[styles.modeBtnTxt, mode === MODE.ERASE && styles.modeBtnTxtOn]}>Erase</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === MODE.INSPECT && styles.modeBtnInspect]}
          onPress={() => switchMode(MODE.INSPECT)}
        >
          <Text style={styles.modeBtnIcon}>🔍</Text>
          <Text style={[styles.modeBtnTxt, mode === MODE.INSPECT && styles.modeBtnTxtOn]}>Inspect</Text>
        </TouchableOpacity>

        {/* Contextual hint */}
        <View style={styles.modeHintBox}>
          {mode === MODE.PLANT && !selectedVeg && (
            <Text style={styles.modeHint}>Pick a vegetable below ↓</Text>
          )}
          {mode === MODE.PLANT && selectedVeg && (
            <View style={styles.placingRow}>
              <Text style={styles.placingText} numberOfLines={1}>
                Placing {vegEmoji(vegetables.find(v => v.id === selectedVeg)?.name)}{' '}
                <Text style={{ fontWeight: '700' }}>{vegetables.find(v => v.id === selectedVeg)?.name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setSelectedVeg(null)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Ionicons name="close-circle" size={15} color="#999" />
              </TouchableOpacity>
            </View>
          )}
          {mode === MODE.ERASE && <Text style={styles.modeHint}>Tap any plant to remove it</Text>}
          {mode === MODE.INSPECT && <Text style={styles.modeHint}>Tap a plant to see companions</Text>}
        </View>
      </View>

      {/* ── Empty state hint ─────────────────────────────────────────────── */}
      {stats.total === 0 && (
        <View style={styles.emptyHint}>
          <Text style={styles.emptyHintIcon}>🌿</Text>
          <Text style={styles.emptyHintText}>Select a vegetable below, then tap grid cells to plant it</Text>
        </View>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridScroll}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {plotSize.key === 'large' && (
            <View style={styles.compassRow}>
              <Text style={styles.compassTxt}>☀️  South — more sun exposure</Text>
              <Text style={styles.compassTxt}>North ↑</Text>
            </View>
          )}
          <View style={styles.grid}>
            {Array.from({ length: plotSize.rows }, (_, r) => (
              <View key={r} style={styles.gridRow}>
                {Array.from({ length: plotSize.cols }, (_, c) => {
                  const key    = cellKey(r, c);
                  const vegId  = grid[key];
                  const veg    = vegId ? vegetables.find(v => v.id === vegId) : null;
                  const isInsp = inspectedCell === key;
                  const isComp = isCompanionOf(inspectedCell, r, c);
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.cell,
                        veg       && { backgroundColor: colorMap.current[veg.id] || '#c8e6c9' },
                        isInsp    && styles.cellInsp,
                        isComp    && styles.cellComp,
                        mode === MODE.ERASE && veg && styles.cellEraseHover,
                      ]}
                      onPress={() => handleCellPress(r, c)}
                      activeOpacity={0.7}
                    >
                      {veg
                        ? <Text style={styles.cellEmoji}>{vegEmoji(veg.name)}</Text>
                        : <Text style={styles.cellDot}>·</Text>
                      }
                      {isComp && (
                        <View style={styles.compBadge}><Text style={styles.compBadgeTxt}>✓</Text></View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* ── Companion panel ──────────────────────────────────────────────── */}
      {mode === MODE.INSPECT && inspectedVeg && (
        <View style={styles.companionPanel}>
          <View style={styles.companionPanelTop}>
            <Text style={styles.companionPanelTitle}>
              {vegEmoji(inspectedVeg.name)}  {inspectedVeg.name}  —  Good neighbors
            </Text>
            <TouchableOpacity onPress={() => setInspectedCell(null)}>
              <Ionicons name="close" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {companions.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {companions.map((cp, i) => (
                <View key={i} style={styles.companionTag}>
                  <Text style={styles.companionTagTxt}>🌱 {cp}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.companionNone}>No specific companions listed for this plant.</Text>
          )}
        </View>
      )}

      {/* ── Vegetable tray ───────────────────────────────────────────────── */}
      <View style={styles.tray}>
        <View style={styles.trayTopRow}>
          <Text style={styles.trayTitle}>Vegetables</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={13} color="#bbb" />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search…"
              placeholderTextColor="#ccc"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={14} color="#bbb" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlatList
          data={filteredVegs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={v => v.id}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 6, gap: 8 }}
          ListEmptyComponent={
            <View style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
              <Text style={{ color: '#aaa', fontSize: 13 }}>No vegetables match "{search}"</Text>
            </View>
          }
          renderItem={({ item }) => {
            const active = selectedVeg === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.trayItem,
                  { backgroundColor: colorMap.current[item.id] || '#e8f5e9' },
                  active && styles.trayItemActive,
                ]}
                onPress={() => pickVeg(item.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.trayEmoji}>{vegEmoji(item.name)}</Text>
                <Text style={styles.trayName} numberOfLines={1}>{item.name}</Text>
                {item.difficulty_level === 'easy' && (
                  <View style={styles.easyBadge}><Text style={styles.easyBadgeTxt}>Easy</Text></View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#388e3c', paddingHorizontal: 12, paddingVertical: 11, gap: 8,
  },
  planNameInput: {
    flex: 1, color: '#fff', fontSize: 15, fontWeight: '700',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)', paddingVertical: 3,
  },
  headerBtn: { padding: 4 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Plot size bar
  sizeBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 10, paddingVertical: 8, gap: 7,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  sizeChip: {
    flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: '#e0e0e0',
    paddingVertical: 6, alignItems: 'center',
  },
  sizeChipOn:      { borderColor: '#4CAF50', backgroundColor: '#e8f5e9' },
  sizeChipLabel:   { fontSize: 12, fontWeight: '700', color: '#999' },
  sizeChipLabelOn: { color: '#2e7d32' },
  sizeChipSub:     { fontSize: 10, color: '#bbb', marginTop: 1 },
  sizeChipSubOn:   { color: '#66bb6a' },
  cellNote:        { flexDirection: 'row', alignItems: 'center', paddingLeft: 4 },
  cellNoteText:    { fontSize: 10, color: '#bbb' },

  // Stats
  statsBar: {
    flexDirection: 'row', backgroundColor: '#f9fbe7',
    paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f0f4c3',
    justifyContent: 'center',
  },
  statItem:  { alignItems: 'center', paddingHorizontal: 20 },
  statNum:   { fontSize: 17, fontWeight: '800', color: '#33691e' },
  statLbl:   { fontSize: 10, color: '#8d9e30', marginTop: 1 },
  statDiv:   { width: 1, backgroundColor: '#dce775', alignSelf: 'stretch' },

  // Mode bar
  modeBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 10, paddingVertical: 7, gap: 6,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e5e5e5', backgroundColor: '#fafafa',
  },
  modeBtnPlant:   { borderColor: '#4CAF50', backgroundColor: '#e8f5e9' },
  modeBtnErase:   { borderColor: '#e53935', backgroundColor: '#ffebee' },
  modeBtnInspect: { borderColor: '#1976d2', backgroundColor: '#e3f2fd' },
  modeBtnIcon:    { fontSize: 14 },
  modeBtnTxt:     { fontSize: 12, color: '#999', fontWeight: '600' },
  modeBtnTxtOn:   { color: '#333' },
  modeHintBox:    { flex: 1, paddingLeft: 4 },
  modeHint:       { fontSize: 11, color: '#aaa', fontStyle: 'italic' },
  placingRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  placingText:    { fontSize: 11, color: '#555', flex: 1 },

  // Empty state
  emptyHint: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fffde7', marginHorizontal: 12, marginTop: 10,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#fff9c4',
  },
  emptyHintIcon: { fontSize: 22 },
  emptyHintText: { flex: 1, fontSize: 12, color: '#827717', lineHeight: 17 },

  // Grid
  gridScroll: { flex: 1 },
  gridWrapper: { padding: 10 },
  compassRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 4, paddingBottom: 4,
  },
  compassTxt: { fontSize: 10, color: '#aaa', fontStyle: 'italic' },
  grid:       { gap: 3 },
  gridRow:    { flexDirection: 'row', gap: 3 },
  cell: {
    width: CELL, height: CELL, borderRadius: 7,
    borderWidth: 1, borderColor: '#dde',
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  cellInsp:       { borderColor: '#1976d2', borderWidth: 2.5, shadowColor: '#1976d2', shadowRadius: 4, elevation: 4 },
  cellComp:       { borderColor: '#43a047', borderWidth: 2, backgroundColor: '#e8f5e9' },
  cellEraseHover: { borderColor: '#e53935', borderWidth: 2, opacity: 0.75 },
  cellEmoji:      { fontSize: 22 },
  cellDot:        { fontSize: 20, color: '#ddd' },
  compBadge:      { position: 'absolute', top: 2, right: 2, backgroundColor: '#43a047', borderRadius: 6, width: 13, height: 13, justifyContent: 'center', alignItems: 'center' },
  compBadgeTxt:   { fontSize: 8, color: '#fff', fontWeight: '900' },

  // Companion panel
  companionPanel: {
    backgroundColor: '#e3f2fd', borderTopWidth: 1, borderTopColor: '#bbdefb',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  companionPanelTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  companionPanelTitle:{ fontSize: 13, fontWeight: '700', color: '#0d47a1', flex: 1 },
  companionTag: {
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 10, paddingVertical: 4,
    marginRight: 6, borderWidth: 1, borderColor: '#90caf9',
  },
  companionTagTxt: { fontSize: 12, color: '#1565c0' },
  companionNone:   { fontSize: 12, color: '#888', marginTop: 4 },

  // Tray
  tray: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, paddingBottom: 4 },
  trayTopRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, marginBottom: 6, gap: 10,
  },
  trayTitle: { fontSize: 12, fontWeight: '700', color: '#666' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#f5f5f5', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  searchInput: { flex: 1, fontSize: 12, color: '#333', padding: 0 },
  trayItem: {
    alignItems: 'center', borderRadius: 10,
    padding: 8, minWidth: 66,
    borderWidth: 2, borderColor: 'transparent',
  },
  trayItemActive: { borderColor: '#333', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  trayEmoji: { fontSize: 24 },
  trayName:  { fontSize: 10, color: '#333', marginTop: 3, textAlign: 'center', maxWidth: 64 },
  easyBadge: {
    marginTop: 3, backgroundColor: '#e8f5e9', borderRadius: 5,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  easyBadgeTxt: { fontSize: 8, color: '#2e7d32', fontWeight: '700' },
});
