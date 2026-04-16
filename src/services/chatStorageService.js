import axios from "axios";
import { API } from "../types";
import { getUserData } from "../userStore/userData";
import { getDeviceFingerprint } from "../utils/fingerprint";

const API_BASE_URL = API;

// --- IndexedDB for "Unlimited" Storage ---
const DB_NAME = 'AIChatStorage';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

const getDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const idbGet = (key) => new Promise((resolve, reject) => {
  getDB().then(db => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
});

const idbSet = (key, value) => {
  return getDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
};

const idbDel = (key) => {
  return getDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
};

const idbGetAllKeys = () => new Promise((resolve, reject) => {
  getDB().then(db => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
});

// Helper for authorized/anonymous requests
const getAuthHeaders = () => {
  const token = getUserData()?.token || localStorage.getItem("token");
  const headers = {
    'X-Device-Fingerprint': getDeviceFingerprint()
  };
  if (token && token !== 'undefined' && token !== 'null') {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// --- Service ---

export const chatStorageService = {

  async getSessions(projectId) {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      const response = await axios.get(`${API_BASE_URL}/chat`, {
        params,
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("Backend sessions fetch failed, using local:", error);
      const sessions = [];
      const keys = await idbGetAllKeys();

      for (const key of keys) {
        if (key.startsWith("chat_meta_")) {
          const sessionId = key.replace("chat_meta_", "");
          const meta = await idbGet(key) || {};
          sessions.push({
            sessionId,
            title: meta.title || "New Chat",
            lastModified: meta.lastModified || Date.now(),
          });
        }
      }
      return sessions.sort((a, b) => b.lastModified - a.lastModified);
    }
  },

  async getHistory(sessionId) {
    if (sessionId === "new") return { messages: [] };
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${sessionId}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      console.log(`[STORAGE] Fetched data for ${sessionId}:`, response.data);
      return response.data; // Return full session object
    } catch (error) {
      console.warn("Backend history fetch failed, using local:", error);
      const local = await idbGet(`chat_history_${sessionId}`);
      const meta = await idbGet(`chat_meta_${sessionId}`) || {};
      return { 
        messages: local || [],
        projectId: meta.projectId || null,
        title: meta.title || "New Chat"
      };
    }
  },

  async saveMessage(sessionId, message, title, projectId = null) {
    // 1. Always save to Local (IndexedDB) for instant UI updates & offline backup
    try {
      const historyKey = `chat_history_${sessionId}`;
      const metaKey = `chat_meta_${sessionId}`;

      const messages = (await idbGet(historyKey)) || [];
      const existingIndex = messages.findIndex(m => m.id === message.id);

      if (existingIndex !== -1) {
        messages[existingIndex] = message; // Update
      } else {
        messages.push(message); // Insert
      }

      await idbSet(historyKey, messages);

      const existingMeta = (await idbGet(metaKey)) || {};
      const meta = {
        title: title || existingMeta.title || "New Chat",
        lastModified: Date.now(),
        projectId: projectId || message.projectId || existingMeta.projectId || null
      };
      await idbSet(metaKey, meta);
    } catch (localErr) {
      console.error("Local save failed:", localErr);
    }

    // 2. Sync with Backend
    try {
      const finalProjectId = projectId || message.projectId;
      await axios.post(`${API_BASE_URL}/chat/${sessionId}/message`, { message, title, projectId: finalProjectId }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
    } catch (error) {
      console.warn("Backend save failed:", error.response?.data || error.message);
      if (error.response?.data?.error === "LIMIT_REACHED") {
        throw error; // Re-throw to handle in UI
      }
    }
  },

  async deleteSession(sessionId) {
    try {
      await axios.delete(`${API_BASE_URL}/chat/${sessionId}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
    } catch (error) {
      await idbDel(`chat_history_${sessionId}`);
      await idbDel(`chat_meta_${sessionId}`);
    }
  },

  async deleteMessage(sessionId, messageId) {
    try {
      await axios.delete(`${API_BASE_URL}/chat/${sessionId}/message/${messageId}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
    } catch (e) {
      console.warn("Backend delete failed, converting to local update");
    }

    const historyKey = `chat_history_${sessionId}`;
    const messages = (await idbGet(historyKey)) || [];
    const filtered = messages.filter(m => m.id !== messageId);
    await idbSet(historyKey, filtered);
  },

  async updateMessage(sessionId, updatedMsg, projectId = null) {
    // 1. Update Local (IndexedDB)
    try {
      const historyKey = `chat_history_${sessionId}`;
      const messages = (await idbGet(historyKey)) || [];
      const index = messages.findIndex(m => m.id === updatedMsg.id);
      if (index !== -1) {
        messages[index] = updatedMsg;
        await idbSet(historyKey, messages);
      }
    } catch (localErr) {
      console.error("Local message update failed:", localErr);
    }

    // 2. Sync with Backend (using the same upsert endpoint)
    try {
      const finalProjectId = projectId || updatedMsg.projectId;
      await axios.post(`${API_BASE_URL}/chat/${sessionId}/message`, { 
        message: updatedMsg, 
        projectId: finalProjectId 
      }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
    } catch (error) {
      console.warn("Backend message update failed:", error.response?.data || error.message);
    }
  },

  async createSession() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  async updateSessionTitle(sessionId, title) {
    // 1. Update Local (IndexedDB)
    try {
      const metaKey = `chat_meta_${sessionId}`;
      const existingMeta = (await idbGet(metaKey)) || {};
      const meta = {
        ...existingMeta,
        title: title,
        lastModified: Date.now(),
      };
      await idbSet(metaKey, meta);
    } catch (localErr) {
      console.error("Local title update failed:", localErr);
    }

    // 2. Update Backend
    try {
      await axios.patch(`${API_BASE_URL}/chat/${sessionId}/title`, { title }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return true;
    } catch (error) {
      console.error("Backend title update failed:", error.response?.data || error.message);
      return false;
    }
  },

  async generateSessionTitle(sessionId, message) {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/${sessionId}/generate-title`, { message }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return response.data.title;
    } catch (error) {
       console.error("Concurrent title generation failed:", error);
       return null;
    }
  },

  async shareSession(sessionId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/${sessionId}/share`, {}, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return response.data; // { success: true, shareId: '...' }
    } catch (error) {
      console.error("Failed to share session:", error);
      throw error;
    }
  },

  async getSharedSession(shareId) {
    try {
      // Note: Backend is now configured to handle /api/public/share/:shareId
      const response = await axios.get(`${API_BASE_URL}/public/share/${shareId}`);
      return response.data; // { title, messages, lastModified, detectedMode }
    } catch (error) {
      console.error("Failed to fetch shared session:", error);
      throw error;
    }
  },

  async duplicateSharedSession(shareId, userId = null) {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/duplicate`, { shareId, userId });
      return response.data; // { success, sessionId }
    } catch (error) {
      console.error("Failed to duplicate shared session:", error);
      throw error;
    }
  }
};

