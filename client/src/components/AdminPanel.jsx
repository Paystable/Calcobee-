import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfigContext } from '../ConfigContext';

const AdminPanel = ({ config, setConfig }) => {
  const { isOnline } = useConfigContext();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);

  // Use the same origin as the current page for API requests
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? `${window.location.origin}/admin`
    : window.location.origin;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      // Silently handle error - config will be loaded from buffer
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/config`, config, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      
      if (response.data) {
        // Refresh the config after saving
        fetchConfig();
      }
    } catch (error) {
      // Silently handle error - config will be saved to buffer
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="status-bar" style={{ 
        padding: '8px', 
        marginBottom: '16px',
        backgroundColor: isOnline ? '#e6ffe6' : '#ffe6e6',
        color: isOnline ? '#006600' : '#cc0000',
        borderRadius: '4px'
      }}>
        Status: {isOnline ? 'Online' : 'Offline'}
        {!isOnline && ' - Changes will be saved locally and synced when online'}
      </div>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      <div className="config-form">
        {isLoading ? (
          <p>Loading configuration...</p>
        ) : (
          <>
            {/* Add your form fields here, excluding paperRate */}
            <button onClick={saveConfig}>Save Configuration</button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 