import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { farmAPI, cropAPI } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function FarmDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { farmId } = route.params;
  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmDetails();
  }, []);

  const loadFarmDetails = async () => {
    try {
      const [farmRes, cropsRes] = await Promise.all([
        farmAPI.getFarmDetail(farmId),
        cropAPI.getFarmCrops(farmId)
      ]);
      setFarm(farmRes.data);
      setCrops(cropsRes.data);
    } catch (error) {
      console.error('Failed to load farm details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const renderCropCard = ({ item }) => (
    <TouchableOpacity
      style={styles.cropCard}
      onPress={() => navigation.navigate('CropDetail', { cropId: item.id })}
    >
      <View style={styles.cropHeader}>
        <Text style={styles.cropName}>{item.vegetable_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cropDetail}>🌱 {t('planted')}: {formatDate(item.planting_date)}</Text>
      <Text style={styles.cropDetail}>🌾 {t('expectedHarvest')}: {formatDate(item.expected_harvest_date)}</Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'planted': return '#4CAF50';
      case 'growing': return '#2196F3';
      case 'harvested': return '#FF9800';
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

  if (!farm) {
    return (
      <View style={styles.centerContainer}>
        <Text>{t('farmNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.farmName}>{farm.name}</Text>
        <Text style={styles.farmType}>{farm.farm_type}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="expand" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>{farm.size_sqft} sq ft</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>{farm.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cloud" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>{t('zoneLabel', { zone: farm.climate_zone })}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('cropsCount', { count: crops.length })}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PlantCrop', { farmId })}
          >
            <Ionicons name="add-circle" size={28} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {crops.length === 0 ? (
          <Text style={styles.emptyText}>{t('noCropsYet')}</Text>
        ) : (
          <FlatList
            data={crops}
            renderItem={renderCropCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      <View style={styles.collaboratorsSection}>
        <Text style={styles.sectionTitle}>{t('collaborators')}</Text>
        <Text style={styles.collaboratorText}>
          {t('managingFarm', { count: farm.collaborators?.length || 1 })}
        </Text>
      </View>
    </ScrollView>
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
    paddingTop: 30
  },
  farmName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  farmType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 15
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  cropDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20
  },
  collaboratorsSection: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8
  },
  collaboratorText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8
  }
});
