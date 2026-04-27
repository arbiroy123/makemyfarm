import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Modal, FlatList, Platform,
} from 'react-native';
import { farmAPI } from '../../api/client';
import { useFarmStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';

const FARM_TYPES = [
  { value: 'backyard',   label: 'Backyard Garden',   icon: 'home',         hint: 'Small home garden, typically under 500 sq ft' },
  { value: 'container',  label: 'Container Garden',  icon: 'cube',         hint: 'Pots & raised beds — any balcony or patio' },
  { value: 'rooftop',    label: 'Rooftop Garden',    icon: 'business',     hint: 'Urban rooftop growing space' },
  { value: 'community',  label: 'Community Plot',    icon: 'people',       hint: 'Shared community garden allotment' },
  { value: 'greenhouse', label: 'Greenhouse',        icon: 'sunny',        hint: 'Controlled indoor growing environment' },
  { value: 'medium',     label: 'Small Farm',        icon: 'leaf',         hint: 'Dedicated growing space, 500–5,000 sq ft' },
  { value: 'large',      label: 'Large Farm',        icon: 'earth',        hint: 'Commercial or large-scale growing, 5,000+ sq ft' },
  { value: 'hybrid',     label: 'Mixed / Hybrid',    icon: 'git-merge',    hint: 'Combination of different growing methods' },
];

const SIZE_PRESETS = [
  { sqft: 25,    label: '25',    hint: '5×5 ft  –  one raised bed' },
  { sqft: 100,   label: '100',   hint: '10×10 ft  –  standard plot' },
  { sqft: 250,   label: '250',   hint: '10×25 ft  –  starter garden' },
  { sqft: 500,   label: '500',   hint: '20×25 ft  –  community plot' },
  { sqft: 1000,  label: '1,000', hint: '30×33 ft  –  serious growing' },
  { sqft: 5000,  label: '5,000', hint: '~0.1 acre  –  small farm' },
  { sqft: 21780, label: '½ ac',  hint: '~21,780 sq ft' },
  { sqft: 43560, label: '1 ac',  hint: '~43,560 sq ft' },
];

// Derive a growing-focused climate zone from monthly temperature + precipitation data
function classifyClimate(monthlyTemps, monthlyPrecip) {
  const annualPrecip = monthlyPrecip.reduce((a, b) => a + b, 0);
  const coldest = Math.min(...monthlyTemps);
  const warmest = Math.max(...monthlyTemps);

  if (coldest > 18)                                    return 'Tropical';
  if (annualPrecip < 250)                              return 'Arid (Desert)';
  if (annualPrecip < 500)                              return 'Semi-Arid';
  if (coldest >= 0 && warmest > 22 && annualPrecip > 800) return 'Subtropical';
  if (coldest >= 0 && warmest <= 22)                   return 'Mediterranean / Oceanic';
  if (coldest < -15)                                   return 'Subarctic';
  if (coldest < 0 && warmest > 22)                     return 'Humid Continental';
  if (coldest < 0)                                     return 'Temperate Continental';
  return 'Temperate';
}

const CLIMATE_HINTS = {
  'Tropical':                 'Year-round warmth — ideal for heat-loving crops',
  'Arid (Desert)':            'Very dry — needs irrigation & drought-resistant varieties',
  'Semi-Arid':                'Dry — water-conserving techniques recommended',
  'Subtropical':              'Warm & humid — long growing season',
  'Mediterranean / Oceanic':  'Mild year-round — good for most vegetables',
  'Humid Continental':        'Cold winters, warm summers — moderate season',
  'Temperate Continental':    'Cold winters — good summer growing season',
  'Subarctic':                'Short season — hardy crops only',
  'Temperate':                'Moderate climate — suitable for most crops',
};

// Format Nominatim display_name into a shorter human-readable address
function formatAddress(display_name) {
  // display_name is "Princeton Junction, West Windsor Township, Mercer County, New Jersey, 08550, United States"
  // Return the first 2-3 meaningful parts
  const parts = display_name.split(', ');
  if (parts.length <= 3) return display_name;
  // Keep: locality/town, state/county, country — skip long middle parts
  return [parts[0], parts[parts.length - 2], parts[parts.length - 1]].join(', ');
}

async function detectClimateZone(addressText) {
  // Step 1: geocode with Nominatim (OpenStreetMap, free, global, no API key)
  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'FarmSync-App' } }
  );
  const geoData = await geoRes.json();
  if (!geoData.length) throw new Error('Address not found — try a city name or postal code');

  const { lat, lon, display_name } = geoData[0];

  // Step 2: fetch daily data for a stable archive year and aggregate to monthly
  // Open-Meteo archive API only supports `daily`, not `monthly` directly
  const year = new Date().getFullYear() - 2; // use 2 years back for full-year data guarantee
  const climateRes = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
    `&start_date=${year}-01-01&end_date=${year}-12-31` +
    `&daily=temperature_2m_mean,precipitation_sum&timezone=auto`
  );
  const climateData = await climateRes.json();

  if (!climateData.daily?.temperature_2m_mean) {
    throw new Error('Climate data unavailable for this location');
  }

  // Aggregate daily → monthly
  const tempBuckets  = Array.from({ length: 12 }, () => []);
  const precipBuckets = Array.from({ length: 12 }, () => []);

  climateData.daily.time.forEach((dateStr, i) => {
    const month = new Date(dateStr).getMonth();
    const temp   = climateData.daily.temperature_2m_mean[i];
    const precip = climateData.daily.precipitation_sum[i];
    if (temp   != null) tempBuckets[month].push(temp);
    if (precip != null) precipBuckets[month].push(precip);
  });

  const monthlyTemps  = tempBuckets.map(b  => b.length ? b.reduce((a, v) => a + v, 0) / b.length : 0);
  const monthlyPrecip = precipBuckets.map(b => b.length ? b.reduce((a, v) => a + v, 0)            : 0);

  const zone = classifyClimate(monthlyTemps, monthlyPrecip);

  return {
    zone,
    displayName: display_name,
    shortAddress: formatAddress(display_name),
    lat: parseFloat(lat),
    lon: parseFloat(lon),
  };
}

// Simple cross-platform dropdown
function Dropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View>
      <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setOpen(true)}>
        <View style={{ flex: 1 }}>
          <Text style={selected ? styles.dropdownValue : styles.dropdownPlaceholder}>
            {selected ? selected.label : placeholder}
          </Text>
          {selected && <Text style={styles.dropdownHint}>{selected.hint}</Text>}
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
      </TouchableOpacity>

      {open && (
        <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setOpen(false)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Farm Type</Text>
              <FlatList
                data={options}
                keyExtractor={i => i.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.option, item.value === value && styles.optionSelected]}
                    onPress={() => { onChange(item.value); setOpen(false); }}
                  >
                    <Ionicons name={item.icon} size={20} color={item.value === value ? '#4CAF50' : '#666'} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[styles.optionLabel, item.value === value && styles.optionLabelSelected]}>
                        {item.label}
                      </Text>
                      <Text style={styles.optionHint}>{item.hint}</Text>
                    </View>
                    {item.value === value && <Ionicons name="checkmark" size={18} color="#4CAF50" />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export default function CreateFarmScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [farmType, setFarmType] = useState('backyard');
  const [sizeSqft, setSizeSqft] = useState('');
  const [address, setAddress] = useState('');
  const [climateZone, setClimateZone] = useState('');
  const [climateHint, setClimateHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [climateLoading, setClimateLoading] = useState(false);
  const [error, setError] = useState('');
  const [climateError, setClimateError] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState('');

  const { addFarm } = useFarmStore();

  const handleDetectClimate = async () => {
    if (!address.trim()) {
      setClimateError('Enter an address, city, or postal code first');
      return;
    }
    setClimateLoading(true);
    setClimateError('');
    setClimateZone('');
    setClimateHint('');
    try {
      const result = await detectClimateZone(address.trim());
      setClimateZone(result.zone);
      setClimateHint(CLIMATE_HINTS[result.zone] || '');
      setLocationCoords({ latitude: result.lat, longitude: result.lon });
      setResolvedAddress(result.displayName);
      // Auto-fill address field with the clean resolved address
      setAddress(result.shortAddress);
    } catch (e) {
      setClimateError(e.message || 'Could not detect climate zone');
    } finally {
      setClimateLoading(false);
    }
  };

  const handleSizePreset = (sqft) => {
    setSizeSqft(String(sqft));
  };

  const handleCreateFarm = async () => {
    setError('');
    if (!name.trim()) { setError('Farm name is required'); return; }
    if (!locationCoords) { setError('Please detect your climate zone first — this sets your location'); return; }

    setLoading(true);
    try {
      const response = await farmAPI.createFarm({
        name: name.trim(),
        description: description.trim(),
        farmType,
        sizeSqft: sizeSqft ? parseFloat(sizeSqft.replace(',', '')) : null,
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude,
        address: resolvedAddress || address,
        climateZone,
      });
      addFarm(response.data);
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create farm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.title}>Create New Farm</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#c62828" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Farm Name */}
        <Text style={styles.label}>Farm Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. My Backyard Garden"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What do you plan to grow? Any special goals?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          editable={!loading}
        />

        {/* Farm Type */}
        <Text style={styles.label}>Farm Type <Text style={styles.required}>*</Text></Text>
        <Dropdown
          value={farmType}
          options={FARM_TYPES}
          onChange={setFarmType}
          placeholder="Select farm type…"
        />

        {/* Size */}
        <Text style={styles.label}>Size (sq ft)</Text>
        <Text style={styles.sublabel}>Not sure? Pick the closest match below</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
          {SIZE_PRESETS.map(p => (
            <TouchableOpacity
              key={p.sqft}
              style={[styles.presetChip, sizeSqft === String(p.sqft) && styles.presetChipActive]}
              onPress={() => handleSizePreset(p.sqft)}
            >
              <Text style={[styles.presetLabel, sizeSqft === String(p.sqft) && styles.presetLabelActive]}>
                {p.label}
              </Text>
              <Text style={[styles.presetHint, sizeSqft === String(p.sqft) && styles.presetHintActive]}>
                {p.hint}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput
          style={styles.input}
          placeholder="Or type exact size in sq ft"
          value={sizeSqft}
          onChangeText={setSizeSqft}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        {/* Address + Climate Zone */}
        <Text style={styles.label}>Address / Postal Code <Text style={styles.required}>*</Text></Text>
        <Text style={styles.sublabel}>Works worldwide — city name, postcode, or full address</Text>
        <View style={styles.addressRow}>
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="e.g. SW1A 1AA, Tokyo, or 10001"
            value={address}
            onChangeText={(t) => { setAddress(t); setClimateZone(''); setClimateHint(''); setClimateError(''); }}
            editable={!loading && !climateLoading}
          />
          <TouchableOpacity
            style={[styles.detectButton, climateLoading && styles.detectButtonDisabled]}
            onPress={handleDetectClimate}
            disabled={climateLoading || loading}
          >
            {climateLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="globe" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        {climateError ? (
          <Text style={styles.climateError}>{climateError}</Text>
        ) : null}

        {climateZone ? (
          <View style={styles.climateResult}>
            <Ionicons name="leaf" size={18} color="#2e7d32" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.climateZoneText}>{climateZone}</Text>
              <Text style={styles.climateHintText}>{climateHint}</Text>
              {resolvedAddress ? (
                <Text style={styles.resolvedAddress} numberOfLines={1}>{resolvedAddress}</Text>
              ) : null}
            </View>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
        ) : !climateLoading && locationCoords === null ? (
          <View style={styles.climatePrompt}>
            <Ionicons name="information-circle-outline" size={16} color="#1976d2" />
            <Text style={styles.climatePromptText}>
              Tap the globe button to auto-detect your climate zone and set your location
            </Text>
          </View>
        ) : null}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateFarm}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Create Farm</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },

  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 8 },
  sublabel: { fontSize: 12, color: '#888', marginBottom: 8 },
  required: { color: '#e53935' },

  input: {
    backgroundColor: '#fff', borderRadius: 8, padding: 12,
    borderColor: '#ddd', borderWidth: 1, fontSize: 14, marginBottom: 12,
  },
  textArea: { textAlignVertical: 'top', minHeight: 80 },

  // Dropdown
  dropdownTrigger: {
    backgroundColor: '#fff', borderRadius: 8, borderColor: '#ddd', borderWidth: 1,
    padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  dropdownValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  dropdownPlaceholder: { fontSize: 14, color: '#aaa' },
  dropdownHint: { fontSize: 12, color: '#888', marginTop: 2 },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 12, width: '100%',
    maxHeight: '80%', paddingTop: 16, paddingBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', paddingHorizontal: 16, marginBottom: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16, borderBottomColor: '#f0f0f0', borderBottomWidth: 1,
  },
  optionSelected: { backgroundColor: '#f1f8f6' },
  optionLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
  optionLabelSelected: { color: '#2e7d32' },
  optionHint: { fontSize: 12, color: '#888', marginTop: 2 },

  // Size presets
  presetsRow: { marginBottom: 10 },
  presetChip: {
    backgroundColor: '#fff', borderRadius: 8, borderColor: '#ddd', borderWidth: 1,
    paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, minWidth: 80,
  },
  presetChipActive: { borderColor: '#4CAF50', backgroundColor: '#f1f8f6' },
  presetLabel: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
  presetLabelActive: { color: '#2e7d32' },
  presetHint: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 2 },
  presetHintActive: { color: '#4CAF50' },

  // Address row
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 0 },
  addressInput: { flex: 1, marginBottom: 8 },
  detectButton: {
    backgroundColor: '#4CAF50', borderRadius: 8, padding: 14,
    justifyContent: 'center', alignItems: 'center', width: 48,
  },
  detectButtonDisabled: { opacity: 0.6 },

  // Climate feedback
  climateError: { fontSize: 12, color: '#c62828', marginBottom: 12, marginTop: -4 },
  climateResult: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#f1f8f6', borderColor: '#a5d6a7', borderWidth: 1,
    borderRadius: 8, padding: 12, marginBottom: 16,
  },
  climateZoneText: { fontSize: 14, fontWeight: '700', color: '#2e7d32' },
  climateHintText: { fontSize: 12, color: '#555', marginTop: 2 },
  resolvedAddress: { fontSize: 11, color: '#888', marginTop: 4 },
  climatePrompt: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#e3f2fd', borderRadius: 8, padding: 10, marginBottom: 16, gap: 6,
  },
  climatePromptText: { fontSize: 12, color: '#1565c0', flex: 1 },

  // Submit
  button: { backgroundColor: '#4CAF50', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffebee', borderColor: '#ef5350', borderWidth: 1,
    borderRadius: 8, padding: 12, marginBottom: 15,
  },
  errorText: { color: '#c62828', fontSize: 14, flex: 1 },
});
