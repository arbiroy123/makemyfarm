import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, FlatList, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recommendationAPI, cropAPI } from '../../api/client';
import { useAuthStore } from '../../store';

const EMOJI_MAP = {
  'Tomato': '🍅', 'Lettuce': '🥬', 'Carrot': '🥕', 'Bell Pepper': '🫑',
  'Cucumber': '🥒', 'Zucchini': '🥒', 'Green Beans': '🫛', 'Spinach': '🥬',
  'Bitter Gourd': '🫛', 'Okra': '🫛', 'Eggplant': '🍆', 'Fenugreek': '🌿',
  'Bok Choy': '🥬', 'Daikon Radish': '🥕', 'Snow Peas': '🫛',
  'Chinese Long Beans': '🫘', 'Artichoke': '🌸', 'Fennel': '🌿',
  'Padron Pepper': '🌶️', 'Romanesco Broccoli': '🥦', 'Tomatillo': '🍅',
  'Jalapeño Pepper': '🌶️', 'Poblano Pepper': '🫑', 'Chayote': '🍈',
  'Cilantro': '🌿', 'Collard Greens': '🥬', 'Sweet Potato': '🍠',
  'Black-eyed Peas': '🫘', 'Mustard Greens': '🥬', 'Callaloo (Amaranth)': '🥬',
  'Bottle Gourd': '🥒', 'Ridge Gourd': '🥒', 'Moringa': '🌳',
  'Cluster Beans (Guar)': '🫘', 'Napa Cabbage': '🥬', 'Lemongrass': '🎋',
  'Thai Basil': '🌿', 'Garlic Chives': '🌿', 'Sweet Basil': '🌿',
  'Radicchio': '🥬', 'Broccoli Rabe (Cime di Rapa)': '🥦', 'Italian Parsley': '🌿',
  'Mint': '🍃', 'Garlic': '🧄', 'Onion': '🧅', 'Potato': '🥔',
  'Sweet Corn': '🌽', 'Pumpkin': '🎃', 'Beetroot': '🫐', 'Malabar Spinach': '🥬',
  'Pigeon Pea': '🫘', 'Chickpea': '🫘', 'Rosemary': '🌿',
  'Purslane': '🌿', 'Lentil': '🫘', 'Sorghum': '🌾',
};

const THUMB_COLOR = {
  'Tomato': '#ffcdd2', 'Lettuce': '#c8e6c9', 'Carrot': '#ffe0b2',
  'Bell Pepper': '#ffccbc', 'Cucumber': '#dcedc8', 'Zucchini': '#f0f4c3',
  'Green Beans': '#c8e6c9', 'Spinach': '#a5d6a7', 'Bitter Gourd': '#b2dfdb',
  'Okra': '#c8e6c9', 'Eggplant': '#e1bee7', 'Fenugreek': '#dcedc8',
  'Bok Choy': '#b2dfdb', 'Daikon Radish': '#f8bbd0', 'Snow Peas': '#dcedc8',
  'Chinese Long Beans': '#c5e1a5', 'Artichoke': '#a5d6a7', 'Fennel': '#dcedc8',
  'Padron Pepper': '#c8e6c9', 'Romanesco Broccoli': '#ccff90',
  'Tomatillo': '#c8e6c9', 'Jalapeño Pepper': '#80cbc4', 'Poblano Pepper': '#a5d6a7',
  'Chayote': '#b2dfdb', 'Cilantro': '#c8e6c9', 'Collard Greens': '#81c784',
  'Sweet Potato': '#ffcc80', 'Black-eyed Peas': '#fff9c4',
  'Mustard Greens': '#e6ee9c', 'Callaloo (Amaranth)': '#ef9a9a',
  'Bottle Gourd': '#b2dfdb', 'Ridge Gourd': '#c5e1a5', 'Moringa': '#a5d6a7',
  'Cluster Beans (Guar)': '#c8e6c9', 'Napa Cabbage': '#dcedc8',
  'Lemongrass': '#fff9c4', 'Thai Basil': '#c8e6c9', 'Garlic Chives': '#c5e1a5',
  'Sweet Basil': '#a5d6a7', 'Radicchio': '#e1bee7',
  'Broccoli Rabe (Cime di Rapa)': '#c8e6c9', 'Italian Parsley': '#c8e6c9',
  'Mint': '#b2dfdb', 'Garlic': '#fff9c4', 'Onion': '#ffccbc',
  'Potato': '#ffe0b2', 'Sweet Corn': '#fff9c4', 'Pumpkin': '#ffcc80',
  'Beetroot': '#f48fb1', 'Malabar Spinach': '#80cbc4',
  'Pigeon Pea': '#ffe0b2', 'Chickpea': '#fff9c4', 'Rosemary': '#e8f5e9',
  'Purslane': '#c8e6c9', 'Lentil': '#f8bbd0', 'Sorghum': '#fff9c4',
};

const LOW_WATER_THRESHOLD = 10;

const DIFFICULTY_COLOR = { novice: '#4CAF50', intermediate: '#FF9800', expert: '#f44336' };
const DIFFICULTY_LABEL = { novice: 'Easy', intermediate: 'Moderate', expert: 'Advanced' };

const METHOD_OPTIONS = [
  { value: 'outdoor', label: 'Outdoor', icon: 'sunny-outline' },
  { value: 'greenhouse', label: 'Greenhouse', icon: 'home-outline' },
  { value: 'hydroponic', label: 'Hydroponic', icon: 'water-outline' },
];

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function PlantCropScreen({ route, navigation }) {
  const farmId = route.params?.farmId ?? null;
  const { exitGuestMode } = useAuthStore();
  const [vegetables, setVegetables] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [planting, setPlanting] = useState(false);
  const [error, setError] = useState('');

  // Planting form
  const [plantingDate, setPlantingDate] = useState(today());
  const [quantity, setQuantity] = useState('1');
  const [method, setMethod] = useState('outdoor');

  useEffect(() => {
    recommendationAPI.getVegetables()
      .then(r => { setVegetables(r.data); setFiltered(r.data); })
      .catch(() => setError('Could not load vegetables'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? vegetables.filter(v => v.name.toLowerCase().includes(q)) : vegetables);
  }, [search, vegetables]);

  const handlePlant = async () => {
    if (!selected) return;
    setPlanting(true);
    setError('');
    try {
      const expectedHarvest = addDays(plantingDate, selected.days_to_harvest || 60);
      await cropAPI.plantCrop(
        farmId, selected.id, plantingDate, parseInt(quantity) || 1, method, ''
      );
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to plant crop');
    } finally {
      setPlanting(false);
    }
  };

  const renderVeg = ({ item }) => {
    const isSelected = selected?.id === item.id;
    return (
      <View style={[styles.card, isSelected && styles.cardSelected]}>
        {/* Tappable header — only this toggles selection */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSelected(isSelected ? null : item)}
        >
          <View style={styles.cardTop}>
            <View style={[styles.emojiCircle, { backgroundColor: THUMB_COLOR[item.name] || '#e8f5e9' }]}>
              <Text style={styles.cardEmoji}>{EMOJI_MAP[item.name] || '🌱'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name}</Text>
              {item.scientific_name ? (
                <Text style={styles.cardScientific}>{item.scientific_name}</Text>
              ) : null}
            </View>
            <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLOR[item.difficulty_level] }]}>
              <Text style={styles.diffText}>{DIFFICULTY_LABEL[item.difficulty_level] || item.difficulty_level}</Text>
            </View>
          </View>

          <View style={styles.cardMeta}>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={12} color="#666" />
              <Text style={styles.metaText}>{item.days_to_harvest}d to harvest</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="calendar-outline" size={12} color="#666" />
              <Text style={styles.metaText}>{item.season}</Text>
            </View>
            {item.water_frequency_days >= LOW_WATER_THRESHOLD && (
              <View style={styles.lowWaterBadge}>
                <Ionicons name="water-outline" size={11} color="#0077b6" />
                <Text style={styles.lowWaterText}>Low Water</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Form lives outside the TouchableOpacity — taps on inputs no longer collapse the card */}
        {isSelected && farmId != null && (
          <View style={styles.plantForm}>
            <View style={styles.formDivider} />

            <Text style={styles.formLabel}>Planting Date</Text>
            <TextInput
              style={styles.formInput}
              value={plantingDate}
              onChangeText={setPlantingDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.formLabel}>Number of Plants</Text>
            <TextInput
              style={styles.formInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="e.g. 4"
            />

            <Text style={styles.formLabel}>Growing Method</Text>
            <View style={styles.methodRow}>
              {METHOD_OPTIONS.map(m => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.methodChip, method === m.value && styles.methodChipActive]}
                  onPress={() => setMethod(m.value)}
                >
                  <Ionicons
                    name={m.icon}
                    size={14}
                    color={method === m.value ? '#fff' : '#555'}
                  />
                  <Text style={[styles.methodLabel, method === m.value && styles.methodLabelActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.harvestEstimate}>
              Expected harvest: {addDays(plantingDate, item.days_to_harvest || 60)}
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.plantBtn, planting && { opacity: 0.6 }]}
              onPress={handlePlant}
              disabled={planting}
            >
              {planting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.plantBtnText}>Plant {item.name}</Text>}
            </TouchableOpacity>
          </View>
        )}
        {isSelected && farmId == null && (
          <View style={styles.guestPrompt}>
            <Text style={styles.guestPromptText}>Sign in to track {item.name} on your farm</Text>
            <TouchableOpacity style={styles.guestPromptBtn} onPress={exitGuestMode}>
              <Text style={styles.guestPromptBtnText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading vegetables...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants, fruits & flowers..."
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderVeg}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No vegetables found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', margin: 12, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },

  list: { padding: 12, paddingTop: 0 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },

  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent',
  },
  cardSelected: { borderColor: '#4CAF50', backgroundColor: '#f9fff9' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  emojiCircle: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardEmoji: { fontSize: 26 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardScientific: { fontSize: 11, color: '#888', fontStyle: 'italic', marginTop: 1 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  diffText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', gap: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#666' },
  lowWaterBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#e0f4ff', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  lowWaterText: { fontSize: 11, color: '#0077b6', fontWeight: '600' },

  formDivider: { height: 1, backgroundColor: '#e8f5e9', marginVertical: 14 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  formInput: {
    backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10,
    fontSize: 14, color: '#333', marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0',
  },
  methodRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  methodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f5f5f5',
  },
  methodChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  methodLabel: { fontSize: 13, color: '#555' },
  methodLabelActive: { color: '#fff', fontWeight: '600' },
  harvestEstimate: { fontSize: 12, color: '#2e7d32', marginBottom: 14, fontStyle: 'italic' },
  errorText: { color: '#c62828', fontSize: 13, marginBottom: 10 },
  plantBtn: {
    backgroundColor: '#4CAF50', borderRadius: 10, padding: 14,
    alignItems: 'center',
  },
  plantBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  guestPrompt: {
    marginTop: 12, padding: 14, backgroundColor: '#f1f8e9',
    borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#c5e1a5',
  },
  guestPromptText: { fontSize: 13, color: '#558b2f', marginBottom: 10, textAlign: 'center' },
  guestPromptBtn: {
    backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 10,
    paddingHorizontal: 24, alignItems: 'center',
  },
  guestPromptBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
