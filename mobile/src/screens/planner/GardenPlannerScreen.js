import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { plannerAPI, achievementsAPI } from '../../api/client';
import { useFarmStore } from '../../store';

const CELL = 48;
const EMPTY = null;

const PLOT_SIZES = [
  { key: 'small',  label: 'Small',  desc: '4 × 5 ft',  cols: 5,  rows: 4 },
  { key: 'medium', label: 'Medium', desc: '6 × 8 ft',  cols: 8,  rows: 6 },
  { key: 'large',  label: 'Large',  desc: '8 × 12 ft', cols: 12, rows: 8 },
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
  lentil:'🫘', chickpea:'🫘', sorghum:'🌾', radish:'🌱', beet:'🌱',
  cabbage:'🥬', cauliflower:'🥦', eggplant:'🍆', okra:'🌱',
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
  const [grid, setGrid]             = useState(() => makeGrid(6, 8));
  const [mode, setMode]             = useState(MODE.PLANT);
  const [selectedVeg, setSelectedVeg]     = useState(null);
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
    const vals     = Object.values(grid);
    const placed   = vals.filter(Boolean);
    const varieties = new Set(placed).size;
    return { total: placed.length, varieties, free: vals.length - placed.length };
  }, [grid]);

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
    const target = vegetables.find(v => v.id === grid[cellKey(r, c)]);
    return !!target && companions.some(cp => target.name.toLowerCase().includes(cp.toLowerCase()));
  }

  function handleCellPress(r, c) {
    const key = cellKey(r, c);
    if (mode === MODE.PLANT && selectedVeg) {
      setGrid(prev => ({ ...prev, [key]: selectedVeg }));
    } else if (mode === MODE.ERASE) {
      setGrid(prev => ({ ...prev, [key]: EMPTY }));
    } else if (mode === MODE.INSPECT) {
      setInspectedCell(prev => prev === key ? null : key);
    }
  }

  function switchMode(m) {
    setMode(m);
    if (m !== MODE.PLANT)   setSelectedVeg(null);
    if (m !== MODE.INSPECT) setInspectedCell(null);
  }

  function pickVeg(id) {
    if (mode !== MODE.PLANT) switchMode(MODE.PLANT);
    setSelectedVeg(prev => prev === id ? null : id);
    setInspectedCell(null);
  }

  function changePlotSize(size) {
    if (size.key === plotSize.key) return;
    const apply = () => {
      setPlotSize(size);
      setGrid(makeGrid(size.rows, size.cols));
      setInspectedCell(null);
    };
    Object.values(grid).some(Boolean)
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
      await plannerAPI.savePlan({
        farmId,
        name: planName,
        gridData: grid,
        plotSize: plotSize.key,
      });
      achievementsAPI.checkAchievements().catch(() => {});
      Alert.alert('Saved!', `"${planName}" is saved.`, [
        { text: 'Done', onPress: () => navigation.goBack() },
        { text: 'Keep Editing' },
      ]);
    } catch (err) {
      Alert.alert('Save Failed', err?.response?.data?.error || 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  const inspectedVeg = inspectedCell
    ? vegetables.find(v => v.id === grid[inspectedCell])
    : null;
  const companions = inspectedVeg ? getCompanionNames(grid[inspectedCell]) : [];

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={s.root}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <Ionicons name="leaf" size={18} color="#fff" />
        <TextInput
          style={s.nameInput}
          value={planName}
          onChangeText={setPlanName}
          placeholder="Plan name…"
          placeholderTextColor="rgba(255,255,255,0.55)"
        />
        <TouchableOpacity onPress={clearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.5 }]}
          onPress={savePlan}
          disabled={saving}
        >
          <Text style={s.saveBtnTxt}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Plot size ────────────────────────────────────────────────────── */}
      <View style={s.sizeRow}>
        {PLOT_SIZES.map(sz => (
          <TouchableOpacity
            key={sz.key}
            style={[s.sizeChip, plotSize.key === sz.key && s.sizeChipOn]}
            onPress={() => changePlotSize(sz)}
          >
            <Text style={[s.sizeLabel, plotSize.key === sz.key && s.sizeLabelOn]}>{sz.label}</Text>
            <Text style={[s.sizeSub,   plotSize.key === sz.key && s.sizeSubOn  ]}>{sz.desc}</Text>
          </TouchableOpacity>
        ))}
        <View style={s.sqftNote}>
          <Text style={s.sqftTxt}>1 cell = 1 sq ft</Text>
        </View>
      </View>

      {/* ── Mode bar ─────────────────────────────────────────────────────── */}
      <View style={s.modeRow}>
        {[
          { m: MODE.PLANT,   icon: '🌱', label: 'Plant',   active: s.modePlant   },
          { m: MODE.ERASE,   icon: '🧹', label: 'Erase',   active: s.modeErase   },
          { m: MODE.INSPECT, icon: '🔍', label: 'Inspect', active: s.modeInspect },
        ].map(({ m, icon, label, active }) => (
          <TouchableOpacity
            key={m}
            style={[s.modeBtn, mode === m && active]}
            onPress={() => switchMode(m)}
          >
            <Text style={s.modeBtnIcon}>{icon}</Text>
            <Text style={[s.modeBtnTxt, mode === m && s.modeBtnTxtOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
        {/* Inline hint */}
        <View style={s.hintBox}>
          {mode === MODE.PLANT && !selectedVeg && <Text style={s.hint}>Pick a veg below ↓</Text>}
          {mode === MODE.PLANT && selectedVeg && (
            <View style={s.placingRow}>
              <Text style={s.placingTxt} numberOfLines={1}>
                {vegEmoji(vegetables.find(v => v.id === selectedVeg)?.name)}{' '}
                {vegetables.find(v => v.id === selectedVeg)?.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedVeg(null)}>
                <Ionicons name="close-circle" size={14} color="#aaa" />
              </TouchableOpacity>
            </View>
          )}
          {mode === MODE.ERASE   && <Text style={s.hint}>Tap a plant to remove it</Text>}
          {mode === MODE.INSPECT && <Text style={s.hint}>Tap a plant to see companions</Text>}
        </View>
      </View>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      {stats.total > 0 && (
        <View style={s.statsRow}>
          <Text style={s.statChip}>🌿 {stats.total} plants</Text>
          <Text style={s.statChip}>🎨 {stats.varieties} varieties</Text>
          <Text style={s.statChip}>⬜ {stats.free} sq ft free</Text>
        </View>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {stats.total === 0 && (
        <View style={s.emptyHint}>
          <Text style={s.emptyIcon}>🌿</Text>
          <Text style={s.emptyTxt}>Select a vegetable below, then tap the grid cells to plant it. Each square = 1 sq ft.</Text>
        </View>
      )}

      {/* ── Grid (horizontal scroll only) ───────────────────────────────── */}
      <ScrollView
        style={s.gridScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.gridContent}
        bounces={false}
      >
        <View>
          {plotSize.key === 'large' && (
            <View style={s.compassRow}>
              <Text style={s.compassTxt}>☀️  South  (more sun)</Text>
              <Text style={s.compassTxt}>North  ↑</Text>
            </View>
          )}
          {Array.from({ length: plotSize.rows }, (_, r) => (
            <View key={r} style={s.gridRow}>
              {Array.from({ length: plotSize.cols }, (_, c) => {
                const key   = cellKey(r, c);
                const vegId = grid[key];
                const veg   = vegId ? vegetables.find(v => v.id === vegId) : null;
                const isInsp  = inspectedCell === key;
                const isComp  = isCompanionOf(inspectedCell, r, c);
                const isErase = mode === MODE.ERASE && !!veg;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      s.cell,
                      veg    && { backgroundColor: colorMap.current[veg.id] || '#c8e6c9' },
                      isInsp && s.cellInsp,
                      isComp && s.cellComp,
                      isErase && s.cellErase,
                    ]}
                    onPress={() => handleCellPress(r, c)}
                    activeOpacity={0.7}
                  >
                    {veg
                      ? <Text style={s.cellEmoji}>{vegEmoji(veg.name)}</Text>
                      : <Text style={s.cellDot}>·</Text>
                    }
                    {isComp && <View style={s.compDot}><Text style={s.compDotTxt}>✓</Text></View>}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Companion panel (modal-style overlay at bottom) ─────────────── */}
      <Modal
        visible={mode === MODE.INSPECT && !!inspectedVeg}
        transparent
        animationType="slide"
        onRequestClose={() => setInspectedCell(null)}
      >
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setInspectedCell(null)}>
          <View style={s.companionSheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>
                {vegEmoji(inspectedVeg?.name)}  {inspectedVeg?.name}  — Good neighbors
              </Text>
              <TouchableOpacity onPress={() => setInspectedCell(null)}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {companions.length > 0 ? (
              <>
                <Text style={s.sheetSub}>Plant these nearby — they help each other grow</Text>
                <View style={s.tagWrap}>
                  {companions.map((cp, i) => (
                    <View key={i} style={s.tag}>
                      <Text style={s.tagTxt}>{vegEmoji(cp)} {cp}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={s.sheetSub}>No specific companion plants listed for this vegetable.</Text>
            )}
            <Text style={s.sheetNote}>Cells with a ✓ badge are already good neighbors in your grid.</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Vegetable tray ───────────────────────────────────────────────── */}
      <View style={s.tray}>
        <View style={s.trayTop}>
          <Text style={s.trayTitle}>Vegetables</Text>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={13} color="#bbb" />
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search…"
              placeholderTextColor="#ccc"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={13} color="#bbb" />
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
            <View style={{ paddingVertical: 16, paddingLeft: 10 }}>
              <Text style={{ color: '#bbb', fontSize: 13 }}>No results for "{search}"</Text>
            </View>
          }
          renderItem={({ item }) => {
            const active = selectedVeg === item.id;
            return (
              <TouchableOpacity
                style={[
                  s.trayItem,
                  { backgroundColor: colorMap.current[item.id] || '#e8f5e9' },
                  active && s.trayItemOn,
                ]}
                onPress={() => pickVeg(item.id)}
                activeOpacity={0.75}
              >
                <Text style={s.trayEmoji}>{vegEmoji(item.name)}</Text>
                <Text style={s.trayName} numberOfLines={1}>{item.name}</Text>
                {item.difficulty_level === 'easy' && (
                  <View style={s.easyBadge}><Text style={s.easyTxt}>Easy</Text></View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f0f4f0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#388e3c', paddingHorizontal: 14, paddingVertical: 10,
  },
  nameInput: {
    flex: 1, color: '#fff', fontSize: 15, fontWeight: '700',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.35)', paddingVertical: 2,
  },
  saveBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  saveBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Plot size
  sizeRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 10, paddingVertical: 7, gap: 6,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  sizeChip: {
    flex: 1, borderRadius: 9, borderWidth: 1.5, borderColor: '#e5e5e5',
    paddingVertical: 5, alignItems: 'center',
  },
  sizeChipOn:  { borderColor: '#4CAF50', backgroundColor: '#e8f5e9' },
  sizeLabel:   { fontSize: 12, fontWeight: '700', color: '#aaa' },
  sizeLabelOn: { color: '#2e7d32' },
  sizeSub:     { fontSize: 10, color: '#ccc', marginTop: 1 },
  sizeSubOn:   { color: '#81c784' },
  sqftNote:    { paddingLeft: 4 },
  sqftTxt:     { fontSize: 10, color: '#bbb' },

  // Mode bar
  modeRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 10, paddingVertical: 7, gap: 6,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#ebebeb',
  },
  modePlant:   { borderColor: '#4CAF50', backgroundColor: '#e8f5e9' },
  modeErase:   { borderColor: '#e53935', backgroundColor: '#ffebee' },
  modeInspect: { borderColor: '#1976d2', backgroundColor: '#e3f2fd' },
  modeBtnIcon: { fontSize: 13 },
  modeBtnTxt:  { fontSize: 11, color: '#bbb', fontWeight: '600' },
  modeBtnTxtOn:{ color: '#333' },
  hintBox:     { flex: 1, paddingLeft: 2 },
  hint:        { fontSize: 11, color: '#bbb', fontStyle: 'italic' },
  placingRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  placingTxt:  { fontSize: 11, color: '#555', flex: 1 },

  // Stats strip
  statsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f9fbe7', paddingHorizontal: 12, paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#f0f4c3',
  },
  statChip: { fontSize: 11, color: '#558b2f', fontWeight: '600' },

  // Empty state
  emptyHint: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 10, borderRadius: 10, padding: 12,
    backgroundColor: '#fffde7', borderWidth: 1, borderColor: '#fff9c4',
  },
  emptyIcon: { fontSize: 22 },
  emptyTxt:  { flex: 1, fontSize: 12, color: '#827717', lineHeight: 17 },

  // Grid
  gridScroll:  { flex: 1 },
  gridContent: { padding: 10 },
  compassRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginBottom: 4 },
  compassTxt:  { fontSize: 10, color: '#bbb', fontStyle: 'italic' },
  gridRow:     { flexDirection: 'row', marginBottom: 3 },
  cell: {
    width: CELL, height: CELL, marginRight: 3,
    borderRadius: 8, borderWidth: 1, borderColor: '#dde',
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  cellInsp:  { borderColor: '#1976d2', borderWidth: 2.5 },
  cellComp:  { borderColor: '#43a047', borderWidth: 2, backgroundColor: '#e8f5e9' },
  cellErase: { borderColor: '#e53935', borderWidth: 2, opacity: 0.65 },
  cellEmoji: { fontSize: 22 },
  cellDot:   { fontSize: 18, color: '#ddd' },
  compDot: {
    position: 'absolute', top: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#43a047', justifyContent: 'center', alignItems: 'center',
  },
  compDotTxt: { fontSize: 8, color: '#fff', fontWeight: '900' },

  // Companion modal sheet
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  companionSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 14,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sheetTitle:  { fontSize: 15, fontWeight: '700', color: '#1a237e', flex: 1 },
  sheetSub:    { fontSize: 13, color: '#888', marginBottom: 12 },
  tagWrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag:         { backgroundColor: '#e3f2fd', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  tagTxt:      { fontSize: 13, color: '#1565c0', fontWeight: '600' },
  sheetNote:   { fontSize: 11, color: '#bbb', fontStyle: 'italic' },

  // Tray
  tray:    { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, paddingBottom: 4 },
  trayTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 6, gap: 10 },
  trayTitle:  { fontSize: 12, fontWeight: '700', color: '#666' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
  },
  searchInput: { flex: 1, fontSize: 12, color: '#333', padding: 0 },
  trayItem: {
    alignItems: 'center', borderRadius: 10, padding: 8,
    minWidth: 66, borderWidth: 2, borderColor: 'transparent',
  },
  trayItemOn: { borderColor: '#333' },
  trayEmoji:  { fontSize: 24 },
  trayName:   { fontSize: 10, color: '#333', marginTop: 3, textAlign: 'center', maxWidth: 64 },
  easyBadge:  { marginTop: 3, backgroundColor: '#e8f5e9', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  easyTxt:    { fontSize: 8, color: '#2e7d32', fontWeight: '700' },
});
