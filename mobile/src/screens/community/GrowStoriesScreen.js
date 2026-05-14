import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, RefreshControl,
  Image, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const EXPERIENCE_EMOJI = { novice: '🌱', beginner: '🌿', intermediate: '🌾', advanced: '🌻', expert: '🏆' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function GrowStoriesScreen() {
  const [stories, setStories]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [likedSet, setLikedSet]       = useState(new Set());
  const [postModal, setPostModal]     = useState(false);

  // Post form
  const [vegName, setVegName]   = useState('');
  const [lesson, setLesson]     = useState('');
  const [caption, setCaption]   = useState('');
  const [posting, setPosting]   = useState(false);

  const loadStories = useCallback(async () => {
    try {
      const res = await client.get('/stories');
      setStories(res.data || []);
      const liked = new Set(res.data.filter(s => s.has_liked).map(s => s.id));
      setLikedSet(liked);
    } catch (err) {
      console.error('Load stories error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadStories(); }, [loadStories]);

  const handleLike = async (story) => {
    const wasLiked = likedSet.has(story.id);
    // Optimistic update
    setLikedSet(prev => {
      const next = new Set(prev);
      wasLiked ? next.delete(story.id) : next.add(story.id);
      return next;
    });
    setStories(prev => prev.map(s =>
      s.id === story.id
        ? { ...s, likes_count: s.likes_count + (wasLiked ? -1 : 1) }
        : s
    ));

    try {
      await client.post(`/stories/${story.id}/like`);
    } catch {
      // Revert on failure
      setLikedSet(prev => {
        const next = new Set(prev);
        wasLiked ? next.add(story.id) : next.delete(story.id);
        return next;
      });
    }
  };

  const handlePost = async () => {
    if (!vegName.trim()) { Alert.alert('Required', 'Enter the vegetable you grew.'); return; }
    if (lesson.trim().length < 10) { Alert.alert('Required', 'Share a lesson of at least 10 characters.'); return; }

    setPosting(true);
    try {
      const res = await client.post('/stories', {
        vegetableName: vegName.trim(),
        lesson: lesson.trim(),
        caption: caption.trim() || undefined,
      });
      setStories(prev => [{ ...res.data, first_name: 'You', last_name: '', experience_level: 'novice', has_liked: false }, ...prev]);
      setPostModal(false);
      setVegName(''); setLesson(''); setCaption('');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not post your story.');
    } finally {
      setPosting(false);
    }
  };

  const renderStory = ({ item: story }) => {
    const liked = likedSet.has(story.id);
    const expEmoji = EXPERIENCE_EMOJI[story.experience_level] || '🌱';

    return (
      <View style={styles.card}>
        {/* Author row */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{expEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>
              {story.first_name} {story.last_name}
            </Text>
            <Text style={styles.authorMeta}>{story.vegetable_name} · {timeAgo(story.created_at)}</Text>
          </View>
          <View style={styles.vegBadge}>
            <Text style={styles.vegBadgeText}>{story.vegetable_name}</Text>
          </View>
        </View>

        {/* Photo */}
        {story.photo_url ? (
          <Image source={{ uri: story.photo_url }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="leaf-outline" size={40} color="#4CAF50" />
            <Text style={styles.photoPlaceholderText}>{story.vegetable_name}</Text>
          </View>
        )}

        {/* Caption */}
        {story.caption ? <Text style={styles.caption}>{story.caption}</Text> : null}

        {/* Lesson */}
        <View style={styles.lessonBox}>
          <Ionicons name="bulb-outline" size={14} color="#FF9800" style={{ marginTop: 1 }} />
          <Text style={styles.lessonText}>{story.lesson}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(story)}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#e53935' : '#888'} />
            <Text style={[styles.likeCount, liked && { color: '#e53935' }]}>{story.likes_count}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.feedTitle}>Grow Stories</Text>
          <Text style={styles.feedSub}>Lessons from farmers in your region</Text>
        </View>
        <TouchableOpacity style={styles.postBtn} onPress={() => setPostModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.postBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={item => item.id}
          renderItem={renderStory}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStories(); }} tintColor="#4CAF50" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>No stories yet</Text>
              <Text style={styles.emptyText}>Be the first to share a grow lesson from your farm!</Text>
            </View>
          }
        />
      )}

      {/* Post story modal */}
      <Modal visible={postModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.modalContainer} keyboardShouldPersistTaps="handled">
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setPostModal(false)}>
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Share a Grow Story</Text>
              <TouchableOpacity onPress={handlePost} disabled={posting}>
                {posting ? <ActivityIndicator size="small" color="#4CAF50" /> : <Text style={styles.postSubmit}>Post</Text>}
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>What did you grow? *</Text>
            <TextInput
              style={styles.input}
              value={vegName}
              onChangeText={setVegName}
              placeholder="e.g. Tomato, Lettuce, Carrot"
              placeholderTextColor="#aaa"
            />

            <Text style={styles.fieldLabel}>Caption (optional)</Text>
            <TextInput
              style={styles.input}
              value={caption}
              onChangeText={setCaption}
              placeholder="A short title for your story"
              placeholderTextColor="#aaa"
            />

            <Text style={styles.fieldLabel}>What's one lesson you learned? *</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={lesson}
              onChangeText={setLesson}
              placeholder="e.g. Tomatoes need deep watering once a week, not frequent shallow watering. I lost 3 plants before I figured this out!"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <View style={styles.tipBox}>
              <Ionicons name="information-circle-outline" size={16} color="#2196F3" />
              <Text style={styles.tipText}>Stories are shared with farmers in your region. Photos can be added from your crop diary.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f5f5f5' },
  center:             { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar:             { backgroundColor: '#fff', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  feedTitle:          { fontSize: 18, fontWeight: '700', color: '#222' },
  feedSub:            { fontSize: 12, color: '#888', marginTop: 2 },
  postBtn:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, gap: 4 },
  postBtnText:        { color: '#fff', fontWeight: '700', fontSize: 14 },
  card:               { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  authorRow:          { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar:             { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
  avatarText:         { fontSize: 20 },
  authorName:         { fontSize: 14, fontWeight: '600', color: '#222' },
  authorMeta:         { fontSize: 11, color: '#888', marginTop: 1 },
  vegBadge:           { backgroundColor: '#e8f5e9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  vegBadgeText:       { fontSize: 11, color: '#2e7d32', fontWeight: '600' },
  photo:              { width: '100%', height: 200 },
  photoPlaceholder:   { width: '100%', height: 120, backgroundColor: '#f1f8e9', justifyContent: 'center', alignItems: 'center', gap: 6 },
  photoPlaceholderText: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },
  caption:            { fontSize: 14, fontWeight: '600', color: '#222', padding: 12, paddingBottom: 4 },
  lessonBox:          { flexDirection: 'row', gap: 8, backgroundColor: '#fffde7', margin: 12, padding: 10, borderRadius: 8, alignItems: 'flex-start' },
  lessonText:         { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
  actions:            { flexDirection: 'row', padding: 12, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  likeBtn:            { flexDirection: 'row', alignItems: 'center', gap: 5 },
  likeCount:          { fontSize: 14, color: '#888', fontWeight: '600' },
  emptyState:         { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle:         { fontSize: 20, fontWeight: '700', color: '#333' },
  emptyText:          { fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 260 },
  // Modal
  modalContainer:     { flex: 1, backgroundColor: '#fff', padding: 20 },
  modalHeader:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle:         { fontSize: 17, fontWeight: '700', color: '#222' },
  postSubmit:         { fontSize: 16, color: '#4CAF50', fontWeight: '700' },
  fieldLabel:         { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 16 },
  input:              { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 14, color: '#222', borderWidth: 1, borderColor: '#e0e0e0' },
  multiline:          { minHeight: 110, paddingTop: 12 },
  tipBox:             { flexDirection: 'row', gap: 8, backgroundColor: '#e3f2fd', borderRadius: 8, padding: 10, marginTop: 20, alignItems: 'flex-start' },
  tipText:            { flex: 1, fontSize: 12, color: '#1565c0', lineHeight: 18 },
});
