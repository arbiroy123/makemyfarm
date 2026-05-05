import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES, setLanguage } from '../i18n';

export default function LanguagePicker({ trigger = 'pill' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentCode = SUPPORTED_LANGUAGES.some(l => l.code === i18n.language)
    ? i18n.language
    : 'en';
  const current = SUPPORTED_LANGUAGES.find(l => l.code === currentCode);

  return (
    <>
      {trigger === 'icon' ? (
        <TouchableOpacity style={styles.headerIcon} onPress={() => setOpen(true)}>
          <Ionicons name="globe-outline" size={22} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.pill} onPress={() => setOpen(true)}>
          <Ionicons name="globe-outline" size={15} color="#4CAF50" />
          <Text style={styles.pillText}>{current.nativeName}</Text>
          <Ionicons name="chevron-down" size={13} color="#888" />
        </TouchableOpacity>
      )}

      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('selectLanguage')}</Text>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={l => l.code}
              renderItem={({ item }) => {
                const active = item.code === currentCode;
                return (
                  <TouchableOpacity
                    style={[styles.langRow, active && styles.langRowActive]}
                    onPress={async () => {
                      await setLanguage(item.code);
                      setOpen(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.nativeName, active && styles.nativeNameActive]}>
                        {item.nativeName}
                      </Text>
                      <Text style={styles.englishName}>{item.name}</Text>
                    </View>
                    {active && (
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  pillText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: '100%',
    maxHeight: '75%',
    paddingTop: 16,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  langRowActive: {
    backgroundColor: '#f1f8f6',
  },
  nativeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  nativeNameActive: {
    color: '#2e7d32',
  },
  englishName: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
