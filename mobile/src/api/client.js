import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Add token to requests
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      await AsyncStorage.removeItem('authToken');
      // TODO: Navigate to login
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password, firstName, lastName, experienceLevel) =>
    client.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      experienceLevel
    }),
  
  login: (email, password) =>
    client.post('/auth/login', { email, password }),
  
  getProfile: () =>
    client.get('/auth/profile'),
  
  updateProfile: (data) =>
    client.put('/auth/profile', data)
};

// Farm API
export const farmAPI = {
  createFarm: (farmData) =>
    client.post('/farms', farmData),
  
  getMyFarms: () =>
    client.get('/farms/my-farms'),
  
  getFarmDetail: (farmId) =>
    client.get(`/farms/${farmId}`),
  
  updateFarm: (farmId, updates) =>
    client.put(`/farms/${farmId}`, updates),
  
  addCollaborator: (farmId, email, role) =>
    client.post(`/farms/${farmId}/collaborators`, { email, role }),
  
  getFarmActivity: (farmId) =>
    client.get(`/farms/${farmId}/activity`)
};

// Crop API
export const cropAPI = {
  plantCrop: (farmId, vegetableId, plantingDate, quantity, growingMethod, notes) =>
    client.post('/crops', {
      farmId,
      vegetableId,
      plantingDate,
      quantity,
      growingMethod,
      notes
    }),
  
  getFarmCrops: (farmId) =>
    client.get(`/crops/farm/${farmId}`),

  getCropDetail: (cropId) =>
    client.get(`/crops/${cropId}`),

  updateCrop: (cropId, updates) =>
    client.put(`/crops/${cropId}`, updates)
};

// Recommendations API
export const recommendationAPI = {
  getVegetables: (climateZone, season, difficulty) =>
    client.get('/recommendations/vegetables', {
      params: { climateZone, season, difficulty }
    }),
  
  getVegetableGuide: (vegetableId) =>
    client.get(`/recommendations/vegetable/${vegetableId}`),
  
  getSeasonalRecommendations: () =>
    client.get('/recommendations/seasonal')
};

// Map & Community API
export const mapAPI = {
  getNearbyFarms: (latitude, longitude, radiusKm = 10) =>
    client.get('/map/nearby-farms', {
      params: { latitude, longitude, radiusKm }
    }),
  
  getNearbyGroups: (latitude, longitude, radiusKm = 10) =>
    client.get('/map/nearby-groups', {
      params: { latitude, longitude, radiusKm }
    }),
  
  updateLocation: (latitude, longitude) =>
    client.put('/map/update-location', { latitude, longitude })
};

// Community API
export const communityAPI = {
  createGroup: (name, description, latitude, longitude, address) =>
    client.post('/community/groups', {
      name,
      description,
      latitude,
      longitude,
      address
    }),
  
  getMyGroups: () =>
    client.get('/community/my-groups'),
  
  joinGroup: (groupId) =>
    client.post(`/community/groups/${groupId}/join`),
  
  createPost: (groupId, title, content, category, imageUrls) =>
    client.post(`/community/groups/${groupId}/posts`, {
      title,
      content,
      category,
      imageUrls
    }),
  
  getGroupPosts: (groupId) =>
    client.get(`/community/groups/${groupId}/posts`),
  
  addComment: (postId, content) =>
    client.post(`/community/posts/${postId}/comments`, { content })
};

// Sync API (for offline-first)
export const syncAPI = {
  pushChanges: (changes) =>
    client.post('/sync/push', { changes }),
  
  getPending: () =>
    client.get('/sync/pending'),
  
  confirmSync: (syncIds) =>
    client.post('/sync/confirm', { syncIds })
};

export default client;
