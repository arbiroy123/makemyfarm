import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../api/client';
import LanguagePicker from '../../components/LanguagePicker';
import { detectCountry } from '../../utils/country';

function ExperienceDropdown({ value, onChange, disabled, levels, modalTitle, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = levels.find(l => l.value === value);

  return (
    <View style={{ marginBottom: 15 }}>
      <TouchableOpacity
        style={[styles.dropdownTrigger, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.dropdownValue}>{selected?.label ?? placeholder}</Text>
          <Text style={styles.dropdownHint}>{selected?.hint}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#999" />
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <FlatList
              data={levels}
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

function PasswordRules({ password, rules }) {
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
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('novice');
  const [country, setCountry] = useState(() => detectCountry());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  const experienceLevels = [
    { value: 'novice',       label: t('novice'),       hint: t('noviceHint') },
    { value: 'beginner',     label: t('beginner'),     hint: t('beginnerHint') },
    { value: 'intermediate', label: t('intermediate'), hint: t('intermediateHint') },
    { value: 'advanced',     label: t('advanced'),     hint: t('advancedHint') },
    { value: 'expert',       label: t('expert'),       hint: t('expertHint') },
  ];

  const passwordRules = [
    { label: t('pwdLength'), pass: password.length >= 8 },
    { label: t('pwdUpper'),  pass: /[A-Z]/.test(password) },
    { label: t('pwdLower'),  pass: /[a-z]/.test(password) },
    { label: t('pwdNumber'), pass: /[0-9]/.test(password) },
  ];

  const handleRegister = async () => {
    setError('');
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    if (!passwordValid) {
      setError(t('passwordRequirements'));
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(email, password, firstName, lastName, experienceLevel, country);
      navigation.navigate('Login');
    } catch (err) {
      setError(err.response?.data?.error || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <LanguagePicker />

        <Text style={styles.title}>{t('register')}</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder={t('firstName')}
          value={firstName}
          onChangeText={setFirstName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder={t('lastName')}
          value={lastName}
          onChangeText={setLastName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder={t('email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder={t('password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <PasswordRules password={password} rules={passwordRules} />

        <TextInput
          style={styles.input}
          placeholder={t('confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Your Country</Text>
        <View style={styles.countryRow}>
          {[
            { code: 'IN', flag: '🇮🇳', label: 'India', price: '₹99/mo' },
            { code: 'US', flag: '🇺🇸', label: 'USA', price: '$4.99/mo' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.code}
              style={[styles.countryBtn, country === opt.code && styles.countryBtnActive]}
              onPress={() => setCountry(opt.code)}
              disabled={loading}
            >
              <Text style={styles.countryFlag}>{opt.flag}</Text>
              <Text style={[styles.countryLabel, country === opt.code && styles.countryLabelActive]}>{opt.label}</Text>
              <Text style={[styles.countryPrice, country === opt.code && styles.countryPriceActive]}>{opt.price} Pro</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('farmingExperienceLabel')}</Text>
        <ExperienceDropdown
          value={experienceLevel}
          onChange={setExperienceLevel}
          disabled={loading}
          levels={experienceLevels}
          modalTitle={t('farmingExperienceModal')}
          placeholder={t('selectLevel')}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('register')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>{t('hasAccount')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
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
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#4CAF50',
    marginTop: 20,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderColor: '#ef5350',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  countryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  countryBtn: {
    flex: 1, alignItems: 'center', padding: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#ddd', backgroundColor: '#fff',
  },
  countryBtnActive: { borderColor: '#4CAF50', backgroundColor: '#f1f8f1' },
  countryFlag: { fontSize: 28 },
  countryLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 4 },
  countryLabelActive: { color: '#2e7d32' },
  countryPrice: { fontSize: 11, color: '#aaa', marginTop: 2 },
  countryPriceActive: { color: '#4CAF50' },
});
