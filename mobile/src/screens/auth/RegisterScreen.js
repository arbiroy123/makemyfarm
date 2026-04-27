import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../api/client';

const EXPERIENCE_LEVELS = [
  {
    value: 'novice',
    label: 'Novice',
    icon: 'seedling',
    hint: 'Just getting started — never grown before or tried a few times',
  },
  {
    value: 'beginner',
    label: 'Beginner',
    icon: 'leaf-outline',
    hint: 'Grown a few things, still learning the basics',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    icon: 'leaf',
    hint: 'Comfortable with most vegetables, managed a garden for 2+ seasons',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    icon: 'earth',
    hint: 'Grow year-round, comfortable with pest management & soil science',
  },
  {
    value: 'expert',
    label: 'Expert',
    icon: 'ribbon',
    hint: 'Professional grower or decades of experience',
  },
];

const LEVEL_ICONS = {
  novice:       'cellular-outline',
  beginner:     'cellular-outline',
  intermediate: 'cellular',
  advanced:     'cellular',
  expert:       'cellular',
};

function ExperienceDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const selected = EXPERIENCE_LEVELS.find(l => l.value === value);

  return (
    <View style={{ marginBottom: 15 }}>
      <TouchableOpacity
        style={[styles.dropdownTrigger, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.dropdownValue}>{selected?.label ?? 'Select level'}</Text>
          <Text style={styles.dropdownHint}>{selected?.hint}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#999" />
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Farming Experience</Text>
            <FlatList
              data={EXPERIENCE_LEVELS}
              keyExtractor={i => i.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => { onChange(item.value); setOpen(false); }}
                  >
                    <View style={[styles.badge, active && styles.badgeActive]}>
                      <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                        {item.label[0]}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                        {item.label}
                      </Text>
                      <Text style={styles.optionHint}>{item.hint}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function PasswordRules({ password }) {
  const rules = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)', pass: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a–z)', pass: /[a-z]/.test(password) },
    { label: 'One number (0–9)',           pass: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <View style={styles.rulesBox}>
      {rules.map(r => (
        <View key={r.label} style={styles.ruleRow}>
          <Ionicons
            name={r.pass ? 'checkmark-circle' : 'ellipse-outline'}
            size={14}
            color={r.pass ? '#4CAF50' : '#bbb'}
          />
          <Text style={[styles.ruleText, r.pass && styles.ruleTextPass]}>{r.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('novice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

  const handleRegister = async () => {
    setError('');
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!passwordValid) {
      setError('Password does not meet the requirements below');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(email, password, firstName, lastName, experienceLevel);
      navigation.navigate('Login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <PasswordRules password={password} />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Farming Experience Level</Text>
        <ExperienceDropdown
          value={experienceLevel}
          onChange={setExperienceLevel}
          disabled={loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  rulesBox: { marginTop: -8, marginBottom: 12, paddingHorizontal: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  ruleText: { fontSize: 12, color: '#bbb' },
  ruleTextPass: { color: '#4CAF50' },
  dropdownTrigger: {
    backgroundColor: '#fff', borderRadius: 8, borderColor: '#ddd', borderWidth: 1,
    padding: 15, flexDirection: 'row', alignItems: 'center',
  },
  dropdownValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  dropdownHint: { fontSize: 12, color: '#888', marginTop: 2 },
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 12, width: '100%',
    maxHeight: '80%', paddingTop: 16, paddingBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', paddingHorizontal: 16, marginBottom: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomColor: '#f0f0f0', borderBottomWidth: 1,
  },
  optionActive: { backgroundColor: '#f1f8f6' },
  optionLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  optionLabelActive: { color: '#2e7d32' },
  optionHint: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center',
  },
  badgeActive: { backgroundColor: '#c8e6c9' },
  badgeText: { fontSize: 15, fontWeight: 'bold', color: '#666' },
  badgeTextActive: { color: '#2e7d32' },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  link: {
    textAlign: 'center',
    color: '#4CAF50',
    marginTop: 20,
    fontSize: 14
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderColor: '#ef5350',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15
  },
  errorText: {
    color: '#c62828',
    fontSize: 14
  }
});
