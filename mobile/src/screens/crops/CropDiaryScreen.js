import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, Modal, TextInput, ScrollView, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { cropAPI } from '../../api/client';
import { useAuthStore } from '../../store';

const STAGES = [
  { key: 'seeded',    label: 'Seeded',    icon: 'ellipse-outline',     color: '#8d6e63' },
  { key: 'sprouted',  label: 'Sprouted',  icon: 'leaf-outline',        color: '#9ccc65' },
  { key: 'seedling',  label: 'Seedling',  icon: 'leaf',                color: '#7cb342' },
  { key: 'growing',   label: 'Growing',   icon: 'trending-up',         color: '#43a047' },
  { key: 'flowering', label: 'Flowering', icon: 'flower-outline',      color: '#ec407a' },
  { key: 'fruiting',  label: 'Fruiting',  icon: 'nutrition-outline',   color: '#fb8c00' },
  { key: 'harvested', label: 'Harvested', icon: 'basket-outline',      color: '#6d4c41' },
  { key: 'issue',     label: 'Issue',     icon: 'warning-outline',     color: '#e53935' },
];

const STAGE_BY_KEY = STAGES.reduce((m, s) => (m[s.key] = s, m), {});

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysSince(start, then) {
  if (!start || !then) return null;
  const ms = new Date(then) - new Date(start);
  return Math.max(0, Math.round(ms / 86400000));
}

export default function CropDiaryScreen({ route, navigation }) {
  const { cropId, cropName, plantingDate } = route.params;
  const { user } = useAuthStore();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    cropAPI.getDiary(cropId)
      .then(r => setEntries(r.data || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [cropId]);

  useEffect(() => {
    if (cropName) navigation.setOptions({ title: `${cropName} · Diary` });
    load();
  }, [cropId, cropName, load, navigation]);

  function handleDelete(entry) {
    if (entry.user_id !== user?.id) return;
    const confirm = () => {
      cropAPI.deleteDiaryEntry(cropId, entry.id)
        .then(load)
        .catch(() => Alert.alert('Error', 'Could not delete entry'));
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this entry?')) confirm();
    } else {
      Alert.alert('Delete entry?', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirm },
      ]);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={styles.container}>
      {entries.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyWrap}>
          <Ionicons name="book-outline" size={64} color="#c5e1a5" />
          <Text style={styles.emptyTitle}>Start your crop diary</Text>
          <Text style={styles.emptyText}>
            Snap a photo every week or two — watch your plant grow from seed to harvest.
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => e.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <DiaryRow
              entry={item}
              isFirst={index === 0}
              isLast={index === entries.length - 1}
              plantingDate={plantingDate}
              canDelete={item.user_id === user?.id}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddEntryModal
        visible={showAdd}
        cropId={cropId}
        onClose={() => setShowAdd(false)}
        onSaved={() => { setShowAdd(false); load(); }}
      />
    </View>
  );
}

function DiaryRow({ entry, isFirst, isLast, plantingDate, canDelete, onDelete }) {
  const stage = STAGE_BY_KEY[entry.growth_stage] || { label: '', icon: 'ellipse-outline', color: '#999' };
  const dayN = daysSince(plantingDate, entry.entry_date);

  return (
    <View style={styles.row}>
      {/* Timeline rail */}
      <View style={styles.rail}>
        <View style={[styles.railLine, isFirst && { backgroundColor: 'transparent' }]} />
        <View style={[styles.railDot, { backgroundColor: stage.color }]}>
          <Ionicons name={stage.icon} size={12} color="#fff" />
        </View>
        <View style={[styles.railLine, isLast && { backgroundColor: 'transparent' }]} />
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateText}>{formatDate(entry.entry_date)}</Text>
            {dayN !== null && (
              <Text style={styles.dayBadge}>Day {dayN}</Text>
            )}
          </View>
          {entry.growth_stage && (
            <View style={[styles.stageChip, { backgroundColor: stage.color }]}>
              <Text style={styles.stageChipText}>{stage.label}</Text>
            </View>
          )}
        </View>

        {entry.photo_url ? (
          <Image source={{ uri: entry.photo_url }} style={styles.thumb} resizeMode="cover" />
        ) : null}

        {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}

        {entry.height_cm ? (
          <Text style={styles.metaLine}>
            <Ionicons name="resize-outline" size={12} color="#666" /> {Number(entry.height_cm).toFixed(0)} cm tall
          </Text>
        ) : null}

        {(entry.first_name || entry.last_name) ? (
          <Text style={styles.author}>— {entry.first_name || ''} {entry.last_name || ''}</Text>
        ) : null}

        {canDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={14} color="#c62828" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function AddEntryModal({ visible, cropId, onClose, onSaved }) {
  const [stage, setStage] = useState('growing');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [height, setHeight] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setStage('growing'); setNote(''); setPhotoUri(null); setPhotoData(null); setHeight('');
  }

  async function pickImage(useCamera) {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to add a photo.');
      return;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    setPhotoUri(asset.uri);
    if (asset.base64) {
      setPhotoData(`data:image/jpeg;base64,${asset.base64}`);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await cropAPI.addDiaryEntry(cropId, {
        growthStage: stage,
        note: note.trim() || null,
        photoUrl: photoData,
        heightCm: height ? Number(height) : null,
      });
      reset();
      onSaved();
    } catch (e) {
      Alert.alert('Error', 'Could not save entry. Try a smaller photo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Diary Entry</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Photo */}
            <Text style={styles.label}>Photo</Text>
            {photoUri ? (
              <View>
                <Image source={{ uri: photoUri }} style={styles.previewPhoto} />
                <TouchableOpacity style={styles.removePhoto} onPress={() => { setPhotoUri(null); setPhotoData(null); }}>
                  <Ionicons name="close-circle" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoBtnRow}>
                <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
                  <Ionicons name="camera-outline" size={22} color="#4CAF50" />
                  <Text style={styles.photoBtnText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
                  <Ionicons name="images-outline" size={22} color="#4CAF50" />
                  <Text style={styles.photoBtnText}>Choose</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Stage */}
            <Text style={[styles.label, { marginTop: 18 }]}>Growth Stage</Text>
            <View style={styles.stageGrid}>
              {STAGES.map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.stageOption,
                    stage === s.key && { borderColor: s.color, backgroundColor: s.color + '22' },
                  ]}
                  onPress={() => setStage(s.key)}
                >
                  <Ionicons name={s.icon} size={16} color={stage === s.key ? s.color : '#888'} />
                  <Text style={[
                    styles.stageOptionText,
                    stage === s.key && { color: s.color, fontWeight: '700' },
                  ]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note */}
            <Text style={[styles.label, { marginTop: 18 }]}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              multiline
              placeholder="What did you see today? Any new growth, watering, fertiliser, pests…"
              placeholderTextColor="#aaa"
              value={note}
              onChangeText={setNote}
            />

            {/* Height */}
            <Text style={[styles.label, { marginTop: 14 }]}>Height (cm, optional)</Text>
            <TextInput
              style={styles.heightInput}
              keyboardType="numeric"
              placeholder="e.g. 25"
              placeholderTextColor="#aaa"
              value={height}
              onChangeText={setHeight}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Entry'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyWrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#444', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 8, lineHeight: 20 },

  row: { flexDirection: 'row', minHeight: 100 },
  rail: { width: 36, alignItems: 'center' },
  railLine: { flex: 1, width: 2, backgroundColor: '#c8e6c9' },
  railDot: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 12, marginVertical: 6, marginLeft: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  dateText: { fontSize: 13, fontWeight: '700', color: '#333' },
  dayBadge: { fontSize: 11, color: '#888', marginTop: 1 },
  stageChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  stageChipText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  thumb: {
    width: '100%', height: 180, borderRadius: 8,
    backgroundColor: '#eee', marginVertical: 6,
  },
  note: { fontSize: 13, color: '#444', lineHeight: 19, marginTop: 4 },
  metaLine: { fontSize: 12, color: '#666', marginTop: 6 },
  author: { fontSize: 11, color: '#999', marginTop: 6, fontStyle: 'italic' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, alignSelf: 'flex-start', gap: 4 },
  deleteText: { fontSize: 12, color: '#c62828' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
    elevation: 5,
  },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },

  photoBtnRow: { flexDirection: 'row', gap: 10 },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#a5d6a7', borderStyle: 'dashed', borderRadius: 8,
    paddingVertical: 16, gap: 6,
  },
  photoBtnText: { color: '#2e7d32', fontWeight: '600', fontSize: 13 },
  previewPhoto: { width: '100%', height: 220, borderRadius: 8, backgroundColor: '#eee' },
  removePhoto: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14 },

  stageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stageOption: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 16, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  stageOptionText: { fontSize: 12, color: '#555' },

  noteInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 10, minHeight: 80, textAlignVertical: 'top',
    color: '#333', fontSize: 14,
  },
  heightInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 10, color: '#333', fontSize: 14,
  },

  modalFooter: {
    flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', gap: 10,
  },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#f0f0f0' },
  cancelText: { color: '#555', fontWeight: '600' },
  saveBtn: { flex: 2, paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#4CAF50' },
  saveText: { color: '#fff', fontWeight: '700' },
});
