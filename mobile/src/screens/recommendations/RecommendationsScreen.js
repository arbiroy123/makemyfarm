import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { recommendationAPI } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';

const EMOJI_MAP = {
  'Tomato': '🍅', 'Lettuce': '🥬', 'Carrot': '🥕', 'Bell Pepper': '🫑',
  'Cucumber': '🥒', 'Zucchini': '🥒', 'Green Beans': '🫛', 'Spinach': '🥬',
  'Bitter Gourd': '🫛', 'Okra': '🌿', 'Eggplant': '🍆', 'Fenugreek': '🍀',
  'Bok Choy': '🥬', 'Daikon Radish': '🥛', 'Snow Peas': '🫛',
  'Chinese Long Beans': '🫘', 'Artichoke': '🌸', 'Fennel': '🌾',
  'Padron Pepper': '🌶️', 'Romanesco Broccoli': '🥦', 'Tomatillo': '🫒',
  'Jalapeño Pepper': '🌶️', 'Poblano Pepper': '🫑', 'Chayote': '🍈',
  'Cilantro': '🌿', 'Collard Greens': '🥬', 'Sweet Potato': '🍠',
  'Black-eyed Peas': '🫘', 'Mustard Greens': '🥬', 'Callaloo (Amaranth)': '🌺',
  'Bottle Gourd': '🥥', 'Ridge Gourd': '🥒', 'Moringa': '🌳',
  'Cluster Beans (Guar)': '🫘', 'Napa Cabbage': '🥬', 'Lemongrass': '🎋',
  'Thai Basil': '🌿', 'Garlic Chives': '🌿', 'Sweet Basil': '🌿',
  'Radicchio': '🫐', 'Broccoli Rabe (Cime di Rapa)': '🥦', 'Italian Parsley': '🌿',
  'Mint': '🍃', 'Garlic': '🧄', 'Onion': '🧅', 'Potato': '🥔',
  'Sweet Corn': '🌽', 'Pumpkin': '🎃', 'Beetroot': '🫐', 'Malabar Spinach': '🌿',
};

const THUMB_COLOR = {
  'Tomato': '#ffcdd2', 'Lettuce': '#c8e6c9', 'Carrot': '#ffe0b2',
  'Bell Pepper': '#ffccbc', 'Cucumber': '#dcedc8', 'Zucchini': '#f0f4c3',
  'Green Beans': '#c8e6c9', 'Spinach': '#a5d6a7', 'Bitter Gourd': '#b2dfdb',
  'Okra': '#c8e6c9', 'Eggplant': '#e1bee7', 'Fenugreek': '#dcedc8',
  'Bok Choy': '#b2dfdb', 'Daikon Radish': '#f8bbd0', 'Snow Peas': '#dcedc8',
  'Chinese Long Beans': '#c5e1a5', 'Artichoke': '#a5d6a7', 'Fennel': '#dcedc8',
  'Padron Pepper': '#c8e6c9', 'Romanesco Broccoli': '#ccff90',
  'Tomatillo': '#c8e6c9', 'Jalapeño Pepper': '#80cbc4', 'Poblano Pepper': '#a5d6a7',
  'Chayote': '#b2dfdb', 'Cilantro': '#c8e6c9', 'Collard Greens': '#81c784',
  'Sweet Potato': '#ffcc80', 'Black-eyed Peas': '#fff9c4',
  'Mustard Greens': '#e6ee9c', 'Callaloo (Amaranth)': '#ef9a9a',
  'Bottle Gourd': '#b2dfdb', 'Ridge Gourd': '#c5e1a5', 'Moringa': '#a5d6a7',
  'Cluster Beans (Guar)': '#c8e6c9', 'Napa Cabbage': '#dcedc8',
  'Lemongrass': '#fff9c4', 'Thai Basil': '#c8e6c9', 'Garlic Chives': '#c5e1a5',
  'Sweet Basil': '#a5d6a7', 'Radicchio': '#e1bee7',
  'Broccoli Rabe (Cime di Rapa)': '#c8e6c9', 'Italian Parsley': '#c8e6c9',
  'Mint': '#b2dfdb', 'Garlic': '#fff9c4', 'Onion': '#ffccbc',
  'Potato': '#ffe0b2', 'Sweet Corn': '#fff9c4', 'Pumpkin': '#ffcc80',
  'Beetroot': '#f48fb1', 'Malabar Spinach': '#80cbc4',
};

export default function RecommendationsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecs, setFilteredRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecs(recommendations);
    } else {
      setFilteredRecs(
        recommendations.filter(veg =>
          veg.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, recommendations]);

  const loadRecommendations = async () => {
    try {
      const response = await recommendationAPI.getSeasonalRecommendations();
      setRecommendations(response.data.recommendations || []);
      setFilteredRecs(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVegetableCard = ({ item }) => (
    <View style={styles.vegCard}>
      <View style={styles.vegHeader}>
        <View style={[styles.emojiCircle, { backgroundColor: THUMB_COLOR[item.name] || '#e8f5e9' }]}>
          <Text style={styles.emojiText}>{EMOJI_MAP[item.name] || '🌱'}</Text>
        </View>
        <Text style={styles.vegName}>{item.name}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty_level) }]}>
          <Text style={styles.difficultyText}>{item.difficulty_level}</Text>
        </View>
      </View>
      <View style={styles.vegDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.detailText}>{t('daysLabel', { count: item.days_to_harvest })}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="thermometer" size={14} color="#666" />
          <Text style={styles.detailText}>{item.optimal_temp_celsius}°C</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="sunny" size={14} color="#666" />
          <Text style={styles.detailText}>{t('sunHours', { hours: item.sunlight_hours })}</Text>
        </View>
      </View>
    </View>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'novice': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'expert': return '#F44336';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('whatToGrow')}</Text>
        <Text style={styles.subtitle}>{t('seasonalRecommendations')}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchVegetables')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={filteredRecs}
        renderItem={renderVegetableCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No results for "{searchQuery}"</Text>
            <Text style={styles.emptySubtitle}>Want it added to FarmSync?</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.calendarBanner}
        onPress={() => navigation.navigate('PlantingCalendar')}
      >
        <Ionicons name="calendar-outline" size={20} color="#1976d2" />
        <Text style={styles.calendarBannerText}>View Planting Calendar →</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.requestBanner}
        onPress={() => navigation.navigate('RequestVegetable', { prefill: searchQuery })}
      >
        <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
        <Text style={styles.requestBannerText}>
          {filteredRecs.length === 0 && searchQuery
            ? t('requestVegetableBannerSearchText', { name: searchQuery })
            : t('requestVegetableBannerText')}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 15
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderColor: '#ddd',
    borderWidth: 1
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333'
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20
  },
  vegCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  vegHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  emojiCircle: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  emojiText: { fontSize: 22 },
  vegName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  difficultyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  vegDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
  },
  calendarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#90caf9',
    gap: 10,
  },
  calendarBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1565c0',
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    gap: 10,
  },
  requestBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
});
