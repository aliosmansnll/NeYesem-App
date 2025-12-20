import axios from 'axios';

// Backend API URL
// ÖNEMLI: Telefonun internet paylaşımı (hotspot) kullanıyorsan aşağıdaki IP'yi kullan
// WiFi kullanıyorsan, bilgisayarın WiFi IP'sini yaz (ipconfig komutuyla öğrenebilirsin)
// Docker kullanıyorsan backend container'ı 8000 portunda çalışıyor
// API URL'yi değiştirmek için:
// 1. Bilgisayarınızın IP adresini öğrenin (Windows: ipconfig, Mac/Linux: ifconfig)
// 2. Aşağıdaki IP adresini kendi IP'nizle değiştirin
const API_URL = 'http://YOUR_COMPUTER_IP:8000';

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
    const response = await api.post('/users/login', {
      mail,
      password
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
    const response = await api.post('/restaurants/login', {
      mail,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Giriş başarısız';
  }
};

export const getAllRestaurants = async (skip = 0, limit = 100, search = null) => {
  try {
    const params = { skip, limit };
    if (search) params.search = search;
    
    const response = await api.get('/restaurants/', { params });
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

export const updateRestaurant = async (restaurantId, restaurantData) => {
  try {
    const response = await api.put(`/restaurants/${restaurantId}`, restaurantData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Restoran güncellenemedi';
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

// ==================== RESTORAN FOTOĞRAF ENDPOINTS ====================

export const uploadRestaurantPhoto = async (restaurantId, imageUri) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    });

    const response = await api.post(`/restaurants/${restaurantId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Fotoğraf yüklenemedi';
  }
};

export const getRestaurantPhotos = async (restaurantId) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/photos`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Fotoğraflar getirilemedi';
  }
};

export const deleteRestaurantPhoto = async (photoId) => {
  try {
    const response = await api.delete(`/restaurants/photos/${photoId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Fotoğraf silinemedi';
  }
};

export const setVitrinPhoto = async (photoId) => {
  try {
    const response = await api.patch(`/restaurants/photos/${photoId}/set-vitrin`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Vitrin fotoğraf işaretlenemedi';
  }
};

// ==================== TIKTOK ENDPOINTS ====================

export const getTikTokVideos = async (restorantID) => {
  try {
    const response = await api.get(`/tiktok/restaurant/${restorantID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'TikTok videoları alınamadı';
  }
};

export const getTikTokThumbnail = async (url) => {
  try {
    const response = await api.get('/tiktok/thumbnail', {
      params: { url }
    });
    return response.data;
  } catch (error) {
    console.error('Thumbnail çekilemedi:', error);
    return null;
  }
};

export const addTikTokVideo = async (videoData) => {
  try {
    const response = await api.post('/tiktok/', videoData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Video eklenemedi';
  }
};

export const deleteTikTokVideo = async (tiktokID) => {
  try {
    await api.delete(`/tiktok/${tiktokID}`);
    return true;
  } catch (error) {
    throw error.response?.data?.detail || 'Video silinemedi';
  }
};

// API_URL'i export et ki diğer dosyalarda da kullanılabilsin
export { API_URL };

export default api;
