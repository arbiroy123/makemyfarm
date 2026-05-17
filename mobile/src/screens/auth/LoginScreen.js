import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../api/client';
import { useAuthStore } from '../../store';
import LanguagePicker from '../../components/LanguagePicker';
import { C, R, Sh } from '../../theme';

function InputRow({ icon, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.inputWrap, focused && s.inputFocused, error && s.inputError]}>
      <Ionicons name={icon} size={18} color={focused ? C.primary : C.muted} />
      <TextInput
        style={s.inputText}
        placeholderTextColor={C.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login, enterGuestMode } = useAuthStore();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError(t('fillAllFields')); return; }
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      login(user, token);
    } catch (err) {
      setError(err.response?.data?.error || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <View style={s.hero}>
        <View style={[s.heroDeco, s.decoA]} />
        <View style={[s.heroDeco, s.decoB]} />
        <View style={{ alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <View style={s.logoRing}>
            <Text style={s.logoEmoji}>🌱</Text>
          </View>
          <Text style={s.heroName}>{t('appName')}</Text>
          <Text style={s.heroTagline}>{t('tagline')}</Text>
        </View>
      </View>

      {/* ── Form card ─────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.cardScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <LanguagePicker />

            <Text style={s.cardTitle}>Welcome back</Text>
            <Text style={s.cardSub}>Sign in to your farm</Text>

            {error ? (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#c62828" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <InputRow
              icon="mail-outline"
              placeholder={t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <View style={[s.inputWrap]}>
              <Ionicons name="lock-closed-outline" size={18} color={C.muted} />
              <TextInput
                style={s.inputText}
                placeholder={t('password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                placeholderTextColor={C.muted}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPwd(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.muted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnTxt}>{t('login')}</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.linkBtn}>
              <Text style={s.linkTxt}>
                {t('noAccount')}
              </Text>
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerTxt}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity onPress={enterGuestMode} style={s.guestBtn} activeOpacity={0.7}>
              <Ionicons name="eye-outline" size={16} color={C.sub} />
              <Text style={s.guestTxt}>Browse without signing in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.forest },

  // Hero
  hero: {
    height: 220,
    backgroundColor: C.forest,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroDeco: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  decoA:    { width: 240, height: 240, top: -100, right: -60 },
  decoB:    { width: 160, height: 160, bottom: -60, left: -30 },
  logoRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  logoEmoji:  { fontSize: 38 },
  heroName:   { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  heroTagline:{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: 2 },

  // Card
  cardScroll: { flexGrow: 1 },
  card: {
    backgroundColor: C.card,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    padding: 28,
    paddingBottom: 40,
    flex: 1,
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: C.ink, marginTop: 6, marginBottom: 4 },
  cardSub:   { fontSize: 14, color: C.muted, marginBottom: 22 },

  // Error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffebee', borderRadius: R.sm,
    padding: 12, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: '#e53935',
  },
  errorText: { color: '#c62828', fontSize: 13, flex: 1 },

  // Inputs
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.input, borderRadius: R.sm,
    paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 12, borderWidth: 1.5, borderColor: 'transparent',
  },
  inputFocused: { borderColor: C.mid, backgroundColor: '#fff' },
  inputError:   { borderColor: '#ef5350' },
  inputText:    { flex: 1, fontSize: 15, color: C.ink, padding: 0 },

  // Button
  btn: {
    backgroundColor: C.primary, borderRadius: R.pill,
    paddingVertical: 15, alignItems: 'center',
    marginTop: 8, marginBottom: 4,
    ...Sh.sm,
  },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  // Links
  linkBtn: { paddingVertical: 14, alignItems: 'center' },
  linkTxt: { color: C.primary, fontSize: 14, fontWeight: '600' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerTxt:  { fontSize: 12, color: C.muted, fontWeight: '600' },

  guestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, marginTop: 4,
    borderRadius: R.sm, borderWidth: 1.5, borderColor: C.border,
  },
  guestTxt: { color: C.sub, fontSize: 14, fontWeight: '500' },
});
