import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const VEG_EMOJI_MAP = {
  tomato: '🍅', pepper: '🫑', lettuce: '🥬', carrot: '🥕',
  cucumber: '🥒', bean: '🫘', pea: '🫛', corn: '🌽',
  potato: '🥔', onion: '🧅', garlic: '🧄', spinach: '🌿',
  kale: '🥦', broccoli: '🥦', squash: '🎃', pumpkin: '🎃',
  eggplant: '🍆', zucchini: '🥒',
};
function vegEmoji(name) {
  const lower = (name || '').toLowerCase();
  return Object.entries(VEG_EMOJI_MAP).find(([k]) => lower.includes(k))?.[1] || '🌱';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function daysGrown(plantingDate) {
  if (!plantingDate) return null;
  return Math.max(0, Math.floor((new Date() - new Date(plantingDate)) / 86400000));
}

const ShareCard = forwardRef(function ShareCard({ crop, farmName, latestPhoto }, ref) {
  const days = daysGrown(crop?.planting_date);

  return (
    <View ref={ref} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>FarmSync</Text>
        <Text style={styles.tagline}>Growing together 🌱</Text>
      </View>

      {/* Photo */}
      {latestPhoto ? (
        <Image source={{ uri: latestPhoto }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.vegEmoji}>{vegEmoji(crop?.vegetable_name)}</Text>
        </View>
      )}

      {/* Crop info */}
      <View style={styles.info}>
        <Text style={styles.vegName}>{crop?.vegetable_name || 'My Crop'}</Text>
        {farmName ? <Text style={styles.farmName}>📍 {farmName}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{days ?? '—'}</Text>
            <Text style={styles.statLabel}>Days Growing</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDate(crop?.planting_date)}</Text>
            <Text style={styles.statLabel}>Planted</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Grown with FarmSync · farmsync.app</Text>
      </View>
    </View>
  );
});

export default ShareCard;

const styles = StyleSheet.create({
  card: {
    width: 320, backgroundColor: '#fff',
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  header: { backgroundColor: '#4CAF50', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  photo: { width: '100%', height: 200, backgroundColor: '#e8f5e9' },
  photoPlaceholder: { width: '100%', height: 200, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
  vegEmoji: { fontSize: 80 },
  info: { padding: 16 },
  vegName: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20', marginBottom: 4 },
  farmName: { fontSize: 13, color: '#666', marginBottom: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#333', textAlign: 'center' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  divider: { width: 1, height: 36, backgroundColor: '#e0e0e0', marginHorizontal: 12 },
  footer: { backgroundColor: '#f5f5f5', padding: 10, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#999' },
});
