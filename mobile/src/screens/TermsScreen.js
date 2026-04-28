import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TERMS_TEXT = `Last updated: April 27, 2026

Welcome to FarmSync. By using this app, you agree to the following terms and conditions. Please read them carefully before proceeding.

1. ACCEPTANCE OF TERMS
By accessing or using FarmSync, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, you may not use the app.

2. USE OF THE APP
FarmSync is provided for personal and agricultural management purposes only. You agree not to use the app for any unlawful purpose or in any way that could harm other users, third parties, or the platform.

3. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. FarmSync is not liable for any losses resulting from unauthorized use of your account.

4. FARM AND CROP DATA
Any farm or crop data you enter is your own. FarmSync does not claim ownership of your data. By using the app, you grant FarmSync a limited license to store and process your data solely to provide the service.

5. COMMUNITY FEATURES
When participating in community features, you agree to interact respectfully with other users. FarmSync reserves the right to remove content or suspend accounts that violate community guidelines.

6. PRIVACY
Your use of FarmSync is also governed by our Privacy Policy, which is incorporated into these Terms by reference. We collect minimal data necessary to provide the service and do not sell your personal information to third parties.

7. RECOMMENDATIONS
Crop and farming recommendations provided by FarmSync are informational only. They do not constitute professional agricultural advice. Always consult qualified experts before making significant farming decisions.

8. LIMITATION OF LIABILITY
FarmSync is provided "as is" without warranties of any kind. To the fullest extent permitted by law, FarmSync shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.

9. CHANGES TO TERMS
We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the revised Terms. We will notify you of material changes through the app.

10. CONTACT
If you have questions about these Terms, please contact us at support@farmsync.app.

By tapping "Accept", you confirm that you have read, understood, and agree to these Terms and Conditions.`;

export default function TermsScreen({ onAccept }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <Text style={styles.headerSubtitle}>Please read and accept to continue</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.termsText}>{TERMS_TEXT}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the Terms & Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptButton, !agreed && styles.acceptButtonDisabled]}
          onPress={agreed ? onAccept : null}
          activeOpacity={agreed ? 0.8 : 1}
        >
          <Text style={[styles.acceptButtonText, !agreed && styles.acceptButtonTextDisabled]}>
            Accept & Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    padding: 20,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 20,
    paddingBottom: 30,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  acceptButtonTextDisabled: {
    color: '#aaa',
  },
});
