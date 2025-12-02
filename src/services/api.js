// src/services/api.js
import axios from 'axios';

// Base API URL - adjust according to your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if it's an auth endpoint
    // This prevents redirecting when other endpoints fail
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/') || 
                            error.config?.url?.includes('/profile');
      
      if (isAuthEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== USER DASHBOARD APIs ====================

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
  const response = await api.patch('/auth/update-profile', profileData);
  return response.data;
};


/**
 * Get user statistics
 */
export const getUserStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

/**
 * Get user notifications
 */
export const getUserNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};


/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  const response = await api.put(`/notifications/mark-all-read`); // Assuming you map this endpoint in your backend router
  return response.data;
};


export const clearAllNotifications=async()=>{
  const response = await api.delete(`/notifications/`);
  return response.data;
}
/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

// ==================== COMMUNITY APIs ====================

/**
 * Get user's communities (My Communities)
 */
export const getMyCommunities = async () => {
  const response = await api.get('/communities/my-communities');
  return response.data;
};

/**
 * Get popular communities (newest)
 */
export const getPopularCommunities = async (limit = 10) => {
  const response = await api.get(`/communities/popular?limit=${limit}`);
  return response.data;
};

/**
 * Get recommended communities based on user interests
 */
export const getRecommendedCommunities = async () => {
  const response = await api.get('/communities/recommended');
  return response.data;
};

/**
 * Create a new community with cover image
 */
export const createCommunity = async (communityData) => {
  const formData = new FormData();
  formData.append('name', communityData.name);
  formData.append('description', communityData.description);
  
  // Handle categories - ensure it's sent as an array or comma-separated
  if (Array.isArray(communityData.categories)) {
    communityData.categories.forEach(cat => {
      formData.append('categories[]', cat);
    });
  } else {
    formData.append('categories', communityData.categories);
  }
  
  // Append cover image file if exists
  if (communityData.coverFile) {
    formData.append('coverImage', communityData.coverFile);
  }

  const response = await api.post('/communities/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get community information by ID or slug
 */
export const getCommunityInfo = async (idOrSlug) => {
  const response = await api.get(`/communities/${idOrSlug}`);
  return response.data;
};

/**
 * Get all discussions in a community
 */
export const getCommunityDiscussions = async (idOrSlug, page = 1, limit = 10) => {
  const response = await api.get(`/communities/${idOrSlug}/discussions?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Invite a user to a community by email
 */
export const inviteMember = async (communityId, invitedUserEmail) => {
  const response = await api.post(`/communities/${communityId}/invite`, { 
    email: invitedUserEmail 
  });
  return response.data;
};


/**
 * Join a community
 */
export const joinCommunity = async (idOrSlug) => {
  const response = await api.post(`/communities/${idOrSlug}/join`);
  return response.data;
};

export const leaveCommunity = async (idOrSlug) => {
  const response = await api.post(`/communities/${idOrSlug}/leave`);
  return response.data;
};

export const getDiscoverableCommunities = async(userId)=>{
  const response = await api.get(`/communities/discover/${userId}`)
  return response.data;
}

// ==================== POST/DISCUSSION APIs ====================

/**
 * Get all posts for a community
 */
export const getCommunityPostsAPI = async (communityId, page = 1, limit = 20) => {
  const response = await api.get(`/posts/community/${communityId}?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Create a new post (handles file uploads)
 * @param {FormData} formData - Must be FormData containing 'content', 'communityId', and optional 'file'
 */
export const createPostAPI = async (formData) => {
  const response = await api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Toggle upvote/like on a post
 */
export const togglePostVoteAPI = async (postId) => {
  const response = await api.put(`/posts/${postId}/vote`);
  return response.data;
};


export const createCommentAPI = async (postId, data) => {
    try {
        const response = await api.post(`/posts/${postId}/reply`, data);
        return response.data;
    } catch (error) {
        console.error('Create comment API error:', error);
        throw error;
    }
};
/**
 * Search user's communities
 */
// export const searchUserCommunities = async (query) => {
//   const response = await api.get(`/communities/search?q=${query}`);
//   return response.data;
// };

export default api;