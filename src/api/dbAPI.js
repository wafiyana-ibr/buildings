import axios from "axios";

/**
 * User-related API functions
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const formatTag = (tag) => tag.startsWith('#') ? tag.substring(1) : tag;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Untuk JWT
  headers: {
    'Content-Type': 'application/json',
  }
});

export const userAPI = {
  signIn: async (email, password) => {
    try {
      const response = await api.post(`/users/sign-in`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  },

  signUp: async (username, email, password) => {
    try {
      const response = await api.post(`/users/sign-up`, {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  // Get user by User ID from JWT
  getUserMe: async () => {
    try {
      const response = await api.get(`/users/me`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  },

  // Add logout function
  logout: async () => {
    try {
      // Clear cookie on server
      const response = await api.post(`/users/logout`);
      return response.data;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }
};

/**
 * Base-related API functions
 */
export const baseAPI = {
  // Get all bases for a user
  getUserBaseByTag: async (userId, tag) => {
    try {
      // Remove # if present and encode the tag
      const formattedTag = formatTag(tag);
      const response = await api.get(`/bases/user/${userId}/tag/${formattedTag}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user base by tag:", error);
      throw error;
    }
  },

  getUserBases: async (userId) => {
    try {
      const response = await api.get(`/bases/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user bases:", error);
      throw error;
    }
  },

  // Get a specific base by tag
  getBase: async (baseId) => {
    try {
      // Remove # if present and encode the tag
      const response = await api.get(`/bases/${baseId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching base:", error);
      throw error;
    }
  },


  // Add a new base
  addBase: async (baseData) => {
    try {
      // Validate required fields before sending
      if (!baseData.userId) {
        throw new Error("userId is required");
      }

      // Format tag properly
      const playerTag = baseData.playerTag || baseData.tag;
      if (!playerTag) {
        throw new Error("Player tag is required");
      }

      const thLevel = baseData.thLevel || baseData.townHallLevel;
      if (!thLevel) {
        throw new Error("Town Hall level is required");
      }

      // Create a sanitized request object with only the needed fields
      const requestData = {
        userId: baseData.userId,
        playerTag: playerTag,
        name: baseData.name || 'Unnamed Base',
        thLevel: thLevel
      };

      const response = await api.post(`/bases`, requestData);
      return response.data;
    } catch (error) {
      console.error("Error adding base:", error);
      throw error;
    }
  },

  // Update an existing base
  updateBase: async (baseId, baseData) => {
    try {

      // Ensure we're sending the expected data structure
      const formattedData = {
        tag: baseData.playerTag || baseData.tag,
        name: baseData.name || 'Unnamed Base',
        thLevel: baseData.thLevel || baseData.townHallLevel || 1
      };


      const response = await api.put(`/bases/${baseId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error("Error updating base:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  },

  // Delete a base
  deleteBase: async (baseId, userId) => {
    try {
      const response = await api.delete(`bases/${baseId}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting base:", error);
      throw error;
    }
  },

  // Find or create/update a base (convenience method)
  findOrSaveBase: async (userId, playerData) => {
    try {
      // Get user's bases
      const bases = await baseAPI.getUserBases(userId);

      // Check if this base already exists
      const existingBase = bases.find(base =>
        base.wafi_tag === playerData.tag
      );

      if (existingBase) {
        // Update existing base
        const updatedBase = await baseAPI.updateBase(existingBase.wafi_id, {
          playerTag: playerData.tag,
          name: playerData.name || 'Unnamed Base',
          thLevel: playerData.townHallLevel || 1
        });
        return { ...existingBase, ...updatedBase };
      } else {
        // Create new base with validated parameters
        return await baseAPI.addBase({
          userId: userId,
          playerTag: playerData.tag,
          name: playerData.name || 'Unnamed Base',
          thLevel: playerData.townHallLevel || 1
        });
      }
    } catch (error) {
      console.error("Error finding or saving base:", error);
      throw error;
    }
  }
};

export const objectAPI = {
  getObject: async (baseId) => {
    try {
      const response = await api.get(`/objects/${baseId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching objects:", error);
      throw error;
    }
  },

  updateObjectLevel: async (objectId, level) => {
    try {
      const response = await api.put(`/objects/${objectId}/level`, { level });
      return response.data;
    } catch (error) {
      console.error("Error updating object level:", error);
      throw error;
    }
  },

  // Add new function for handling scan results
  createOrUpdateObjects: async (baseId, buildings) => {
    try {
      const response = await api.post(`/objects/scan/${baseId}`, { buildings });
      return response.data;
    } catch (error) {
      console.error("Error creating/updating objects from scan:", error);
      throw error;
    }
  },

  // Delete an object from the database
  deleteObject: async (objectId) => {
    try {
      const response = await api.delete(`/objects/${objectId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting object:", error);
      throw error;
    }
  },

  initObject: async (baseId, buildings) => {
    try {
      // Fix the request structure to match what the server expects
      const response = await api.post(`/objects/init/${baseId}`, { buildings });
      return response.data;
    } catch (error) {
      console.error("Error initializing objects:", error);
      throw error;
    }
  }
};