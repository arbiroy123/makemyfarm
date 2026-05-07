import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { achievementsAPI } from '../../api/client';

function BadgeCard({ item }) {
  return (
    <View style={[styles.card, !item.earned && styles.cardLocked]}>
      <Text style={styles.badge}>{item.badge}</Text>
      <Text style={[styles.name, !item.earned && styles.nameLocked]}>{item.name}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      {item.earned && item.earned_at ? (
        <Text style={styles.earnedDate}>
          {new Date(item.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      ) : !item.earned ? (
        <Text style={styles.locked}>🔒 Locked</Text>
      ) : null}
    </View>
  );
}

export default function AchievementsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementsAPI.getAchievements()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Check for new achievements on open
    achievementsAPI.checkAchievements().catch(() => {});
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        {data && (
          <Text style={styles.headerSub}>{data.earnedCount} / {data.total} unlocked</Text>
        )}
      </View>
      <FlatList
        data={data?.achievements || []}
        keyExtractor={item => item.key}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => <BadgeCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  cardLocked: { backgroundColor: '#f5f5f5', opacity: 0.6 },
  badge: { fontSize: 36, marginBottom: 8 },
  name: { fontSize: 13, fontWeight: '700', color: '#333', textAlign: 'center' },
  nameLocked: { color: '#999' },
  desc: { fontSize: 11, color: '#777', textAlign: 'center', marginTop: 4, lineHeight: 16 },
  earnedDate: { fontSize: 10, color: '#4CAF50', marginTop: 6, fontWeight: '600' },
  locked: { fontSize: 11, color: '#bbb', marginTop: 6 },
});
