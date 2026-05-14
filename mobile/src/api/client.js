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
  register: (email, password, firstName, lastName, experienceLevel, countryCode) =>
    client.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      experienceLevel,
      countryCode,
    }),
  
  login: (email, password) =>
    client.post('/auth/login', { email, password }),
  
  getProfile: () =>
    client.get('/auth/profile'),
  
  updateProfile: (data) =>
    client.put('/auth/profile', data),

  updateCountry: (countryCode) =>
    client.put('/auth/profile', { countryCode })
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
    client.get(`/farms/${farmId}/activity`),

  getSeasonReport: (farmId) =>
    client.get(`/farms/${farmId}/season-report`),
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
    client.put(`/crops/${cropId}`, updates),

  // Diary
  getDiary: (cropId) =>
    client.get(`/crops/${cropId}/diary`),

  addDiaryEntry: (cropId, entry) =>
    client.post(`/crops/${cropId}/diary`, entry),

  deleteDiaryEntry: (cropId, entryId) =>
    client.delete(`/crops/${cropId}/diary/${entryId}`),

  diagnoseCrop: (imageBase64, cropName) =>
    client.post('/disease/diagnose', { imageBase64, cropName }),
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
    client.get('/recommendations/seasonal'),

  checkVegetableName: (name) =>
    client.get('/recommendations/check-name', { params: { name } }),

  requestVegetable: (vegetableName, description, reason) =>
    client.post('/recommendations/vegetable-requests', { vegetableName, description, reason }),

  getMyVegetableRequests: () =>
    client.get('/recommendations/vegetable-requests'),

  getCalendar: (farmId) =>
    client.get(`/calendar/${farmId}`),
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
    client.put('/map/update-location', { latitude, longitude }),

  getNearbyCrops: (latitude, longitude, radiusKm = 40.2) =>
    client.get('/map/nearby-crops', {
      params: { latitude, longitude, radiusKm }
    })
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

// Admin API
export const adminAPI = {
  getStats: () =>
    client.get('/admin/stats'),

  getActivity: () =>
    client.get('/admin/activity'),

  getVegetableRequests: () =>
    client.get('/admin/vegetable-requests'),

  updateRequestStatus: (id, status) =>
    client.put(`/admin/vegetable-requests/${id}/status`, { status }),

  getUsers: () =>
    client.get('/admin/users'),
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

// Notifications API
export const notificationAPI = {
  registerToken: (token, platform) =>
    client.post('/notifications/register-token', { token, platform }),
};

// Disease Detection API
export const diseaseAPI = {
  diagnose: (imageBase64, cropName) =>
    client.post('/disease/diagnose', { imageBase64, cropName }),
};

// Achievements API
export const achievementsAPI = {
  getAchievements: () =>
    client.get('/achievements'),
  checkAchievements: (trigger) =>
    client.post('/achievements/check', { trigger }),
};

// Planting Calendar API
export const calendarAPI = {
  getCalendar: (farmId) =>
    client.get(`/calendar/${farmId}`),
};

// Marketplace API
export const marketplaceAPI = {
  getNearby: (latitude, longitude, radiusKm = 40) =>
    client.get('/marketplace/nearby', { params: { latitude, longitude, radiusKm } }),
  getMyListings: () =>
    client.get('/marketplace/my'),
  createListing: (data) =>
    client.post('/marketplace', data),
  getListing: (id) =>
    client.get(`/marketplace/${id}`),
  updateListing: (id, data) =>
    client.put(`/marketplace/${id}`, data),
  deleteListing: (id) =>
    client.delete(`/marketplace/${id}`),
};

// Garden Planner API
export const plannerAPI = {
  getVegetables: () =>
    client.get('/planner/vegetables'),
  getCompanions: (vegetableId) =>
    client.get(`/planner/companions/${vegetableId}`),
  getPlans: () =>
    client.get('/planner/plans'),
  savePlan: (data) =>
    client.post('/planner/plans', data),
  deletePlan: (planId) =>
    client.delete(`/planner/plans/${planId}`),
};

// Billing / Subscription API
export const billingAPI = {
  getStatus: () => client.get('/billing/status'),
  createCheckoutSession: () => client.post('/billing/create-checkout-session'),
  cancel: () => client.post('/billing/cancel'),
};

export const adsAPI = {
  getBanner: (country = 'IN') => client.get(`/ads/banner?country=${country}`),
};

// KisanBot — AI Agronomist Chatbot API
export const chatbotAPI = {
  chat: (message, history = [], farmContext = null) =>
    client.post('/chatbot/chat', { message, history, farmContext }),
  getSuggestions: (country = 'IN') =>
    client.get('/chatbot/suggestions', { params: { country } }),
};

// Farm Financial Dashboard API
export const financialsAPI = {
  getSummary: (farmId, year) =>
    client.get(`/financials/farm/${farmId}/summary`, { params: { year } }),
  getTrend: (farmId, year) =>
    client.get(`/financials/farm/${farmId}/trend`, { params: { year } }),
  getRecords: (farmId, type) =>
    client.get(`/financials/farm/${farmId}`, { params: { type } }),
  addRecord: (farmId, data) =>
    client.post(`/financials/farm/${farmId}`, data),
  deleteRecord: (recordId) =>
    client.delete(`/financials/${recordId}`),
};

// Government Schemes API (India + US)
export const schemesAPI = {
  getSchemes: (country = 'IN', category, state) =>
    client.get('/schemes', { params: { country, category, state } }),
  getScheme: (schemeId) =>
    client.get(`/schemes/${schemeId}`),
  checkEligibility: (data) =>
    client.post('/schemes/check-eligibility', data),
};

// Today's Tasks API
export const tasksAPI = {
  getToday: () => client.get('/tasks/today'),
  complete: (cropId, taskType) => client.post('/tasks/complete', { cropId, taskType }),
};

// Grow Stories API
export const storiesAPI = {
  getFeed: (page = 1) => client.get('/stories', { params: { page } }),
  getMy: () => client.get('/stories/my'),
  create: (data) => client.post('/stories', data),
  like: (storyId) => client.post(`/stories/${storyId}/like`),
  delete: (storyId) => client.delete(`/stories/${storyId}`),
};

// Succession Planner API
export const successionAPI = {
  calculate: (vegetableId, intervalWeeks, batches, startDate) =>
    client.get('/succession/calculate', { params: { vegetableId, intervalWeeks, batches, startDate } }),
  getFarmPlans: (farmId) => client.get(`/succession/farm/${farmId}`),
  save: (data) => client.post('/succession', data),
  delete: (planId) => client.delete(`/succession/${planId}`),
};

export default client;
