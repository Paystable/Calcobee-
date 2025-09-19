import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchConfig as fetchConfigApi, updateConfig as updateConfigApi, syncBufferWithApi } from './utils/api';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Try to sync buffer with API when coming back online
      syncBufferWithApi();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch config from backend
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchConfigApi();
      setConfig(data);
    } catch (err) {
      // Silently handle error - config will be loaded from buffer
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, fetch config
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Update config and refetch
  const saveConfig = async (newConfig) => {
    setLoading(true);
    try {
      const updatedConfig = await updateConfigApi(newConfig);
      setConfig(updatedConfig);
    } catch (err) {
      // Silently handle error - config will be saved to buffer
      setConfig(newConfig);
    } finally {
      setLoading(false);
    }
  };

  // Ensure the context hook throws an error if used outside of a ConfigProvider
  if (!ConfigContext) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }

  return (
    <ConfigContext.Provider value={{ 
      config, 
      setConfig: saveConfig, 
      loading, 
      refetch: fetchConfig,
      isOnline 
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
} 