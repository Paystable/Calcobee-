import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchConfig as fetchConfigApi, updateConfig as updateConfigApi } from './utils/api';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch config from backend
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchConfigApi();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err);
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
      setConfig(updatedConfig); // Use the config returned by backend
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig: saveConfig, loading, error, refetch: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfigContext() {
  return useContext(ConfigContext);
} 