import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import React from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoreProvider, useAuthStore } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import TermsScreen from './src/screens/TermsScreen';
import PlantCropScreen from './src/screens/crops/PlantCropScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import FarmDetailScreen from './src/screens/farms/FarmDetailScreen';
import CreateFarmScreen from './src/screens/farms/CreateFarmScreen';
import CommunityScreen from './src/screens/community/CommunityScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import CropDetailScreen from './src/screens/crops/CropDetailScreen';
import RecommendationsScreen from './src/screens/recommendations/RecommendationsScreen';

function MapScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 18, color: '#333' }}>Community Map</Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }}>Map view coming soon for web</Text>
    </View>
  );
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Map') iconName = 'map';
          else if (route.name === 'Community') iconName = 'people';
          else if (route.name === 'Recommendations') iconName = 'leaf';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'My Farms' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Community Map' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
      <Tab.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: 'Learn' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function RootStack({ isLoggedIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="CreateFarm" component={CreateFarmScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="FarmDetail" component={FarmDetailScreen} />
          <Stack.Screen name="PlantCrop" component={PlantCropScreen} options={{ title: 'Plant a Crop', headerShown: true, headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }} />
          <Stack.Screen name="CropDetail" component={CropDetailScreen} options={{ title: 'Crop Detail', headerShown: true, headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

const TERMS_ACCEPTED_KEY = 'termsAccepted';

// Reads token from AsyncStorage on startup and restores auth state
function AppNavigator() {
  const { isLoggedIn, login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  React.useEffect(() => {
    async function restoreSession() {
      try {
        const [token, userJson, accepted] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem(TERMS_ACCEPTED_KEY),
        ]);
        if (accepted === 'true') setTermsAccepted(true);
        if (token && userJson) {
          login(JSON.parse(userJson), token);
        }
      } catch (_) {
        // ignore — treat as logged out / terms not accepted
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function handleAcceptTerms() {
    await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    setTermsAccepted(true);
  }

  if (isLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (!termsAccepted) {
    return <TermsScreen onAccept={handleAcceptTerms} />;
  }

  return (
    <NavigationContainer>
      <RootStack isLoggedIn={isLoggedIn} />
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <AppNavigator />
      </StoreProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
