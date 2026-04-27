import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { farmAPI } from '../../api/client';
import { useFarmStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { farms, setFarms } = useFarmStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const response = await farmAPI.getMyFarms();
      setFarms(response.data);
    } catch (error) {
      console.error('Failed to load farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = () => {
    navigation.navigate('CreateFarm');
  };

  const handleFarmPress = (farm) => {
    navigation.navigate('FarmDetail', { farmId: farm.id });
  };

  const renderFarmCard = ({ item }) => (
    <TouchableOpacity
      style={styles.farmCard}
      onPress={() => handleFarmPress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.farmName}>{item.name}</Text>
        <Text style={styles.farmType}>{item.farm_type}</Text>
      </View>
      <Text style={styles.farmDescription} numberOfLines={2}>
        {item.description || 'No description'}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.farmSize}>{item.size_sqft} sq ft</Text>
        <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Your Farms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateFarm}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {farms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No farms yet</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateFarm}
          >
            <Text style={styles.createButtonText}>Create Your First Farm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={farms}
          renderItem={renderFarmCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 15
  },
  farmCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  farmType: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600'
  },
  farmDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  farmSize: {
    fontSize: 12,
    color: '#999'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
