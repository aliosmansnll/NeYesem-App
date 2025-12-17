import axios from 'axios';

// Backend API URL
// Local Network: Aynı WiFi ağındaki cihazlar için bilgisayarın IP adresi
const API_URL = 'http://172.21.83.235:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - hata loglama için
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== USER ENDPOINTS ====================

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Kayıt başarısız';
  }
};

export const loginUser = async (mail, password) => {
  try {
    const response = await api.post('/users/login', null, {
      params: { mail, password }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Giriş başarısız';
  }
};

export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Kullanıcı bulunamadı';
  }
};

export const getAllUsers = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get('/users/', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Kullanıcılar getirilemedi';
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Kullanıcı silinemedi';
  }
};

// ==================== RESTAURANT ENDPOINTS ====================

export const registerRestaurant = async (restaurantData) => {
  try {
    const response = await api.post('/restaurants/register', restaurantData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Restoran kaydı başarısız';
  }
};

export const loginRestaurant = async (mail, password) => {
  try {
    const response = await api.post('/restaurants/login', null, {
      params: { mail, password }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Giriş başarısız';
  }
};

export const getAllRestaurants = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get('/restaurants/', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Restoranlar getirilemedi';
  }
};

export const getRestaurant = async (restaurantId) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Restoran bulunamadı';
  }
};

export const deleteRestaurant = async (restaurantId) => {
  try {
    const response = await api.delete(`/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Restoran silinemedi';
  }
};

// ==================== MENU ENDPOINTS ====================

export const createMenuItem = async (menuData) => {
  try {
    const response = await api.post('/menu/', menuData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Menü öğesi eklenemedi';
  }
};

export const getRestaurantMenu = async (restaurantId) => {
  try {
    const response = await api.get(`/menu/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Menü getirilemedi';
  }
};

export const getMenuItem = async (menuId) => {
  try {
    const response = await api.get(`/menu/${menuId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Menü öğesi bulunamadı';
  }
};

export const deleteMenuItem = async (menuId) => {
  try {
    const response = await api.delete(`/menu/${menuId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Menü öğesi silinemedi';
  }
};

// ==================== REVIEW ENDPOINTS ====================

export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Yorum eklenemedi';
  }
};

export const getRestaurantReviews = async (restaurantId) => {
  try {
    const response = await api.get(`/reviews/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Yorumlar getirilemedi';
  }
};

export const getRestaurantOnlyReviews = async (restaurantId) => {
  try {
    const response = await api.get(`/reviews/restaurant/${restaurantId}/only`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Yorumlar getirilemedi';
  }
};

export const getMenuReviews = async (menuId) => {
  try {
    const response = await api.get(`/reviews/menu/${menuId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Yorumlar getirilemedi';
  }
};

export const getUserReviews = async (userId) => {
  try {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Yorumlar getirilemedi';
  }
};

export default api;
