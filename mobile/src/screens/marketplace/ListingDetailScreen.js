import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { marketplaceAPI } from '../../api/client';
import { useAuthStore } from '../../store';

const TYPE_COLORS = { free: '#4CAF50', sale: '#2196F3', trade: '#FF9800' };

export default function ListingDetailScreen({ route, navigation }) {
  const { listingId } = route.params;
  const { user, isGuest, exitGuestMode } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceAPI.getListing(listingId)
      .then(r => setListing(r.data))
      .catch(() => Alert.alert('Error', 'Could not load listing.'))
      .finally(() => setLoading(false));
  }, [listingId]);

  async function closeListing() {
    Alert.alert('Close Listing?', 'This will mark it as no longer available.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          try {
            await marketplaceAPI.updateListing(listingId, { isActive: false });
            Alert.alert('Closed', 'Your listing has been removed.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          } catch {
            Alert.alert('Error', 'Could not close listing.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }
  if (!listing) {
    return <View style={styles.center}><Text style={styles.errorText}>Listing not found</Text></View>;
  }

  const isOwner = listing.user_id === user?.id;
  const typeColor = TYPE_COLORS[listing.listing_type] || '#4CAF50';
  const typeLabel = { free: 'FREE', sale: 'FOR SALE', trade: 'TRADE' }[listing.listing_type] || 'FREE';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.header, { backgroundColor: typeColor }]}>
        <Text style={styles.vegName}>{listing.vegetable_name}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        {listing.quantity_kg && (
          <View style={styles.infoRow}>
            <Ionicons name="scale-outline" size={18} color="#4CAF50" />
            <Text style={styles.infoText}>{listing.quantity_kg} kg available</Text>
          </View>
        )}
        {listing.listing_type === 'sale' && listing.price_per_kg > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={18} color="#2196F3" />
            <Text style={[styles.infoText, { color: '#2196F3', fontWeight: '700' }]}>
              ${listing.price_per_kg} per kg
            </Text>
          </View>
        )}
        {listing.distance_km != null && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#FF9800" />
            <Text style={styles.infoText}>{listing.distance_km} km away</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#888" />
          <Text style={styles.infoText}>
            Listed {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </View>

      {listing.description ? (
        <View style={styles.descCard}>
          <Text style={styles.descTitle}>About this listing</Text>
          <Text style={styles.descText}>{listing.description}</Text>
        </View>
      ) : null}

      {/* Seller */}
      <View style={styles.sellerCard}>
        <Ionicons name="person-circle-outline" size={40} color="#4CAF50" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.sellerName}>{listing.first_name} {listing.last_name}</Text>
          <Text style={styles.sellerSub}>Listing owner</Text>
        </View>
      </View>

      {/* Contact / Actions */}
      {!isOwner && isGuest ? (
        <TouchableOpacity style={styles.contactBtn} onPress={exitGuestMode}>
          <Ionicons name="log-in-outline" size={20} color="#fff" />
          <Text style={styles.contactBtnText}>Sign In to Contact Seller</Text>
        </TouchableOpacity>
      ) : !isOwner ? (
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Linking.openURL(`mailto:${listing.email}?subject=Interested in your ${listing.vegetable_name} listing`)}
        >
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={styles.contactBtnText}>Contact Seller</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.closeBtn} onPress={closeListing}>
          <Ionicons name="close-circle-outline" size={20} color="#fff" />
          <Text style={styles.closeBtnText}>Close This Listing</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#c62828' },

  header: { padding: 24, paddingTop: 28 },
  vegName: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  typeBadge: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  typeText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  infoCard: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoText: { fontSize: 14, color: '#333' },

  descCard: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 2, elevation: 2 },
  descTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  descText: { fontSize: 14, color: '#555', lineHeight: 21 },

  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 12, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 2, elevation: 2 },
  sellerName: { fontSize: 16, fontWeight: '700', color: '#333' },
  sellerSub: { fontSize: 12, color: '#888', marginTop: 2 },

  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4CAF50', margin: 12, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  contactBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  closeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f44336', margin: 12, padding: 16, borderRadius: 12 },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
