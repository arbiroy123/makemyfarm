import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { loadSavedLanguage } from './src/i18n';
import { StoreProvider, useAuthStore } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { notificationAPI } from './src/api/client';

// Screens — Auth
import SplashScreen from './src/screens/SplashScreen';
import TermsScreen from './src/screens/TermsScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Screens — Main Tabs
import HomeScreen from './src/screens/home/HomeScreen';
import MapScreen from './src/screens/map/MapScreen';
import CommunityScreen from './src/screens/community/CommunityScreen';
import RecommendationsScreen from './src/screens/recommendations/RecommendationsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import AdminScreen from './src/screens/admin/AdminScreen';
import MarketplaceScreen from './src/screens/marketplace/MarketplaceScreen';

// Screens — Stack (Farm)
import FarmDetailScreen from './src/screens/farms/FarmDetailScreen';
import CreateFarmScreen from './src/screens/farms/CreateFarmScreen';
import SeasonReportScreen from './src/screens/farms/SeasonReportScreen';

// Screens — Stack (Crops)
import PlantCropScreen from './src/screens/crops/PlantCropScreen';
import CropDetailScreen from './src/screens/crops/CropDetailScreen';
import CropDiaryScreen from './src/screens/crops/CropDiaryScreen';
import DiseaseDetectionScreen from './src/screens/crops/DiseaseDetectionScreen';

// Screens — Stack (Recommendations)
import RequestVegetableScreen from './src/screens/recommendations/RequestVegetableScreen';
import PlantingCalendarScreen from './src/screens/recommendations/PlantingCalendarScreen';

// Screens — Stack (Profile)
import AchievementsScreen from './src/screens/profile/AchievementsScreen';

// Screens — Stack (Marketplace)
import CreateListingScreen from './src/screens/marketplace/CreateListingScreen';
import ListingDetailScreen from './src/screens/marketplace/ListingDetailScreen';

// Screens — Stack (Planner)
import GardenPlannerScreen from './src/screens/planner/GardenPlannerScreen';

// Components
import LanguagePicker from './src/components/LanguagePicker';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HEADER_OPTS = { backgroundColor: '#4CAF50' };

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: HEADER_OPTS,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <LanguagePicker trigger="icon" />,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e0e0e0', paddingBottom: 5, paddingTop: 5 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home', Map: 'map', Community: 'people',
            Recommendations: 'leaf', Profile: 'person',
            Market: 'storefront', Admin: 'shield',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabHome'), tabBarLabel: t('tabHome') }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: t('tabMap'), tabBarLabel: t('tabMapShort') }} />
      <Tab.Screen name="Market" component={MarketplaceScreen} options={{ title: 'Marketplace', tabBarLabel: 'Market' }} />
      <Tab.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: t('tabLearn'), tabBarLabel: t('tabLearn') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabProfile'), tabBarLabel: t('tabProfile') }} />
      {user?.isAdmin && (
        <Tab.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin', tabBarLabel: 'Admin' }} />
      )}
    </Tab.Navigator>
  );
}

function RootStack({ isLoggedIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainApp" component={MainTabs} />
          {/* Farm */}
          <Stack.Screen name="CreateFarm" component={CreateFarmScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="FarmDetail" component={FarmDetailScreen} />
          <Stack.Screen name="SeasonReport" component={SeasonReportScreen} options={{ title: 'Season Report', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          {/* Crops */}
          <Stack.Screen name="PlantCrop" component={PlantCropScreen} options={{ title: 'Plant a Crop', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          <Stack.Screen name="CropDetail" component={CropDetailScreen} options={{ title: 'Crop Detail', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          <Stack.Screen name="CropDiary" component={CropDiaryScreen} options={{ title: 'Crop Diary', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          <Stack.Screen name="DiseaseDetection" component={DiseaseDetectionScreen} options={{ title: 'Plant Diagnosis', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          {/* Recommendations */}
          <Stack.Screen name="RequestVegetable" component={RequestVegetableScreen} options={{ title: 'Request a Vegetable', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          <Stack.Screen name="PlantingCalendar" component={PlantingCalendarScreen} options={{ title: 'Planting Calendar', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          {/* Profile */}
          <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Achievements', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          {/* Marketplace */}
          <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'New Listing', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
          {/* Garden Planner */}
          <Stack.Screen name="GardenPlanner" component={GardenPlannerScreen} options={{ title: 'Garden Planner', headerShown: true, headerStyle: HEADER_OPTS, headerTintColor: '#fff' }} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

const TERMS_ACCEPTED_KEY = 'termsAccepted';

async function registerForPushNotifications() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

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
          // Register push token after login restored
          const pushToken = await registerForPushNotifications();
          if (pushToken) {
            notificationAPI.registerToken(pushToken, Platform.OS).catch(() => {});
          }
        }
      } catch (_) {
        // ignore — treat as logged out / terms not accepted
      } finally {
        setIsLoading(false);
      }
      loadSavedLanguage().catch(() => {});
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
