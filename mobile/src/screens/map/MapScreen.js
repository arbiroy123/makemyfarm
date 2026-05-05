import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { mapAPI } from '../../api/client';
import { useFarmStore } from '../../store';

function parseCoords(geoJson) {
  try {
    const parsed = typeof geoJson === 'string' ? JSON.parse(geoJson) : geoJson;
    return { latitude: parsed.coordinates[1], longitude: parsed.coordinates[0] };
  } catch {
    return null;
  }
}

export default function MapScreen() {
  const mapRef = useRef(null);
  const { farms } = useFarmStore();
  const [region, setRegion] = useState(null);
  const [nearbyFarms, setNearbyFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

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
        // fall back to first farm's location
        for (const farm of farms) {
          const c = parseCoords(farm.location);
          if (c) { coords = c; break; }
        }
      }

      if (coords) {
        setRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        loadNearbyFarms(coords.latitude, coords.longitude);
      }
    } catch (e) {
      console.error('Map init error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyFarms = async (lat, lng) => {
    try {
      const res = await mapAPI.getNearbyFarms(lat, lng, 25);
      setNearbyFarms(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // not critical
    }
  };

  const goToMyLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 500);
    } catch (e) {}
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
              key={farm.id}
              coordinate={coords}
              title={farm.name}
              description={farm.farm_type}
              pinColor="#4CAF50"
            />
          );
        })}

        {/* Nearby public farms */}
        {nearbyFarms.map(farm => {
          const coords = parseCoords(farm.location);
          if (!coords) return null;
          return (
            <Marker
              key={farm.id}
              coordinate={coords}
              title={farm.name}
              description={`${farm.first_name} · ${parseFloat(farm.distance_km).toFixed(1)} km away`}
              pinColor="#FF9800"
            />
          );
        })}
      </MapView>

      {/* Re-centre button */}
      {!permissionDenied && (
        <TouchableOpacity style={styles.locationButton} onPress={goToMyLocation}>
          <Ionicons name="locate" size={22} color="#4CAF50" />
        </TouchableOpacity>
      )}

      {/* Legend */}
      <View style={styles.legend}>
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
      </View>
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
});
