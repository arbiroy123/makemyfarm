import React, { createContext, useContext, useReducer } from 'react';

// --- Auth ---
const AuthContext = createContext(null);

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload };
    case 'SET_TOKEN': return { ...state, token: action.payload };
    case 'SET_LOGGED_IN': return { ...state, isLoggedIn: action.payload };
    case 'LOGIN': return { ...state, user: action.user, token: action.token, isLoggedIn: true, isGuest: false };
    case 'LOGOUT': return { user: null, token: null, isLoggedIn: false, isGuest: false };
    case 'GUEST': return { ...state, isGuest: true };
    case 'EXIT_GUEST': return { ...state, isGuest: false };
    default: return state;
  }
}

// --- Farm ---
const FarmContext = createContext(null);

function farmReducer(state, action) {
  switch (action.type) {
    case 'SET_FARMS': return { ...state, farms: action.payload };
    case 'SET_CURRENT_FARM': return { ...state, currentFarm: action.payload };
    case 'ADD_FARM': return { ...state, farms: [...state.farms, action.payload] };
    case 'UPDATE_FARM': return {
      ...state,
      farms: state.farms.map(f => f.id === action.id ? { ...f, ...action.updates } : f),
    };
    default: return state;
  }
}

// --- Crop ---
const CropContext = createContext(null);

function cropReducer(state, action) {
  switch (action.type) {
    case 'SET_CROPS': return { ...state, crops: action.payload };
    case 'ADD_CROP': return { ...state, crops: [...state.crops, action.payload] };
    case 'UPDATE_CROP': return {
      ...state,
      crops: state.crops.map(c => c.id === action.id ? { ...c, ...action.updates } : c),
    };
    default: return state;
  }
}

// --- Community ---
const CommunityContext = createContext(null);

function communityReducer(state, action) {
  switch (action.type) {
    case 'SET_GROUPS': return { ...state, groups: action.payload };
    case 'SET_NEARBY_FARMS': return { ...state, nearbyFarms: action.payload };
    case 'SET_POSTS': return { ...state, posts: action.payload };
    case 'ADD_POST': return { ...state, posts: [action.payload, ...state.posts] };
    default: return state;
  }
}

// --- Provider ---
export function StoreProvider({ children }) {
  const [authState, authDispatch] = useReducer(authReducer, { user: null, token: null, isLoggedIn: false, isGuest: false });
  const [farmState, farmDispatch] = useReducer(farmReducer, { farms: [], currentFarm: null });
  const [cropState, cropDispatch] = useReducer(cropReducer, { crops: [] });
  const [communityState, communityDispatch] = useReducer(communityReducer, { groups: [], nearbyFarms: [], posts: [] });

  return (
    <AuthContext.Provider value={{ state: authState, dispatch: authDispatch }}>
      <FarmContext.Provider value={{ state: farmState, dispatch: farmDispatch }}>
        <CropContext.Provider value={{ state: cropState, dispatch: cropDispatch }}>
          <CommunityContext.Provider value={{ state: communityState, dispatch: communityDispatch }}>
            {children}
          </CommunityContext.Provider>
        </CropContext.Provider>
      </FarmContext.Provider>
    </AuthContext.Provider>
  );
}

// --- Hooks (same API as zustand stores) ---
export function useAuthStore() {
  const { state, dispatch } = useContext(AuthContext);
  return {
    ...state,
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    setToken: (token) => dispatch({ type: 'SET_TOKEN', payload: token }),
    setLoggedIn: (val) => dispatch({ type: 'SET_LOGGED_IN', payload: val }),
    login: (user, token) => dispatch({ type: 'LOGIN', user, token }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    enterGuestMode: () => dispatch({ type: 'GUEST' }),
    exitGuestMode: () => dispatch({ type: 'EXIT_GUEST' }),
  };
}

export function useFarmStore() {
  const { state, dispatch } = useContext(FarmContext);
  return {
    ...state,
    setFarms: (farms) => dispatch({ type: 'SET_FARMS', payload: farms }),
    setCurrentFarm: (farm) => dispatch({ type: 'SET_CURRENT_FARM', payload: farm }),
    addFarm: (farm) => dispatch({ type: 'ADD_FARM', payload: farm }),
    updateFarm: (id, updates) => dispatch({ type: 'UPDATE_FARM', id, updates }),
  };
}

export function useCropStore() {
  const { state, dispatch } = useContext(CropContext);
  return {
    ...state,
    setCrops: (crops) => dispatch({ type: 'SET_CROPS', payload: crops }),
    addCrop: (crop) => dispatch({ type: 'ADD_CROP', payload: crop }),
    updateCrop: (id, updates) => dispatch({ type: 'UPDATE_CROP', id, updates }),
  };
}

export function useCommunityStore() {
  const { state, dispatch } = useContext(CommunityContext);
  return {
    ...state,
    setGroups: (groups) => dispatch({ type: 'SET_GROUPS', payload: groups }),
    setNearbyFarms: (farms) => dispatch({ type: 'SET_NEARBY_FARMS', payload: farms }),
    setPosts: (posts) => dispatch({ type: 'SET_POSTS', payload: posts }),
    addPost: (post) => dispatch({ type: 'ADD_POST', payload: post }),
  };
}
