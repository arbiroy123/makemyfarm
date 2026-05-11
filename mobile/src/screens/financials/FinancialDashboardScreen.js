import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Modal, TextInput, ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { financialsAPI } from '../../api/client';

const CURRENCY_SYMBOL = { INR: '₹', USD: '$' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EXPENSE_CATEGORIES_IN = ['Seeds (बीज)', 'Fertilizer (उर्वरक)', 'Labor (मजदूरी)', 'Irrigation (सिंचाई)', 'Pesticides (कीटनाशक)', 'Equipment (उपकरण)', 'Transport (परिवहन)', 'Other (अन्य)'];
const INCOME_CATEGORIES_IN = ['Crop Sale (फसल बिक्री)', 'Govt Subsidy (सरकारी सहायता)', 'Insurance Claim', 'Other (अन्य)'];
const EXPENSE_CATEGORIES_US = ['Seeds', 'Fertilizer', 'Labor', 'Irrigation', 'Pesticides', 'Equipment', 'Transportation', 'Other'];
const INCOME_CATEGORIES_US = ['Crop Sale', 'USDA Payment', 'Insurance Claim', 'Other'];

export default function FinancialDashboardScreen({ route }) {
  const { farmId, farmName, currency = 'INR' } = route.params || {};
  const currSymbol = CURRENCY_SYMBOL[currency] || '₹';
  const expCats = currency === 'USD' ? EXPENSE_CATEGORIES_US : EXPENSE_CATEGORIES_IN;
  const incCats = currency === 'USD' ? INCOME_CATEGORIES_US : INCOME_CATEGORIES_IN;

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | records
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ type: 'expense', category: '', amount: '', description: '' });
  const [saving, setSaving] = useState(false);
  const year = new Date().getFullYear();

  const loadData = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const [sumRes, trendRes, recRes] = await Promise.all([
        financialsAPI.getSummary(farmId, year),
        financialsAPI.getTrend(farmId, year),
        financialsAPI.getRecords(farmId),
      ]);
      setSummary(sumRes.data);
      setTrend(trendRes.data.trend || []);
      setRecords(recRes.data.records || []);
    } catch {
      Alert.alert('Error', 'Could not load financial data');
    } finally {
      setLoading(false);
    }
  }, [farmId, year]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddRecord = async () => {
    if (!form.category || !form.amount) {
      Alert.alert('Missing fields', 'Please select a category and enter an amount.');
      return;
    }
    setSaving(true);
    try {
      await financialsAPI.addRecord(farmId, {
        type: form.type,
        category: form.category,
        amount: parseFloat(form.amount),
        currency,
        description: form.description,
        record_date: new Date().toISOString().split('T')[0],
      });
      setModalVisible(false);
      setForm({ type: 'expense', category: '', amount: '', description: '' });
      loadData();
    } catch {
      Alert.alert('Error', 'Failed to save record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = (recordId) => {
    Alert.alert('Delete Record', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await financialsAPI.deleteRecord(recordId);
            setRecords(prev => prev.filter(r => r.id !== recordId));
            loadData();
          } catch {
            Alert.alert('Error', 'Could not delete record');
          }
        },
      },
    ]);
  };

  const maxTrendValue = Math.max(...trend.map(m => Math.max(m.income, m.expense)), 1);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {['overview', 'records'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'overview' ? 'Overview' : 'Records'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'overview' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Summary Cards */}
          <View style={styles.cardsRow}>
            <View style={[styles.summaryCard, { borderTopColor: '#4CAF50' }]}>
              <Text style={styles.cardLabel}>Income</Text>
              <Text style={[styles.cardValue, { color: '#4CAF50' }]}>
                {currSymbol}{(summary?.totalIncome || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={[styles.summaryCard, { borderTopColor: '#f44336' }]}>
              <Text style={styles.cardLabel}>Expense</Text>
              <Text style={[styles.cardValue, { color: '#f44336' }]}>
                {currSymbol}{(summary?.totalExpense || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
          <View style={styles.cardsRow}>
            <View style={[styles.summaryCard, { borderTopColor: summary?.profit >= 0 ? '#2196F3' : '#FF9800' }]}>
              <Text style={styles.cardLabel}>Profit / Loss</Text>
              <Text style={[styles.cardValue, { color: summary?.profit >= 0 ? '#2196F3' : '#FF9800' }]}>
                {summary?.profit >= 0 ? '+' : ''}{currSymbol}{(summary?.profit || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={[styles.summaryCard, { borderTopColor: '#9C27B0' }]}>
              <Text style={styles.cardLabel}>ROI</Text>
              <Text style={[styles.cardValue, { color: '#9C27B0' }]}>
                {summary?.roi || 0}%
              </Text>
            </View>
          </View>

          {/* Monthly Bar Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Trend — {year}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chartContainer}>
                {trend.map((m, i) => (
                  <View key={i} style={styles.chartMonth}>
                    <View style={styles.bars}>
                      <View
                        style={[styles.bar, styles.incomeBar, { height: Math.max(4, (m.income / maxTrendValue) * 80) }]}
                      />
                      <View
                        style={[styles.bar, styles.expenseBar, { height: Math.max(4, (m.expense / maxTrendValue) * 80) }]}
                      />
                    </View>
                    <Text style={styles.monthLabel}>{MONTHS[i]}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
                <Text style={styles.legendText}>Expense</Text>
              </View>
            </View>
          </View>

          {/* Expense Breakdown */}
          {(summary?.expenseBreakdown?.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expense Breakdown</Text>
              {summary.expenseBreakdown.map((item, i) => (
                <View key={i} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{item.category}</Text>
                  <Text style={styles.breakdownValue}>{currSymbol}{parseFloat(item.total).toLocaleString('en-IN')}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.scroll}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No records yet. Tap + to add one.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.recordCard}>
              <View style={styles.recordLeft}>
                <View style={[styles.typeTag, item.type === 'income' ? styles.incomeTag : styles.expenseTag]}>
                  <Text style={styles.typeTagText}>{item.type === 'income' ? 'IN' : 'EX'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordCategory}>{item.category}</Text>
                  {item.description ? <Text style={styles.recordDesc} numberOfLines={1}>{item.description}</Text> : null}
                  <Text style={styles.recordDate}>{new Date(item.record_date).toLocaleDateString('en-IN')}</Text>
                </View>
              </View>
              <View style={styles.recordRight}>
                <Text style={[styles.recordAmount, item.type === 'income' ? styles.incomeAmount : styles.expenseAmount]}>
                  {item.type === 'income' ? '+' : '-'}{currSymbol}{parseFloat(item.amount).toLocaleString('en-IN')}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteRecord(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#f44336" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Record Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Record</Text>

            {/* Type Toggle */}
            <View style={styles.typeToggle}>
              {['expense', 'income'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, form.type === t && (t === 'income' ? styles.incomeBtnActive : styles.expenseBtnActive)]}
                  onPress={() => setForm(f => ({ ...f, type: t, category: '' }))}
                >
                  <Text style={[styles.typeBtnText, form.type === t && styles.typeBtnTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Picker */}
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(form.type === 'income' ? incCats : expCats).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, form.category === cat && styles.catChipActive]}
                    onPress={() => setForm(f => ({ ...f, category: cat }))}
                  >
                    <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Amount ({currSymbol})</Text>
            <TextInput
              style={styles.textInput}
              value={form.amount}
              onChangeText={v => setForm(f => ({ ...f, amount: v }))}
              keyboardType="numeric"
              placeholder={`e.g. ${currency === 'INR' ? '5000' : '200'}`}
            />

            <Text style={styles.fieldLabel}>Description (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
              placeholder="e.g. Purchased seeds from market"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddRecord} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#4CAF50' },
  tabText: { fontSize: 14, color: '#999', fontWeight: '500' },
  activeTabText: { color: '#4CAF50', fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 90 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderTopWidth: 3, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4,
  },
  cardLabel: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '500' },
  cardValue: { fontSize: 20, fontWeight: '700' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 },
  chartMonth: { alignItems: 'center', width: 30 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 10, borderRadius: 4 },
  incomeBar: { backgroundColor: '#4CAF50' },
  expenseBar: { backgroundColor: '#f44336' },
  monthLabel: { fontSize: 9, color: '#999', marginTop: 4 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#666' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  breakdownLabel: { fontSize: 13, color: '#555', flex: 1 },
  breakdownValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: '#aaa', fontSize: 15 },
  recordCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3,
  },
  recordLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  typeTag: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  incomeTag: { backgroundColor: '#e8f5e9' },
  expenseTag: { backgroundColor: '#ffebee' },
  typeTagText: { fontSize: 10, fontWeight: '700', color: '#555' },
  recordCategory: { fontSize: 14, fontWeight: '600', color: '#333' },
  recordDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  recordDate: { fontSize: 11, color: '#bbb', marginTop: 2 },
  recordRight: { alignItems: 'flex-end', gap: 6 },
  recordAmount: { fontSize: 15, fontWeight: '700' },
  incomeAmount: { color: '#4CAF50' },
  expenseAmount: { color: '#f44336' },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#4CAF50', justifyContent: 'center',
    alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  typeToggle: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  incomeBtnActive: { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
  expenseBtnActive: { backgroundColor: '#ffebee', borderColor: '#f44336' },
  typeBtnText: { fontSize: 14, color: '#888', fontWeight: '500' },
  typeBtnTextActive: { fontWeight: '700', color: '#333' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa' },
  catChipActive: { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
  catChipText: { fontSize: 12, color: '#666' },
  catChipTextActive: { color: '#2e7d32', fontWeight: '600' },
  textInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12,
    fontSize: 15, marginBottom: 14, color: '#333', backgroundColor: '#fafafa',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#4CAF50', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
