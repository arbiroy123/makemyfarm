import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store';

const LEVEL_EMOJI = {
  novice: '🌱', beginner: '🌿', intermediate: '🌳', advanced: '🏡', expert: '👨‍🌾',
};

function MenuItem({ icon, label, onPress, color = '#4CAF50' }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const level = user?.experience_level || user?.experienceLevel || 'novice';
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Farmer';

  async function handleLogout() {
    Alert.alert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['authToken', 'user']);
          logout();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{LEVEL_EMOJI[level] || '🌱'}</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{(level || 'novice').charAt(0).toUpperCase() + (level || 'novice').slice(1)}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        <MenuItem icon="trophy-outline" label="Achievements" color="#FF9800" onPress={() => navigation.navigate('Achievements')} />
        <MenuItem icon="calendar-outline" label="Planting Calendar" color="#4CAF50" onPress={() => navigation.navigate('PlantingCalendar')} />
        <MenuItem icon="grid-outline" label="Garden Planner" color="#2196F3" onPress={() => navigation.navigate('GardenPlanner')} />
        <MenuItem icon="storefront-outline" label="My Marketplace Listings" color="#9c27b0" onPress={() => navigation.navigate('Market')} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#f44336" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  avatar: { backgroundColor: '#4CAF50', paddingVertical: 36, alignItems: 'center' },
  avatarEmoji: { fontSize: 64 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  levelBadge: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
  levelText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  menuCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 14,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 16, padding: 14, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ffcdd2',
  },
  logoutText: { color: '#f44336', fontWeight: '700', fontSize: 15 },
});
