import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, FlatList, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recommendationAPI } from '../../api/client';

const STATUS_COLOR = {
  pending: '#FF9800',
  approved: '#4CAF50',
  rejected: '#F44336',
};

const STATUS_ICON = {
  pending: 'time-outline',
  approved: 'checkmark-circle-outline',
  rejected: 'close-circle-outline',
};

export default function RequestVegetableScreen({ route }) {
  const [vegetableName, setVegetableName] = useState(route?.params?.prefill || '');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // suggestion state
  const [suggestion, setSuggestion] = useState(null); // { type, match } | null
  const [checking, setChecking] = useState(false);
  const ignoreSuggestionRef = useRef(false); // set true once user dismisses

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      const response = await recommendationAPI.getMyVegetableRequests();
      setMyRequests(response.data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleNameChange = (text) => {
    setVegetableName(text);
    // Reset suggestion state whenever the user edits the name
    if (suggestion) setSuggestion(null);
    ignoreSuggestionRef.current = false;
  };

  const handleNameBlur = async () => {
    const name = vegetableName.trim();
    if (!name || ignoreSuggestionRef.current) return;
    setChecking(true);
    try {
      const res = await recommendationAPI.checkVegetableName(name);
      if (res.data.type !== 'none') setSuggestion(res.data);
    } catch {
      // not critical — degrade silently
    } finally {
      setChecking(false);
    }
  };

  const dismissSuggestion = () => {
    setSuggestion(null);
    ignoreSuggestionRef.current = true; // don't re-show for this session
  };

  const handleSubmit = async () => {
    if (!vegetableName.trim()) {
      Alert.alert('Required', 'Please enter the vegetable name.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await recommendationAPI.requestVegetable(
        vegetableName.trim(),
        description.trim(),
        reason.trim()
      );
      setMyRequests(prev => [response.data, ...prev]);
      setVegetableName('');
      setDescription('');
      setReason('');
      setSuggestion(null);
      ignoreSuggestionRef.current = false;
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestName}>{item.vegetable_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
          <Ionicons name={STATUS_ICON[item.status]} size={13} color={STATUS_COLOR[item.status]} />
          <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      {item.description ? (
        <Text style={styles.requestDetail} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <Text style={styles.requestDate}>
        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>
    </View>
  );

  const isTypo = suggestion?.type === 'typo';
  const isExact = suggestion?.type === 'exact';

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Request a Vegetable</Text>
        <Text style={styles.subtitle}>
          Can't find what you're looking for? Let us know and we'll add it!
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Vegetable Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, suggestion && styles.inputHighlighted]}
          placeholder="e.g. Dragon Fruit, Kohlrabi..."
          value={vegetableName}
          onChangeText={handleNameChange}
          onBlur={handleNameBlur}
          placeholderTextColor="#aaa"
          maxLength={200}
        />

        {/* Checking indicator */}
        {checking && (
          <View style={styles.checkingRow}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.checkingText}>Checking our list…</Text>
          </View>
        )}

        {/* Suggestion card */}
        {suggestion && (
          <View style={[styles.suggestionCard, isTypo || isExact ? styles.suggestionWarn : styles.suggestionInfo]}>
            <View style={styles.suggestionHeader}>
              <Ionicons
                name={isTypo || isExact ? 'alert-circle-outline' : 'information-circle-outline'}
                size={17}
                color={isTypo || isExact ? '#e65100' : '#1565c0'}
              />
              <Text style={[styles.suggestionTitle, { color: isTypo || isExact ? '#e65100' : '#1565c0' }]}>
                {isExact
                  ? 'Already in our list'
                  : isTypo
                  ? 'Did you mean this?'
                  : 'We support a similar crop'}
              </Text>
            </View>

            <Text style={styles.suggestionMessage}>
              {isExact
                ? `"${suggestion.match.name}" is already supported — you can plant it from the Crops screen.`
                : isTypo
                ? `We have "${suggestion.match.name}" in our list. Is that what you meant?`
                : `We support "${suggestion.match.name}". You can still request a specific variety below.`}
            </Text>

            {!isExact && (
              <TouchableOpacity style={styles.requestAnywayBtn} onPress={dismissSuggestion}>
                <Text style={styles.requestAnywayText}>Request anyway</Text>
              </TouchableOpacity>
            )}

            {isExact && (
              <TouchableOpacity style={styles.requestAnywayBtn} onPress={dismissSuggestion}>
                <Text style={styles.requestAnywayText}>Request a different variety anyway</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Describe the vegetable — varieties, origin, what it looks like..."
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={3}
          maxLength={500}
        />

        <Text style={styles.label}>Why do you want it added? <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="e.g. It grows well in my region and I can't find growing tips anywhere..."
          value={reason}
          onChangeText={setReason}
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={3}
          maxLength={500}
        />

        {submitted ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.successText}>Request submitted! We'll review it soon.</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, (submitting || isExact) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || isExact}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {myRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Requests</Text>
          {loadingRequests ? (
            <ActivityIndicator size="small" color="#4CAF50" style={{ marginVertical: 12 }} />
          ) : (
            <FlatList
              data={myRequests}
              renderItem={renderRequest}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {!loadingRequests && myRequests.length === 0 && (
        <View style={styles.emptyRequests}>
          <Ionicons name="leaf-outline" size={32} color="#ccc" />
          <Text style={styles.emptyText}>No requests yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 12,
  },
  required: { color: '#F44336' },
  optional: { color: '#999', fontWeight: '400' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputHighlighted: {
    borderColor: '#FF9800',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Checking indicator
  checkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  checkingText: {
    fontSize: 12,
    color: '#888',
  },
  // Suggestion card
  suggestionCard: {
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  suggestionWarn: {
    backgroundColor: '#fff8f0',
    borderColor: '#ffcc80',
  },
  suggestionInfo: {
    backgroundColor: '#e8f4fd',
    borderColor: '#90caf9',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionMessage: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  requestAnywayBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  requestAnywayText: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'underline',
  },
  // Submit
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 18,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
    gap: 8,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  requestDate: {
    fontSize: 11,
    color: '#aaa',
  },
  emptyRequests: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#bbb',
  },
});
