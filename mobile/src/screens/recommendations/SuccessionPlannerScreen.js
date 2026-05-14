import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import client from '../../api/client';

const INTERVAL_OPTIONS = [1, 2, 3, 4];
const BATCH_OPTIONS    = [2, 3, 4, 5, 6];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
}

export default function SuccessionPlannerScreen({ navigation, route }) {
  const { farmId } = route.params || {};

  const [vegetables, setVegetables]   = useState([]);
  const [selectedVeg, setSelectedVeg] = useState(null);
  const [intervalWks, setIntervalWks] = useState(2);
  const [batches, setBatches]         = useState(3);
  const [schedule, setSchedule]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    client.get('/planner/vegetables')
      .then(res => {
        setVegetables(res.data || []);
        if (res.data?.length > 0) setSelectedVeg(res.data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const calculate = async () => {
    if (!selectedVeg) return;
    setCalculating(true);
    setSchedule(null);
    try {
      const res = await client.get('/succession/calculate', {
        params: {
          vegetableId: selectedVeg.id,
          intervalWeeks: intervalWks,
          batches,
          startDate: new Date().toISOString().split('T')[0],
        },
      });
      setSchedule(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not calculate plan. Try again.');
    } finally {
      setCalculating(false);
    }
  };

  const savePlan = async () => {
    if (!schedule || !farmId) {
      Alert.alert('No farm', 'Open this planner from a farm to save a plan.');
      return;
    }
    setSaving(true);
    try {
      await client.post('/succession', {
        farmId,
        vegetableId: selectedVeg.id,
        intervalWeeks: intervalWks,
        batches,
        firstPlantingDate: schedule.schedule[0].plantingDate,
      });
      Alert.alert('Saved!', 'Your succession plan has been saved to your farm calendar.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not save plan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="calendar" size={28} color="#4CAF50" />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Continuous Harvest Planner</Text>
          <Text style={styles.headerSub}>Stagger planting dates for non-stop yield</Text>
        </View>
      </View>

      <View style={styles.card}>
        {/* Vegetable picker */}
        <Text style={styles.label}>Vegetable</Text>
        <View style={styles.pickerWrap}>
          <RNPickerSelect
            value={selectedVeg?.id}
            onValueChange={(id) => id && setSelectedVeg(vegetables.find(v => v.id === id))}
            items={vegetables.map(v => ({ label: v.name, value: v.id }))}
            style={{
              inputIOS: styles.pickerInput,
              inputAndroid: styles.pickerInput,
            }}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        {/* Interval */}
        <Text style={styles.label}>Planting interval</Text>
        <View style={styles.optionRow}>
          {INTERVAL_OPTIONS.map(w => (
            <TouchableOpacity
              key={w}
              style={[styles.optionChip, intervalWks === w && styles.optionChipActive]}
              onPress={() => setIntervalWks(w)}
            >
              <Text style={[styles.optionChipText, intervalWks === w && styles.optionChipTextActive]}>
                {w} wk{w > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Batches */}
        <Text style={styles.label}>Number of batches</Text>
        <View style={styles.optionRow}>
          {BATCH_OPTIONS.map(b => (
            <TouchableOpacity
              key={b}
              style={[styles.optionChip, batches === b && styles.optionChipActive]}
              onPress={() => setBatches(b)}
            >
              <Text style={[styles.optionChipText, batches === b && styles.optionChipTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={calculate} disabled={calculating}>
          {calculating
            ? <ActivityIndicator size="small" color="#fff" />
            : <><Ionicons name="calculator" size={18} color="#fff" /><Text style={styles.calcBtnText}>Calculate Plan</Text></>
          }
        </TouchableOpacity>
      </View>

      {/* Results */}
      {schedule && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>{schedule.vegetable.name} — {batches} batches every {intervalWks} week{intervalWks > 1 ? 's' : ''}</Text>

          {/* Timeline */}
          {schedule.schedule.map((batch, i) => (
            <View key={i} style={styles.batchRow}>
              <View style={[styles.batchDot, i === 0 && styles.batchDotFirst]}>
                <Text style={styles.batchDotText}>{batch.batch}</Text>
              </View>
              <View style={styles.batchLine} />
              <View style={styles.batchInfo}>
                <Text style={styles.batchLabel}>Batch {batch.batch}</Text>
                <View style={styles.dateRow}>
                  <View style={styles.datePill}>
                    <Ionicons name="arrow-down-circle-outline" size={12} color="#4CAF50" />
                    <Text style={styles.datePillText}>Plant {formatDate(batch.plantingDate)}</Text>
                  </View>
                  <View style={[styles.datePill, { backgroundColor: '#fff3e0' }]}>
                    <Ionicons name="basket-outline" size={12} color="#FF9800" />
                    <Text style={[styles.datePillText, { color: '#e65100' }]}>Harvest ~{formatDate(batch.harvestDate)}</Text>
                  </View>
                </View>
                {i === 0 && (
                  <Text style={styles.batchTip}>Start here — plant today</Text>
                )}
                {i === 1 && (
                  <Text style={styles.batchTip}>Plant when Batch 1 starts flowering</Text>
                )}
              </View>
            </View>
          ))}

          {/* Tip */}
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={16} color="#FF9800" />
            <Text style={styles.tipText}>{schedule.tip}</Text>
          </View>

          {/* Save button */}
          {farmId && (
            <TouchableOpacity style={styles.saveBtn} onPress={savePlan} disabled={saving}>
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Ionicons name="save-outline" size={18} color="#fff" /><Text style={styles.saveBtnText}>Save to Farm</Text></>
              }
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Info section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What is succession planting?</Text>
        <Text style={styles.infoText}>
          Instead of planting all seeds at once and getting a huge glut, succession planting staggers your sowing so you
          harvest fresh crops continuously over months — never too much at once, never running dry.
        </Text>
        <Text style={styles.infoText}>
          Works best for quick crops: Lettuce, Radish, Spinach, Coriander, Beans.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f5f5f5' },
  center:              { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:              { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle:         { fontSize: 16, fontWeight: '700', color: '#222' },
  headerSub:           { fontSize: 12, color: '#888', marginTop: 2 },
  card:                { backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  label:               { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  pickerWrap:          { backgroundColor: '#f5f5f5', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' },
  pickerInput:         { height: 50, paddingHorizontal: 12, color: '#222', fontSize: 14 },
  optionRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  optionChipActive:    { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  optionChipText:      { fontSize: 13, color: '#555', fontWeight: '600' },
  optionChipTextActive:{ color: '#fff' },
  calcBtn:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4CAF50', borderRadius: 12, padding: 14, marginTop: 20 },
  calcBtnText:         { color: '#fff', fontSize: 15, fontWeight: '700' },
  resultsCard:         { backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  resultsTitle:        { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 16 },
  batchRow:            { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  batchDot:            { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#4CAF50' },
  batchDotFirst:       { backgroundColor: '#4CAF50' },
  batchDotText:        { fontSize: 12, fontWeight: '700', color: '#2e7d32' },
  batchLine:           { display: 'none' },
  batchInfo:           { flex: 1 },
  batchLabel:          { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 4 },
  dateRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  datePill:            { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e8f5e9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  datePillText:        { fontSize: 11, color: '#2e7d32', fontWeight: '600' },
  batchTip:            { fontSize: 11, color: '#888', marginTop: 4, fontStyle: 'italic' },
  tipBox:              { flexDirection: 'row', gap: 8, backgroundColor: '#fffde7', borderRadius: 10, padding: 12, marginTop: 8, alignItems: 'flex-start' },
  tipText:             { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
  saveBtn:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2196F3', borderRadius: 12, padding: 13, marginTop: 16 },
  saveBtnText:         { color: '#fff', fontSize: 14, fontWeight: '700' },
  infoCard:            { backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  infoTitle:           { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  infoText:            { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 8 },
});
