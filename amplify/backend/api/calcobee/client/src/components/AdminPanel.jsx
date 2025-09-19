import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = ({ config, setConfig }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);

  // Use the same origin as the current page for API requests
  const API_BASE_URL = window.location.origin;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching config from:', `${API_BASE_URL}/api/config`);
      const response = await axios.get(`${API_BASE_URL}/api/config`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      
      if (response.data) {
        setConfig(response.data);
        setMessage('Configuration loaded successfully!');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Error fetching configuration:', error);
      
      // Check if we have a default config to use
      if (config) {
        setMessage('Using cached configuration. API is not available.');
        setMessageType('warning');
      } else {
        setMessage('Error fetching configuration. API is not available.');
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      console.log('Saving config to:', `${API_BASE_URL}/api/config`);
      const response = await axios.put(`${API_BASE_URL}/api/config`, config, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      
      if (response.data) {
        setMessage('Configuration saved successfully!');
        setMessageType('success');
        // Refresh the config after saving
        fetchConfig();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setMessage('Error saving configuration. API is not available.');
      setMessageType('error');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
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