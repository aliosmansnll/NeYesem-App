import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RestaurantLoginScreen from '../screens/RestaurantLoginScreen';
import RestaurantRegisterScreen from '../screens/RestaurantRegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import MenuDetailScreen from '../screens/MenuDetailScreen';
import AddReviewScreen from '../screens/AddReviewScreen';
import RestaurantHomeScreen from '../screens/RestaurantHomeScreen';
import RestaurantMenuManagementScreen from '../screens/RestaurantMenuManagementScreen';
import RestaurantReviewsScreen from '../screens/RestaurantReviewsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, restaurant, userType, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user && !restaurant ? (
        // Auth Stack - Kullanıcı/Restoran giriş yapmamışsa
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="UserLogin" component={LoginScreen} />
          <Stack.Screen name="UserRegister" component={RegisterScreen} />
          <Stack.Screen name="RestaurantLogin" component={RestaurantLoginScreen} />
          <Stack.Screen name="RestaurantRegister" component={RestaurantRegisterScreen} />
        </Stack.Navigator>
      ) : userType === 'user' ? (
        // User Stack - Kullanıcı giriş yaptıysa
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FF6B6B',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
            options={({ route }) => ({
              title: route.params?.restaurant?.ad || 'Restoran Detay',
            })}
          />
          <Stack.Screen
            name="MenuDetail"
            component={MenuDetailScreen}
            options={({ route }) => ({
              title: route.params?.menuItem?.yemekadi || 'Menü Detay',
            })}
          />
          <Stack.Screen
            name="AddReview"
            component={AddReviewScreen}
            options={{
              title: 'Yorum Ekle',
            }}
          />
        </Stack.Navigator>
      ) : (
        // Restaurant Stack - Restoran giriş yaptıysa
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4ECDC4',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="RestaurantHome"
            component={RestaurantHomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="RestaurantMenuManagement"
            component={RestaurantMenuManagementScreen}
            options={{
              title: 'Menü Yönetimi',
            }}
          />
          <Stack.Screen
            name="RestaurantReviews"
            component={RestaurantReviewsScreen}
            options={{
              title: 'Yorumlar',
            }}
          />
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
            options={({ route }) => ({
              title: route.params?.restaurant?.ad || 'Restoran Detay',
            })}
          />
          <Stack.Screen
            name="MenuDetail"
            component={MenuDetailScreen}
            options={({ route }) => ({
              title: route.params?.menuItem?.yemekadi || 'Menü Detay',
            })}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
