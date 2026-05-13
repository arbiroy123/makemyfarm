import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { mapAPI } from '../../api/client';
import { useFarmStore } from '../../store';

const RADIUS_KM = 40.2; // 25 miles

const VEG_EMOJI = {
  tomato: '🍅',
  lettuce: '🥬',
  carrot: '🥕',
  'bell pepper': '🫑',
  pepper: '🌶️',
  cucumber: '🥒',
  zucchini: '🥒',
  squash: '🥒',
  pumpkin: '🎃',
  bean: '🫘',
  spinach: '🥬',
  kale: '🥬',
  cabbage: '🥬',
  'bok choy': '🥬',
  eggplant: '🍆',
  aubergine: '🍆',
  broccoli: '🥦',
  cauliflower: '🥦',
  okra: '🫛',
  corn: '🌽',
  potato: '🥔',
  garlic: '🧄',
  onion: '🧅',
  radish: '🥕',
  pea: '🫛',
  chili: '🌶️',
  chilli: '🌶️',
  strawberry: '🍓',
  basil: '🌿',
  fennel: '🌿',
  fenugreek: '🌿',
  artichoke: '🌸',
  romanesco: '🥦',
  'bitter gourd': '🥒',
  daikon: '🥕',
};

function vegEmoji(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, emoji] of Object.entries(VEG_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return '🌱';
}

function parseCoords(geoJson) {
  try {
    const parsed = typeof geoJson === 'string' ? JSON.parse(geoJson) : geoJson;
    return { latitude: parsed.coordinates[1], longitude: parsed.coordinates[0] };
  } catch {
    return null;
  }
}

function kmToMiles(km) {
  return (parseFloat(km) * 0.621371).toFixed(1);
}

export default function MapScreen() {
  const mapRef = useRef(null);
  const { farms } = useFarmStore();
  const [region, setRegion] = useState(null);
  const [nearbyFarms, setNearbyFarms] = useState([]);
  const [nearbyFarmCrops, setNearbyFarmCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Set of farm IDs that have active crops (used to avoid double-pinning)
  const cropFarmIds = useMemo(
    () => new Set(nearbyFarmCrops.map(f => String(f.farm_id))),
    [nearbyFarmCrops]
  );

  // Unique vegetables sorted by number of farms growing them
  const uniqueVegetables = useMemo(() => {
    const map = {};
    for (const farm of nearbyFarmCrops) {
      for (const crop of farm.crops) {
        const key = crop.vegetable_name;
        if (!map[key]) map[key] = { name: key, emoji: vegEmoji(key), count: 0 };
        map[key].count++;
      }
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [nearbyFarmCrops]);

  const panelShown = nearbyFarmCrops.length > 0;

  useEffect(() => {
    initMap();
  }, []);

  const initMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = null;

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        mapAPI.updateLocation(coords.latitude, coords.longitude).catch(() => {});
      } else {
        setPermissionDenied(true);
        for (const farm of farms) {
          const c = parseCoords(farm.location);
          if (c) { coords = c; break; }
        }
      }

      if (coords) {
        // ~0.8 degrees spans ~55 miles — enough to show the 25-mile radius
        setRegion({ ...coords, latitudeDelta: 0.8, longitudeDelta: 0.8 });
        loadNearbyFarms(coords.latitude, coords.longitude);
        loadNearbyCrops(coords.latitude, coords.longitude);
      }
    } catch (e) {
      console.error('Map init error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyFarms = async (lat, lng) => {
    try {
      const res = await mapAPI.getNearbyFarms(lat, lng, RADIUS_KM);
      setNearbyFarms(Array.isArray(res.data) ? res.data : []);
    } catch {
      // not critical
    }
  };

  const loadNearbyCrops = async (lat, lng) => {
    try {
      const res = await mapAPI.getNearbyCrops(lat, lng, RADIUS_KM);
      setNearbyFarmCrops(Array.isArray(res.data) ? res.data : []);
    } catch {
      // not critical
    }
  };

  const goToMyLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.8, longitudeDelta: 0.8 }, 500);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Getting your location…</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.center}>
        <Ionicons name="location-outline" size={48} color="#ccc" />
        <Text style={styles.errorTitle}>Location unavailable</Text>
        <Text style={styles.errorSub}>Create a farm first to set your location.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {permissionDenied && (
        <View style={styles.permissionBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#fff" />
          <Text style={styles.permissionText}>Showing farm location — enable location for live position</Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={!permissionDenied}
        showsMyLocationButton={false}
      >
        {/* User's own farms */}
        {farms.map(farm => {
          const coords = parseCoords(farm.location);
          if (!coords) return null;
          return (
            <Marker
              key={`my-${farm.id}`}
              coordinate={coords}
              title={farm.name}
              description={farm.farm_type}
              pinColor="#4CAF50"
            />
          );
        })}

        {/* Nearby farms that have NO active crops — plain orange pin */}
        {nearbyFarms
          .filter(farm => !cropFarmIds.has(String(farm.id)))
          .map(farm => {
            const coords = parseCoords(farm.location);
            if (!coords) return null;
            return (
              <Marker
                key={`farm-${farm.id}`}
                coordinate={coords}
                title={farm.name}
                description={`${farm.first_name} · ${kmToMiles(farm.distance_km)} mi away`}
                pinColor="#FF9800"
              />
            );
          })}

        {/* Nearby farms WITH active crops — emoji marker + detailed callout */}
        {nearbyFarmCrops.map(farm => {
          const coords = parseCoords(farm.location);
          if (!coords) return null;
          const topEmoji = vegEmoji(farm.crops[0].vegetable_name);
          const extraCount = farm.crops.length - 1;
          return (
            <Marker key={`crop-${farm.farm_id}`} coordinate={coords}>
              <View style={styles.cropMarker}>
                <Text style={styles.cropMarkerEmoji}>{topEmoji}</Text>
                {extraCount > 0 && (
                  <View style={styles.cropBadge}>
                    <Text style={styles.cropBadgeText}>+{extraCount}</Text>
                  </View>
                )}
              </View>
              <Callout tooltip={false}>
                <View style={styles.callout}>
                  <Text style={styles.calloutFarm}>{farm.farm_name}</Text>
                  <Text style={styles.calloutMeta}>
                    {farm.first_name} · {kmToMiles(farm.distance_km)} mi away
                  </Text>
                  {farm.crops.slice(0, 6).map(crop => (
                    <Text key={crop.crop_id} style={styles.calloutCrop}>
                      {vegEmoji(crop.vegetable_name)} {crop.vegetable_name}
                      {crop.status !== 'planted' ? `  ·  ${crop.status}` : ''}
                    </Text>
                  ))}
                  {farm.crops.length > 6 && (
                    <Text style={styles.calloutMore}>+{farm.crops.length - 6} more</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Re-centre button — floats above panel when visible */}
      {!permissionDenied && (
        <TouchableOpacity
          style={[styles.locationButton, panelShown && { bottom: 155 }]}
          onPress={goToMyLocation}
        >
          <Ionicons name="locate" size={22} color="#4CAF50" />
        </TouchableOpacity>
      )}

      {/* Legend — floats above panel when visible */}
      <View style={[styles.legend, panelShown && { bottom: 148 }]}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Your farms</Text>
        </View>
        {nearbyFarms.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>{nearbyFarms.length} nearby</Text>
          </View>
        )}
        {nearbyFarmCrops.length > 0 && (
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🌱</Text>
            <Text style={styles.legendText}>{nearbyFarmCrops.length} growing</Text>
          </View>
        )}
      </View>

      {/* Community crops panel */}
      {panelShown && (
        <View style={styles.cropsPanel}>
          <Text style={styles.cropsPanelTitle}>Growing in your community · 25 mi radius</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cropsScroll}
          >
            {uniqueVegetables.map(veg => (
              <View key={veg.name} style={styles.vegChip}>
                <Text style={styles.vegEmojiText}>{veg.emoji}</Text>
                <Text style={styles.vegName}>{veg.name}</Text>
                <View style={styles.vegCountBadge}>
                  <Text style={styles.vegCountText}>{veg.count}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', gap: 12 },
  loadingText: { fontSize: 14, color: '#666', marginTop: 8 },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  errorSub: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 32 },
  permissionBanner: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  permissionText: { color: '#fff', fontSize: 12, flex: 1 },
  locationButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  legend: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#333' },
  legendEmoji: { fontSize: 12 },
  // Crop emoji markers
  cropMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cropMarkerEmoji: { fontSize: 22 },
  cropBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cropBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  // Callout popup
  callout: {
    minWidth: 160,
    maxWidth: 220,
    padding: 10,
  },
  calloutFarm: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  calloutMeta: { fontSize: 11, color: '#888', marginBottom: 6 },
  calloutCrop: { fontSize: 13, color: '#333', paddingVertical: 2 },
  calloutMore: { fontSize: 11, color: '#888', marginTop: 2 },
  // Bottom community crops panel
  cropsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 14,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cropsPanelTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
    paddingHorizontal: 16,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  cropsScroll: { paddingHorizontal: 12 },
  vegChip: {
    alignItems: 'center',
    backgroundColor: '#f1f8f1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    minWidth: 80,
  },
  vegEmojiText: { fontSize: 26, marginBottom: 4 },
  vegName: { fontSize: 10, color: '#333', fontWeight: '500', textAlign: 'center' },
  vegCountBadge: {
    marginTop: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  vegCountText: { fontSize: 10, color: '#fff', fontWeight: '700' },
});
