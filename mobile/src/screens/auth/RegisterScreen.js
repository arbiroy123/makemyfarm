import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../api/client';
import LanguagePicker from '../../components/LanguagePicker';
import { detectCountry } from '../../utils/country';
import { C, R, Sh } from '../../theme';

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
  container: { flex: 1, backgroundColor: C.page },
  content:   { padding: 22, paddingTop: 56, paddingBottom: 40 },

  title: { fontSize: 28, fontWeight: '800', marginBottom: 20, color: C.ink },

  input: {
    backgroundColor: C.input, borderRadius: R.sm,
    padding: 15, marginBottom: 14,
    borderColor: C.border, borderWidth: 1.5,
    fontSize: 15, color: C.ink,
  },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, color: C.sub, textTransform: 'uppercase', letterSpacing: 0.4 },

  rulesBox: { marginTop: -6, marginBottom: 12, paddingHorizontal: 2 },
  ruleRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  ruleText: { fontSize: 12, color: C.muted },
  ruleTextPass: { color: C.primary },

  dropdownTrigger: {
    backgroundColor: C.input, borderRadius: R.sm, borderColor: C.border, borderWidth: 1.5,
    padding: 15, flexDirection: 'row', alignItems: 'center',
  },
  dropdownValue: { fontSize: 15, color: C.ink, fontWeight: '500' },
  dropdownHint:  { fontSize: 12, color: C.muted, marginTop: 2 },

  backdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard:  { backgroundColor: C.card, borderRadius: R.lg, width: '100%', maxHeight: '80%', paddingTop: 16, paddingBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: C.ink, paddingHorizontal: 16, marginBottom: 8 },

  option:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomColor: C.border, borderBottomWidth: 1 },
  optionActive: { backgroundColor: C.pale },
  optionLabel:  { fontSize: 14, fontWeight: '600', color: C.ink },
  optionLabelActive: { color: C.primary },
  optionHint:   { fontSize: 12, color: C.muted, marginTop: 2 },

  badge:         { width: 36, height: 36, borderRadius: 18, backgroundColor: C.input, justifyContent: 'center', alignItems: 'center' },
  badgeActive:   { backgroundColor: C.pale },
  badgeText:     { fontSize: 15, fontWeight: '700', color: C.muted },
  badgeTextActive: { color: C.primary },

  button:         { backgroundColor: C.primary, borderRadius: R.pill, padding: 15, alignItems: 'center', marginTop: 10, ...Sh.sm },
  buttonDisabled: { opacity: 0.55 },
  buttonText:     { color: '#fff', fontSize: 16, fontWeight: '700' },

  link: { textAlign: 'center', color: C.primary, marginTop: 18, fontSize: 14, fontWeight: '600' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffebee', borderRadius: R.sm,
    borderLeftWidth: 3, borderLeftColor: '#e53935',
    padding: 12, marginBottom: 14,
  },
  errorText: { color: '#c62828', fontSize: 13, flex: 1 },

  countryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  countryBtn: {
    flex: 1, alignItems: 'center', padding: 12, borderRadius: R.md,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card,
  },
  countryBtnActive:   { borderColor: C.primary, backgroundColor: C.pale },
  countryFlag:        { fontSize: 28 },
  countryLabel:       { fontSize: 13, fontWeight: '700', color: C.sub, marginTop: 4 },
  countryLabelActive: { color: C.primary },
  countryPrice:       { fontSize: 11, color: C.muted, marginTop: 2 },
  countryPriceActive: { color: C.primary },
});
