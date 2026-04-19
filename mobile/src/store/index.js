// Global state management with Zustand
import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  
  login: (user, token) => set({ user, token, isLoggedIn: true }),
  logout: () => set({ user: null, token: null, isLoggedIn: false })
}));

export const useFarmStore = create((set, get) => ({
  farms: [],
  currentFarm: null,
  
  setFarms: (farms) => set({ farms }),
  setCurrentFarm: (farm) => set({ currentFarm: farm }),
  
  addFarm: (farm) => set((state) => ({
    farms: [...state.farms, farm]
  })),
  
  updateFarm: (farmId, updates) => set((state) => ({
    farms: state.farms.map(f => f.id === farmId ? { ...f, ...updates } : f)
  }))
}));

export const useCropStore = create((set) => ({
  crops: [],
  
  setCrops: (crops) => set({ crops }),
  
  addCrop: (crop) => set((state) => ({
    crops: [...state.crops, crop]
  })),
  
  updateCrop: (cropId, updates) => set((state) => ({
    crops: state.crops.map(c => c.id === cropId ? { ...c, ...updates } : c)
  }))
}));

export const useCommunityStore = create((set) => ({
  groups: [],
  nearbyFarms: [],
  posts: [],
  
  setGroups: (groups) => set({ groups }),
  setNearbyFarms: (farms) => set({ nearbyFarms: farms }),
  setPosts: (posts) => set({ posts }),
  
  addPost: (post) => set((state) => ({
    posts: [post, ...state.posts]
  }))
}));
