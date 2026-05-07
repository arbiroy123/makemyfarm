import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { cropAPI } from '../../api/client';

function ProbabilityBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct > 60 ? '#f44336' : pct > 30 ? '#FF9800' : '#4CAF50';
  return (
    <View style={styles.barWrap}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      <Text style={[styles.barLabel, { color }]}>{pct}%</Text>
    </View>
  );
}

export default function DiseaseDetectionScreen({ route, navigation }) {
  const { cropId, cropName } = route.params || {};

  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  async function pickImage(useCamera) {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
    setResults(null);
  }

  async function analyze() {
    if (!photoBase64) return;
    setAnalyzing(true);
    try {
      const res = await cropAPI.diagnoseCrop(photoBase64, cropName);
      setResults(res.data.diseases || []);
    } catch (e) {
      Alert.alert('Error', 'Could not analyze plant. Try again with a clearer photo.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function addToDiary() {
    if (!cropId || !results) return;
    try {
      const topDisease = results[0];
      await cropAPI.addDiaryEntry(cropId, {
        growthStage: 'issue',
        note: `Disease scan: ${topDisease.name} (${Math.round(topDisease.probability * 100)}% confidence). Treatment: ${topDisease.treatment}`,
        photoUrl: photoBase64,
      });
      Alert.alert('Saved', 'Diagnosis added to crop diary.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save to diary.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔬 Plant Diagnosis</Text>
        <Text style={styles.headerSub}>
          {cropName ? `Analyzing: ${cropName}` : 'Take a clear photo of the affected area'}
        </Text>
      </View>

      {/* Photo area */}
      <View style={styles.photoSection}>
        {photoUri ? (
          <View>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            <TouchableOpacity style={styles.changePhoto} onPress={() => { setPhotoUri(null); setPhotoBase64(null); setResults(null); }}>
              <Ionicons name="close-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoBtnRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
              <Ionicons name="camera-outline" size={32} color="#4CAF50" />
              <Text style={styles.photoBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
              <Ionicons name="images-outline" size={32} color="#4CAF50" />
              <Text style={styles.photoBtnText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Analyze button */}
      {photoUri && !results && (
        <TouchableOpacity
          style={[styles.analyzeBtn, analyzing && { opacity: 0.6 }]}
          onPress={analyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.analyzeBtnText}>Analyzing…</Text>
            </>
          ) : (
            <>
              <Ionicons name="search-outline" size={20} color="#fff" />
              <Text style={styles.analyzeBtnText}>Analyze Plant</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Results */}
      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Diagnosis Results</Text>
          {results.map((disease, i) => (
            <View key={i} style={styles.diseaseCard}>
              <View style={styles.diseaseHeader}>
                <Text style={styles.diseaseName}>{disease.name}</Text>
              </View>
              <ProbabilityBar value={disease.probability} />
              {disease.description ? (
                <Text style={styles.diseaseDesc}>{disease.description}</Text>
              ) : null}
              {disease.treatment ? (
                <View style={styles.treatmentBox}>
                  <Ionicons name="medkit-outline" size={14} color="#2e7d32" />
                  <Text style={styles.treatmentText}>{disease.treatment}</Text>
                </View>
              ) : null}
            </View>
          ))}

          {cropId && (
            <TouchableOpacity style={styles.diaryBtn} onPress={addToDiary}>
              <Ionicons name="book-outline" size={18} color="#fff" />
              <Text style={styles.diaryBtnText}>Save to Crop Diary</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tips */}
      {!results && (
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>For best results</Text>
          <Text style={styles.tipText}>• Photograph the most affected leaf or stem</Text>
          <Text style={styles.tipText}>• Use good natural lighting</Text>
          <Text style={styles.tipText}>• Keep the plant in focus and fill the frame</Text>
          <Text style={styles.tipText}>• Avoid shadows across the affected area</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  photoSection: { margin: 12 },
  photo: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#eee' },
  changePhoto: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16 },
  photoBtnRow: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 24, alignItems: 'center',
    borderWidth: 2, borderColor: '#c8e6c9', borderStyle: 'dashed',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
  },
  photoBtnText: { color: '#2e7d32', fontWeight: '600', marginTop: 8, fontSize: 13 },

  analyzeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#4CAF50', margin: 12, padding: 16,
    borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  analyzeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  resultsSection: { marginHorizontal: 12 },
  resultsTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 10 },

  diseaseCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  diseaseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  diseaseName: { fontSize: 15, fontWeight: '700', color: '#333', flex: 1 },

  barWrap: {
    height: 12, backgroundColor: '#e0e0e0', borderRadius: 6,
    marginBottom: 10, overflow: 'hidden', flexDirection: 'row', alignItems: 'center',
  },
  barFill: { height: '100%', borderRadius: 6 },
  barLabel: { position: 'absolute', right: 6, fontSize: 10, fontWeight: '700' },

  diseaseDesc: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 8 },
  treatmentBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#f1f8e9', borderRadius: 8, padding: 10,
  },
  treatmentText: { fontSize: 12, color: '#2e7d32', flex: 1, lineHeight: 18 },

  diaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#1976d2', padding: 14, borderRadius: 12,
    marginVertical: 12,
  },
  diaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  tipsCard: {
    backgroundColor: '#fff8e1', margin: 12, borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: '#FF9800', padding: 14,
  },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: '#e65100', marginBottom: 8 },
  tipText: { fontSize: 13, color: '#555', lineHeight: 22 },
});
