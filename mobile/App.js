import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import HomeScreen from './screens/home/HomeScreen';
import FarmDetailScreen from './screens/farms/FarmDetailScreen';
import CreateFarmScreen from './screens/farms/CreateFarmScreen';
import MapScreen from './screens/map/MapScreen';
import CommunityScreen from './screens/community/CommunityScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import CropDetailScreen from './screens/crops/CropDetailScreen';
import RecommendationsScreen from './screens/recommendations/RecommendationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main App Tabs
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
          paddingTop: 5
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Map') iconName = 'map';
          else if (route.name === 'Community') iconName = 'people';
          else if (route.name === 'Recommendations') iconName = 'leaf';
          else if (route.name === 'Profile') iconName = 'person';

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'My Farms' }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Community Map' }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen
        name="Recommendations"
        component={RecommendationsScreen}
        options={{ title: 'Learn' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
function RootStack({ isLoggedIn, isLoading }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : isLoggedIn ? (
        <>
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen
            name="CreateFarm"
            component={CreateFarmScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="FarmDetail"
            component={FarmDetailScreen}
          />
          <Stack.Screen
            name="CropDetail"
            component={CropDetailScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is logged in (check AsyncStorage)
    const checkLoginStatus = async () => {
      try {
        // TODO: Check stored token
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      <RootStack isLoggedIn={isLoggedIn} isLoading={isLoading} />
    </NavigationContainer>
  );
}
