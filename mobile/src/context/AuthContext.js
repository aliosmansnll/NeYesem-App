import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, loginRestaurant, registerRestaurant } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'user' veya 'restaurant'

  // Uygulama açıldığında kullanıcı/restoran bilgisini kontrol et
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedUser, storedRestaurant, storedUserType] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('restaurant'),
        AsyncStorage.getItem('userType')
      ]);
      
      if (storedUser && storedUserType === 'user') {
        setUser(JSON.parse(storedUser));
        setUserType('user');
      } else if (storedRestaurant && storedUserType === 'restaurant') {
        setRestaurant(JSON.parse(storedRestaurant));
        setUserType('restaurant');
      }
    } catch (error) {
      console.error('Auth yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginAsUser = async (mail, password) => {
    try {
      const response = await loginUser(mail, password);
      const userData = {
        kullaniciID: response.kullaniciID || null,
        ad: response.ad || '',
        soyad: response.soyad || '',
        mail: response.mail || '',
        puan: response.puan || 0,
      };
      
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['userType', 'user']
      ]);
      setUser(userData);
      setUserType('user');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const loginAsRestaurant = async (mail, password) => {
    try {
      const response = await loginRestaurant(mail, password);
      const restaurantData = {
        restorantID: response.restorantID || null,
        ad: response.ad || '',
        mail: response.mail || '',
        telefon: response.telefon || '',
        latitude: response.latitude || null,
        longitude: response.longitude || null,
      };
      
      await AsyncStorage.multiSet([
        ['restaurant', JSON.stringify(restaurantData)],
        ['userType', 'restaurant']
      ]);
      setRestaurant(restaurantData);
      setUserType('restaurant');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const registerAsUser = async (userData) => {
    try {
      const response = await registerUser(userData);
      const user = {
        kullaniciID: response.kullaniciID || null,
        ad: response.ad || '',
        soyad: response.soyad || '',
        mail: response.mail || '',
        puan: response.puan || 0,
      };
      
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(user)],
        ['userType', 'user']
      ]);
      setUser(user);
      setUserType('user');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const registerAsRestaurant = async (restaurantData) => {
    try {
      const response = await registerRestaurant(restaurantData);
      const restaurant = {
        restorantID: response.restorantID || null,
        ad: response.ad || '',
        mail: response.mail || '',
        telefon: response.telefon || '',
        latitude: response.latitude || null,
        longitude: response.longitude || null,
      };
      
      await AsyncStorage.multiSet([
        ['restaurant', JSON.stringify(restaurant)],
        ['userType', 'restaurant']
      ]);
      setRestaurant(restaurant);
      setUserType('restaurant');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'restaurant', 'userType']);
      setUser(null);
      setRestaurant(null);
      setUserType(null);
    } catch (error) {
      console.error('Çıkış yapılamadı:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        userType,
        loading,
        loginAsUser,
        loginAsRestaurant,
        registerAsUser,
        registerAsRestaurant,
        logout,
        isAuthenticated: !!(user || restaurant),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
