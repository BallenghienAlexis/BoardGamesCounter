import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback in-memory storage for development/errors
const memoryStorage: Record<string, string> = {};

/**
 * Safe storage service that handles AsyncStorage errors gracefully
 * Falls back to in-memory storage if AsyncStorage fails
 */
class StorageService {
  private useMemoryFallback = false;

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.useMemoryFallback) {
        return memoryStorage[key] || null;
      }
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.warn(`[StorageService] Failed to get item "${key}":`, error);
      this.useMemoryFallback = true;
      return memoryStorage[key] || null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.useMemoryFallback) {
        memoryStorage[key] = value;
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[StorageService] Failed to set item "${key}":`, error);
      this.useMemoryFallback = true;
      memoryStorage[key] = value;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.useMemoryFallback) {
        delete memoryStorage[key];
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`[StorageService] Failed to remove item "${key}":`, error);
      this.useMemoryFallback = true;
      delete memoryStorage[key];
    }
  }

   async getAllKeys(): Promise<string[]> {
     try {
       if (this.useMemoryFallback) {
         return Object.keys(memoryStorage);
       }
       const keys = await AsyncStorage.getAllKeys();
       return [...keys];
     } catch (error) {
       console.warn('[StorageService] Failed to get all keys:', error);
       this.useMemoryFallback = true;
       return Object.keys(memoryStorage);
     }
   }

  async clear(): Promise<void> {
    try {
      if (this.useMemoryFallback) {
        Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
        return;
      }
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('[StorageService] Failed to clear storage:', error);
      this.useMemoryFallback = true;
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    }
  }
}

export const storageService = new StorageService();

