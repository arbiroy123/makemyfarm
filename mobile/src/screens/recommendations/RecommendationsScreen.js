import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { recommendationAPI } from '../../api/client';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function RecommendationsScreen() {
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
        <Text style={styles.vegName}>{item.name}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty_level) }]}>
          <Text style={styles.difficultyText}>{item.difficulty_level}</Text>
        </View>
      </View>
      <View style={styles.vegDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.detailText}>{item.days_to_harvest} days</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="thermometer" size={14} color="#666" />
          <Text style={styles.detailText}>{item.optimal_temp_celsius}°C</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="sunny" size={14} color="#666" />
          <Text style={styles.detailText}>{item.sunlight_hours}h sun</Text>
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
        <Text style={styles.title}>What to Grow</Text>
        <Text style={styles.subtitle}>Seasonal recommendations for your climate</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vegetables..."
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
      />
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
    marginBottom: 10
  },
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
  }
});
