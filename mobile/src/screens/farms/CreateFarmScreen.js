import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { farmAPI } from '../../api/client';
import { useFarmStore } from '../../store';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function CreateFarmScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [farmType, setFarmType] = useState('backyard');
  const [sizeSqft, setSizeSqft] = useState('');
  const [address, setAddress] = useState('');
  const [climateZone, setClimateZone] = useState('7a');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);

  const { addFarm } = useFarmStore();

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setError('');
    } catch (err) {
      setError('Failed to get location');
    }
  };

  const handleCreateFarm = async () => {
    setError('');
    setLoading(true);

    try {
      if (!name || !location) {
        setError('Farm name and location are required');
        setLoading(false);
        return;
      }

      const response = await farmAPI.createFarm({
        name,
        description,
        farmType,
        sizeSqft: sizeSqft ? parseFloat(sizeSqft) : null,
        latitude: location.latitude,
        longitude: location.longitude,
        address,
        climateZone
      });

      addFarm(response.data);
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create farm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Farm</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Farm Name *"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>Farm Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={farmType} onValueChange={setFarmType}>
            <Picker.Item label="Backyard" value="backyard" />
            <Picker.Item label="Medium Garden" value="medium" />
            <Picker.Item label="Large Farm" value="large" />
            <Picker.Item label="Greenhouse" value="greenhouse" />
            <Picker.Item label="Hybrid (Outdoor + Greenhouse)" value="hybrid" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Size (sq ft)"
          value={sizeSqft}
          onChangeText={setSizeSqft}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          editable={!loading}
        />

        <Text style={styles.label}>Climate Zone</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={climateZone} onValueChange={setClimateZone}>
            <Picker.Item label="Zone 3a" value="3a" />
            <Picker.Item label="Zone 4a" value="4a" />
            <Picker.Item label="Zone 5a" value="5a" />
            <Picker.Item label="Zone 6a" value="6a" />
            <Picker.Item label="Zone 7a" value="7a" />
            <Picker.Item label="Zone 8a" value="8a" />
            <Picker.Item label="Zone 9a" value="9a" />
            <Picker.Item label="Zone 10a" value="10a" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.locationButton, location && styles.locationButtonActive]}
          onPress={getLocation}
          disabled={loading}
        >
          <Ionicons
            name={location ? 'checkmark-circle' : 'location'}
            size={20}
            color={location ? '#4CAF50' : '#999'}
          />
          <Text style={styles.locationText}>
            {location ? 'Location Set ✓' : 'Set Farm Location'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateFarm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Farm</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 14
  },
  textArea: {
    textAlignVertical: 'top'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden'
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 12,
    marginBottom: 20
  },
  locationButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f6'
  },
  locationText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666'
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderColor: '#ef5350',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15
  },
  errorText: {
    color: '#c62828',
    fontSize: 14
  }
});
