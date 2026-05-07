import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { marketplaceAPI, achievementsAPI } from '../../api/client';

const LISTING_TYPES = [
  { key: 'free',  label: 'Free',    icon: 'gift-outline',       color: '#4CAF50' },
  { key: 'sale',  label: 'For Sale', icon: 'pricetag-outline',  color: '#2196F3' },
  { key: 'trade', label: 'Trade',   icon: 'swap-horizontal-outline', color: '#FF9800' },
];

export default function CreateListingScreen({ navigation, route }) {
  const passedLocation = route.params?.location;

  const [vegName, setVegName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState('free');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!vegName.trim()) {
      Alert.alert('Required', 'Please enter a vegetable name.');
      return;
    }

    setSaving(true);
    try {
      let lat = passedLocation?.latitude;
      let lng = passedLocation?.longitude;
      if (!lat || !lng) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      }
      if (!lat || !lng) {
        Alert.alert('Location needed', 'Please enable location access to create a listing.');
        setSaving(false);
        return;
      }

      await marketplaceAPI.createListing({
        vegetableName: vegName.trim(),
        quantityKg: quantity ? parseFloat(quantity) : null,
        pricePerKg: price ? parseFloat(price) : 0,
        listingType,
        description: description.trim() || null,
        latitude: lat,
        longitude: lng,
      });

      // Award market trader achievement
      achievementsAPI.checkAchievements().catch(() => {});

      Alert.alert('Listed!', 'Your produce is now visible to nearby farmers.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch {
      Alert.alert('Error', 'Could not create listing. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>List Surplus Produce</Text>
        <Text style={styles.headerSub}>Share your harvest with nearby farmers</Text>
      </View>

      <View style={styles.form}>
        {/* Vegetable name */}
        <Text style={styles.label}>Vegetable / Produce *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Tomatoes, Zucchini, Fresh Basil…"
          placeholderTextColor="#aaa"
          value={vegName}
          onChangeText={setVegName}
        />

        {/* Listing type */}
        <Text style={styles.label}>Listing Type</Text>
        <View style={styles.typeRow}>
          {LISTING_TYPES.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeBtn, listingType === t.key && { borderColor: t.color, backgroundColor: t.color + '18' }]}
              onPress={() => setListingType(t.key)}
            >
              <Ionicons name={t.icon} size={18} color={listingType === t.key ? t.color : '#888'} />
              <Text style={[styles.typeBtnText, listingType === t.key && { color: t.color, fontWeight: '700' }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quantity */}
        <Text style={styles.label}>Quantity (kg, optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2.5"
          placeholderTextColor="#aaa"
          keyboardType="decimal-pad"
          value={quantity}
          onChangeText={setQuantity}
        />

        {/* Price (if sale) */}
        {listingType === 'sale' && (
          <>
            <Text style={styles.label}>Price per kg ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3.00"
              placeholderTextColor="#aaa"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </>
        )}

        {/* Description */}
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Fresh from the garden, organic, available for pickup…"
          placeholderTextColor="#aaa"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.6 }]}
          onPress={submit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="storefront-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>Post Listing</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  form: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 14 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 12, fontSize: 14, color: '#333',
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },

  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  typeBtnText: { fontSize: 13, color: '#888' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#4CAF50', padding: 16, borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
