import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { plannerAPI, achievementsAPI } from '../../api/client';
import { useFarmStore } from '../../store';

const COLS = 8;
const ROWS = 6;
const EMPTY = null;

const VEG_COLORS = [
  '#ef9a9a', '#f48fb1', '#ce93d8', '#9fa8da', '#90caf9',
  '#80deea', '#a5d6a7', '#c5e1a5', '#fff59d', '#ffcc80',
  '#ffab91', '#bcaaa4', '#b0bec5',
];

function cellKey(r, c) { return `${r}-${c}`; }

const VEG_EMOJI_MAP = {
  tomato: '🍅', pepper: '🫑', lettuce: '🥬', carrot: '🥕',
  cucumber: '🥒', bean: '🫘', pea: '🫛', corn: '🌽',
  potato: '🥔', onion: '🧅', garlic: '🧄', spinach: '🌿',
  kale: '🥦', broccoli: '🥦', squash: '🎃', pumpkin: '🎃',
  basil: '🌿', mint: '🌿', herb: '🌿',
};
function vegEmoji(name) {
  const lower = (name || '').toLowerCase();
  return Object.entries(VEG_EMOJI_MAP).find(([k]) => lower.includes(k))?.[1] || '🌱';
}

export default function GardenPlannerScreen({ navigation }) {
  const { farms } = useFarmStore();
  const [vegetables, setVegetables] = useState([]);
  const [grid, setGrid] = useState(() => {
    const g = {};
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        g[cellKey(r, c)] = EMPTY;
    return g;
  });
  const [selectedVeg, setSelectedVeg] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [planName, setPlanName] = useState('My Garden');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorMap = useRef({});

  useEffect(() => {
    plannerAPI.getVegetables()
      .then(r => {
        setVegetables(r.data || []);
        // assign stable colors
        (r.data || []).forEach((v, i) => {
          colorMap.current[v.id] = VEG_COLORS[i % VEG_COLORS.length];
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleCellPress(r, c) {
    const key = cellKey(r, c);
    if (selectedVeg) {
      setGrid(prev => ({ ...prev, [key]: selectedVeg }));
    } else {
      setSelectedCell(selectedCell === key ? null : key);
    }
  }

  function clearCell(r, c) {
    setGrid(prev => ({ ...prev, [cellKey(r, c)]: EMPTY }));
    setSelectedCell(null);
  }

  function clearAll() {
    Alert.alert('Clear Grid?', 'This will remove all plants from the grid.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive',
        onPress: () => {
          const g = {};
          for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
              g[cellKey(r, c)] = EMPTY;
          setGrid(g);
          setSelectedCell(null);
        },
      },
    ]);
  }

  // Get companion list for selected cell's veg
  function getCompanions(vegId) {
    const veg = vegetables.find(v => v.id === vegId);
    return veg?.companion_plants || [];
  }

  // Highlight good companion cells
  function isCellCompanion(r, c) {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell.split('-').map(Number);
    const selectedVegId = grid[selectedCell];
    if (!selectedVegId) return false;
    const companions = getCompanions(selectedVegId);
    const cellVegId = grid[cellKey(r, c)];
    if (!cellVegId) return false;
    const cellVeg = vegetables.find(v => v.id === cellVegId);
    return cellVeg && companions.some(cp => cellVeg.name.toLowerCase().includes(cp.toLowerCase()));
  }

  async function savePlan() {
    setSaving(true);
    try {
      const farmId = farms?.[0]?.id || null;
      await plannerAPI.savePlan({ farmId, name: planName, gridData: grid });
      achievementsAPI.checkAchievements().catch(() => {});
      Alert.alert('Saved!', 'Your garden plan has been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch {
      Alert.alert('Error', 'Could not save plan.');
    } finally {
      setSaving(false);
    }
  }

  const cellSize = 44;

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TextInput
          style={styles.planNameInput}
          value={planName}
          onChangeText={setPlanName}
          placeholder="Plan name…"
          placeholderTextColor="rgba(255,255,255,0.6)"
        />
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={savePlan} style={[styles.saveBtn, saving && { opacity: 0.6 }]} disabled={saving}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* Selection info */}
      <View style={styles.infoBar}>
        {selectedVeg ? (
          <>
            <Text style={styles.infoText}>
              {vegEmoji(vegetables.find(v => v.id === selectedVeg)?.name)} Placing: <Text style={{ fontWeight: '700' }}>{vegetables.find(v => v.id === selectedVeg)?.name}</Text>
            </Text>
            <TouchableOpacity onPress={() => setSelectedVeg(null)}>
              <Text style={styles.cancelSelect}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : selectedCell && grid[selectedCell] ? (
          <>
            <Text style={styles.infoText}>
              {vegEmoji(vegetables.find(v => v.id === grid[selectedCell])?.name)} {vegetables.find(v => v.id === grid[selectedCell])?.name} · Green = good neighbors
            </Text>
            <TouchableOpacity onPress={() => { const [r,c] = selectedCell.split('-').map(Number); clearCell(r,c); }}>
              <Text style={styles.cancelSelect}>Remove</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.infoText}>Tap a vegetable below, then tap grid cells to place it</Text>
        )}
      </View>

      {/* Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {Array.from({ length: ROWS }, (_, r) => (
            <View key={r} style={styles.gridRow}>
              {Array.from({ length: COLS }, (_, c) => {
                const key = cellKey(r, c);
                const vegId = grid[key];
                const veg = vegId ? vegetables.find(v => v.id === vegId) : null;
                const isSelected = selectedCell === key;
                const isCompanion = isCellCompanion(r, c);
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.cell,
                      { width: cellSize, height: cellSize },
                      veg && { backgroundColor: colorMap.current[veg.id] || '#c8e6c9' },
                      isSelected && styles.cellSelected,
                      isCompanion && styles.cellCompanion,
                    ]}
                    onPress={() => handleCellPress(r, c)}
                    activeOpacity={0.7}
                  >
                    {veg ? (
                      <Text style={styles.cellEmoji}>{vegEmoji(veg.name)}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Vegetable tray */}
      <View style={styles.tray}>
        <Text style={styles.trayTitle}>Vegetables — tap to select, then tap grid</Text>
        <FlatList
          data={vegetables}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={v => v.id}
          contentContainerStyle={{ paddingHorizontal: 10, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.trayItem,
                { backgroundColor: colorMap.current[item.id] || '#e8f5e9' },
                selectedVeg === item.id && styles.trayItemActive,
              ]}
              onPress={() => setSelectedVeg(selectedVeg === item.id ? null : item.id)}
            >
              <Text style={styles.trayEmoji}>{vegEmoji(item.name)}</Text>
              <Text style={styles.trayName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  planNameInput: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)', paddingVertical: 4 },
  clearBtn: { padding: 6 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  infoBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoText: { flex: 1, fontSize: 13, color: '#555' },
  cancelSelect: { fontSize: 13, color: '#f44336', fontWeight: '600' },

  grid: { padding: 12 },
  gridRow: { flexDirection: 'row', gap: 3 },
  cell: {
    borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0',
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 3,
  },
  cellSelected: { borderColor: '#1976d2', borderWidth: 2, shadowColor: '#1976d2', shadowRadius: 4, elevation: 4 },
  cellCompanion: { borderColor: '#4CAF50', borderWidth: 2, backgroundColor: '#e8f5e9' },
  cellEmoji: { fontSize: 22 },

  tray: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 10 },
  trayTitle: { fontSize: 12, color: '#888', paddingHorizontal: 14, marginBottom: 6 },
  trayItem: { alignItems: 'center', borderRadius: 10, padding: 8, minWidth: 64, borderWidth: 2, borderColor: 'transparent' },
  trayItemActive: { borderColor: '#333' },
  trayEmoji: { fontSize: 24 },
  trayName: { fontSize: 10, color: '#333', marginTop: 4, textAlign: 'center', maxWidth: 60 },
});
