import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const TASK_ICONS = {
  water:     { icon: 'water',          color: '#2196F3' },
  harvest:   { icon: 'basket',         color: '#4CAF50' },
  diary:     { icon: 'journal',        color: '#9C27B0' },
  fertilize: { icon: 'leaf',           color: '#FF9800' },
  inspect:   { icon: 'search-circle',  color: '#607D8B' },
};

const PRIORITY_LABEL = { high: 'Urgent', medium: 'Today', low: 'When ready' };
const PRIORITY_BG    = { high: '#ffebee', medium: '#fff8e1', low: '#f3e5f5' };
const PRIORITY_BADGE = { high: '#e53935', medium: '#F9A825', low: '#9C27B0' };

export default function TodayTasksScreen({ navigation }) {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [done, setDone]         = useState(new Set());
  const [date, setDate]         = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const res = await client.get('/tasks/today');
      setTasks(res.data.tasks || []);
      setDate(res.data.date || '');
    } catch (err) {
      console.error('Load tasks error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleComplete = async (task) => {
    const key = `${task.cropId}:${task.type}`;
    if (done.has(key)) return;

    try {
      await client.post('/tasks/complete', { cropId: task.cropId, taskType: task.type });
      setDone(prev => new Set([...prev, key]));
    } catch {
      Alert.alert('Error', 'Could not mark task complete. Try again.');
    }
  };

  const handleTaskPress = (task) => {
    if (task.type === 'harvest' || task.type === 'diary' || task.type === 'water' || task.type === 'fertilize') {
      navigation.navigate('CropDetail', { cropId: task.cropId });
    }
  };

  const renderTask = ({ item: task }) => {
    const key = `${task.cropId}:${task.type}`;
    const isDone = done.has(key);
    const iconMeta = TASK_ICONS[task.type] || TASK_ICONS.inspect;

    return (
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: isDone ? '#f0f0f0' : PRIORITY_BG[task.priority] }, isDone && styles.doneCard]}
        onPress={() => handleTaskPress(task)}
        activeOpacity={0.85}
      >
        <View style={[styles.taskIcon, { backgroundColor: isDone ? '#ccc' : iconMeta.color + '22' }]}>
          <Ionicons name={isDone ? 'checkmark-circle' : iconMeta.icon} size={24} color={isDone ? '#4CAF50' : iconMeta.color} />
        </View>

        <View style={styles.taskBody}>
          <Text style={[styles.taskTitle, isDone && styles.doneText]} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.taskSubtitle} numberOfLines={1}>{task.subtitle}</Text>
          <Text style={styles.farmLabel}>{task.farmName}</Text>
        </View>

        <View style={styles.taskRight}>
          <View style={[styles.priorityBadge, { backgroundColor: isDone ? '#ccc' : PRIORITY_BADGE[task.priority] }]}>
            <Text style={styles.priorityText}>{isDone ? 'Done' : PRIORITY_LABEL[task.priority]}</Text>
          </View>
          {!isDone && (
            <TouchableOpacity style={styles.doneBtn} onPress={() => handleComplete(task)}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerDate}>{today}</Text>
          <Text style={styles.headerSub}>
            {tasks.length === 0 ? 'All caught up!' : `${tasks.length - done.size} task${tasks.length - done.size === 1 ? '' : 's'} remaining`}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="leaf" size={20} color="#4CAF50" />
          <Text style={styles.headerBadgeText}>{tasks.length - done.size}</Text>
        </View>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle" size={72} color="#4CAF50" />
          <Text style={styles.emptyTitle}>Nothing to do today!</Text>
          <Text style={styles.emptyText}>Plant some crops to get personalised daily tasks.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.emptyBtnText}>Go to My Farms</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item, i) => `${item.cropId}:${item.type}:${i}`}
          renderItem={renderTask}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTasks(); }} tintColor="#4CAF50" />
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={
            tasks.some(t => t.type === 'harvest') ? (
              <View style={styles.harvestBanner}>
                <Ionicons name="basket" size={18} color="#fff" />
                <Text style={styles.harvestBannerText}>Harvest-ready crops detected — check urgent tasks!</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:          { backgroundColor: '#fff', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerDate:      { fontSize: 17, fontWeight: '700', color: '#222' },
  headerSub:       { fontSize: 13, color: '#666', marginTop: 2 },
  headerBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  headerBadgeText: { fontSize: 16, fontWeight: '700', color: '#2e7d32' },
  harvestBanner:   { backgroundColor: '#4CAF50', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  harvestBannerText: { color: '#fff', fontWeight: '600', fontSize: 13, flex: 1 },
  taskCard:        { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  doneCard:        { opacity: 0.6 },
  taskIcon:        { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  taskBody:        { flex: 1 },
  taskTitle:       { fontSize: 15, fontWeight: '600', color: '#222' },
  doneText:        { textDecorationLine: 'line-through', color: '#999' },
  taskSubtitle:    { fontSize: 12, color: '#666', marginTop: 2 },
  farmLabel:       { fontSize: 11, color: '#4CAF50', fontWeight: '600', marginTop: 3 },
  taskRight:       { alignItems: 'flex-end', gap: 6 },
  priorityBadge:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText:    { fontSize: 10, fontWeight: '700', color: '#fff' },
  doneBtn:         { marginTop: 2 },
  emptyState:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle:      { fontSize: 22, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText:       { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn:        { marginTop: 24, backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
});
