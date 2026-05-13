import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { marketplaceAPI } from '../../api/client';
import { useAuthStore } from '../../store';

const TYPE_COLORS = { free: '#4CAF50', sale: '#2196F3', trade: '#FF9800' };
const TYPE_LABELS = { free: 'FREE', sale: 'FOR SALE', trade: 'TRADE' };

const VEG_EMOJI = {
  tomato: '🍅', pepper: '🫑', lettuce: '🥬', carrot: '🥕', cucumber: '🥒',
  zucchini: '🥒', bean: '🫘', pea: '🫛', corn: '🌽', potato: '🥔',
  onion: '🧅', garlic: '🧄', spinach: '🥬', kale: '🥬', broccoli: '🥦',
  cauliflower: '🥦', eggplant: '🍆', pumpkin: '🎃', squash: '🎃', herb: '🌿',
};
function vegEmoji(name) {
  const lower = (name || '').toLowerCase();
  return Object.entries(VEG_EMOJI).find(([k]) => lower.includes(k))?.[1] || '🌱';
}

function ListingCard({ item, onPress }) {
  const typeColor = TYPE_COLORS[item.listing_type] || '#4CAF50';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <Text style={styles.emoji}>{vegEmoji(item.vegetable_name)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.vegName}>{item.vegetable_name}</Text>
          {item.quantity_kg && (
            <Text style={styles.qty}>{item.quantity_kg} kg available</Text>
          )}
        </View>
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeText}>{TYPE_LABELS[item.listing_type] || 'FREE'}</Text>
        </View>
      </View>
      {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
      <View style={styles.cardFooter}>
        <Ionicons name="person-outline" size={12} color="#888" />
        <Text style={styles.seller}>{item.first_name} {item.last_name}</Text>
        {item.distance_km != null && (
          <>
            <Ionicons name="location-outline" size={12} color="#888" style={{ marginLeft: 10 }} />
            <Text style={styles.dist}>{item.distance_km} km away</Text>
          </>
        )}
        {item.listing_type === 'sale' && item.price_per_kg > 0 && (
          <Text style={styles.price}>${item.price_per_kg}/kg</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'sale', label: 'For Sale' },
  { key: 'trade', label: 'Trade' },
];

export default function MarketplaceScreen({ navigation }) {
  const { isGuest } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [location, setLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const load = useCallback(async (loc) => {
    const useLoc = loc || location;
    if (!useLoc) return;
    try {
      const res = await marketplaceAPI.getNearby(useLoc.latitude, useLoc.longitude);
      setListings(res.data || []);
    } catch (err) {
      const status = err?.response?.status;
      if (status !== 401 && status !== 403) {
        // Don't alert on auth errors — user can still see the empty state
        Alert.alert('Error', 'Could not load listings. Please check your connection.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationDenied(true);
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        load(loc.coords);
      } catch {
        setLocationDenied(true);
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filter === 'all' ? listings : listings.filter(l => l.listing_type === filter);

  return (
    <View style={styles.container}>
      {/* Filter bar */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 100, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={['#4CAF50']} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name={locationDenied ? 'location-outline' : 'storefront-outline'}
                size={64}
                color="#c8e6c9"
              />
              <Text style={styles.emptyTitle}>
                {locationDenied ? 'Location access needed' : 'No listings nearby'}
              </Text>
              <Text style={styles.emptyText}>
                {locationDenied
                  ? 'Enable location permission in your device settings to see nearby listings.'
                  : 'Be the first to list your surplus produce!'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            />
          )}
        />
      )}

      {/* FAB — hidden for guests */}
      {!isGuest && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateListing', { location })}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  filterRow: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  filterText: { fontSize: 13, color: '#555', fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  emoji: { fontSize: 32 },
  vegName: { fontSize: 16, fontWeight: '700', color: '#333' },
  qty: { fontSize: 12, color: '#666', marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  desc: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seller: { fontSize: 12, color: '#888' },
  dist: { fontSize: 12, color: '#888' },
  price: { marginLeft: 'auto', fontSize: 14, fontWeight: '700', color: '#2196F3' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#444', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
});
