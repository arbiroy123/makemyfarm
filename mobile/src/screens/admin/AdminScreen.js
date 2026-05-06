import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../api/client';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { key: 'requests',  label: 'Requests',  icon: 'leaf-outline' },
  { key: 'users',     label: 'Users',     icon: 'people-outline' },
];

const REQUEST_FILTERS = ['pending', 'approved', 'rejected', 'all'];

const STATUS_COLOR = { pending: '#FF9800', approved: '#4CAF50', rejected: '#F44336' };
const EXP_COLOR    = {
  novice: '#9E9E9E', beginner: '#8BC34A', intermediate: '#2196F3',
  advanced: '#9C27B0', expert: '#FF5722',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function formatAction(action, details) {
  if (!action) return 'Activity';
  switch (action) {
    case 'crop_planted':   return `Planted ${details?.vegetable_name || 'a crop'}`;
    case 'crop_harvested': return `Harvested ${details?.vegetable_name || 'a crop'}`;
    case 'farm_created':   return 'Created a farm';
    default: return action.replace(/_/g, ' ');
  }
}

function StatCard({ icon, color, value, label }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value ?? '–'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminScreen() {
  const [activeTab, setActiveTab]       = useState('dashboard');
  const [stats, setStats]               = useState(null);
  const [activity, setActivity]         = useState([]);
  const [requests, setRequests]         = useState([]);
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [requestFilter, setRequestFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null); // request id in flight

  const loadAll = useCallback(async () => {
    try {
      const [statsRes, actRes, reqRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getActivity(),
        adminAPI.getVegetableRequests(),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data);
      setActivity(Array.isArray(actRes.data)   ? actRes.data   : []);
      setRequests(Array.isArray(reqRes.data)   ? reqRes.data   : []);
      setUsers(Array.isArray(usersRes.data)    ? usersRes.data : []);
    } catch (e) {
      console.error('Admin load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const handleRequestAction = async (id, status) => {
    setActionLoading(id);
    try {
      const res = await adminAPI.updateRequestStatus(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: res.data.status } : r));
      setStats(prev => prev
        ? { ...prev, pending_requests: Math.max(0, prev.pending_requests - 1) }
        : prev
      );
    } catch {
      Alert.alert('Error', 'Could not update request. Try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requestFilter === 'all'
    ? requests
    : requests.filter(r => r.status === requestFilter);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const hasBadge = tab.key === 'requests' && (stats?.pending_requests ?? 0) > 0;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <View>
                <Ionicons name={tab.icon} size={18} color={isActive ? '#4CAF50' : '#999'} />
                {hasBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{stats.pending_requests}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
        }
      >

        {/* ════════════════════════════════════
            DASHBOARD TAB
        ════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <View>
            {/* Stat cards */}
            <View style={styles.statGrid}>
              <StatCard icon="people"  color="#2196F3" value={stats?.total_users}     label="Total Users"     />
              <StatCard icon="home"    color="#9C27B0" value={stats?.total_farms}     label="Total Farms"     />
              <StatCard icon="leaf"    color="#4CAF50" value={stats?.active_crops}    label="Crops Growing"   />
              <StatCard icon="basket"  color="#FF9800" value={stats?.total_harvested} label="Total Harvested" />
            </View>

            {/* Pending requests alert */}
            {(stats?.pending_requests ?? 0) > 0 && (
              <TouchableOpacity
                style={styles.alertBanner}
                onPress={() => { setActiveTab('requests'); setRequestFilter('pending'); }}
              >
                <Ionicons name="alert-circle" size={18} color="#FF9800" />
                <Text style={styles.alertText}>
                  {stats.pending_requests} vegetable request{stats.pending_requests > 1 ? 's' : ''} waiting for review
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#FF9800" />
              </TouchableOpacity>
            )}

            {/* Activity feed */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activity.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="time-outline" size={32} color="#ccc" />
                <Text style={styles.emptyText}>No activity recorded yet</Text>
              </View>
            ) : (
              activity.map(item => (
                <View key={item.id} style={styles.activityRow}>
                  <View style={styles.activityDot} />
                  <View style={styles.activityBody}>
                    <Text style={styles.activityAction}>
                      {formatAction(item.action, item.details)}
                    </Text>
                    <Text style={styles.activityMeta}>
                      {item.first_name} {item.last_name}
                      {item.farm_name ? ` · ${item.farm_name}` : ''}
                      {' · '}{timeAgo(item.created_at)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ════════════════════════════════════
            REQUESTS TAB
        ════════════════════════════════════ */}
        {activeTab === 'requests' && (
          <View>
            {/* Filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {REQUEST_FILTERS.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, requestFilter === f && styles.filterChipActive]}
                  onPress={() => setRequestFilter(f)}
                >
                  <Text style={[styles.filterChipText, requestFilter === f && styles.filterChipTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'pending' && (stats?.pending_requests ?? 0) > 0
                      ? ` (${stats.pending_requests})`
                      : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredRequests.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="leaf-outline" size={32} color="#ccc" />
                <Text style={styles.emptyText}>
                  No {requestFilter === 'all' ? '' : requestFilter + ' '}requests
                </Text>
              </View>
            ) : (
              filteredRequests.map(req => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestVeg}>{req.vegetable_name}</Text>
                    <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[req.status] + '22' }]}>
                      <Text style={[styles.statusPillText, { color: STATUS_COLOR[req.status] }]}>
                        {req.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.requestUser}>
                    {req.first_name} {req.last_name}  ·  {req.email}
                  </Text>

                  {req.description ? (
                    <Text style={styles.requestDetail}>{req.description}</Text>
                  ) : null}
                  {req.reason ? (
                    <Text style={styles.requestReason}>"{req.reason}"</Text>
                  ) : null}

                  <Text style={styles.requestDate}>
                    {new Date(req.created_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </Text>

                  {req.status === 'pending' && (
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn,
                          actionLoading === req.id && styles.actionBtnDisabled]}
                        onPress={() => handleRequestAction(req.id, 'approved')}
                        disabled={actionLoading === req.id}
                      >
                        {actionLoading === req.id
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <>
                              <Ionicons name="checkmark" size={15} color="#fff" />
                              <Text style={styles.actionBtnText}>Approve</Text>
                            </>
                        }
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn,
                          actionLoading === req.id && styles.actionBtnDisabled]}
                        onPress={() => Alert.alert(
                          'Reject Request',
                          `Reject "${req.vegetable_name}"?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Reject', style: 'destructive',
                              onPress: () => handleRequestAction(req.id, 'rejected') },
                          ]
                        )}
                        disabled={actionLoading === req.id}
                      >
                        <Ionicons name="close" size={15} color="#fff" />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* ════════════════════════════════════
            USERS TAB
        ════════════════════════════════════ */}
        {activeTab === 'users' && (
          <View>
            <Text style={styles.sectionTitle}>{users.length} registered users</Text>
            {users.map(u => (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(u.first_name?.[0] || '?').toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userBody}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{u.first_name} {u.last_name}</Text>
                    {u.is_admin && (
                      <View style={styles.adminBadge}>
                        <Ionicons name="shield" size={10} color="#fff" />
                        <Text style={styles.adminBadgeText}>admin</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.userEmail}>{u.email}</Text>

                  <View style={styles.userMeta}>
                    <View style={[styles.expChip,
                      { backgroundColor: (EXP_COLOR[u.experience_level] || '#9E9E9E') + '22' }]}>
                      <Text style={[styles.expChipText,
                        { color: EXP_COLOR[u.experience_level] || '#9E9E9E' }]}>
                        {u.experience_level}
                      </Text>
                    </View>
                    <Text style={styles.userStats}>
                      {u.farm_count} farm{u.farm_count !== 1 ? 's' : ''}
                      {' · '}
                      {u.crop_count} crop{u.crop_count !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  <Text style={styles.userJoined}>
                    Joined {new Date(u.created_at).toLocaleDateString(undefined, {
                      month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#666' },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  tabActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#4CAF50',
  },
  tabLabel: { fontSize: 11, color: '#999' },
  tabLabelActive: { color: '#4CAF50', fontWeight: '600' },
  badge: {
    position: 'absolute', top: -5, right: -9,
    backgroundColor: '#F44336',
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  scroll: { flex: 1 },

  // Stat grid
  statGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 12, gap: 10,
  },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, borderLeftWidth: 4,
    alignItems: 'flex-start', gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  statValue: { fontSize: 30, fontWeight: '800', lineHeight: 36 },
  statLabel: { fontSize: 12, color: '#888' },

  // Alert banner
  alertBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff8f0',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#ffcc80', gap: 8,
  },
  alertText: { flex: 1, fontSize: 13, color: '#e65100', fontWeight: '500' },

  // Section header
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: '#555',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },

  // Activity feed
  activityRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 8, gap: 12,
  },
  activityDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#4CAF50', marginTop: 5, flexShrink: 0,
  },
  activityBody: { flex: 1 },
  activityAction: { fontSize: 14, color: '#333', fontWeight: '500' },
  activityMeta: { fontSize: 12, color: '#999', marginTop: 2 },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, color: '#bbb' },

  // Request filter chips
  filterScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  filterChipText: { fontSize: 13, color: '#666' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },

  // Request cards
  requestCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  requestVeg: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  statusPill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  requestUser: { fontSize: 12, color: '#888', marginBottom: 6 },
  requestDetail: { fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 18 },
  requestReason: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 4 },
  requestDate: { fontSize: 11, color: '#bbb', marginBottom: 8 },
  requestActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 9,
    borderRadius: 8, gap: 5,
  },
  approveBtn: { backgroundColor: '#4CAF50' },
  rejectBtn:  { backgroundColor: '#F44336' },
  actionBtnDisabled: { opacity: 0.55 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // User cards
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 14,
    flexDirection: 'row', gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  userAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#e8f5e9',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userAvatarText: { fontSize: 18, fontWeight: '700', color: '#4CAF50' },
  userBody: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#4CAF50', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  adminBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  userEmail: { fontSize: 12, color: '#888', marginBottom: 6 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  expChip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  expChipText: { fontSize: 11, fontWeight: '600' },
  userStats: { fontSize: 12, color: '#777' },
  userJoined: { fontSize: 11, color: '#bbb' },
});
