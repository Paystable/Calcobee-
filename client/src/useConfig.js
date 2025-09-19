import { useState, useEffect } from 'react';

export default function useConfig(interval = 30000) {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async (retryCount = 0) => {
      try {
        // Use the same origin as the current page for API requests
        const API_BASE_URL = process.env.NODE_ENV === 'production' 
          ? `${window.location.origin}/admin`
          : window.location.origin;
        console.log('Fetching config from:', `${API_BASE_URL}/api/config`);
        const res = await fetch(`${API_BASE_URL}/api/config`);
        const data = await res.json();
        
        if (res.ok) {
          console.log('Config fetched successfully:', data);
          setConfig(data);
          setError(null);
        } else {
          console.error('Failed to fetch config:', data);
          setError(data);
          
          // Retry on error with exponential backoff
          if (retryCount < 3) {
            const backoffDelay = Math.pow(2, retryCount) * 1000;
            setTimeout(() => fetchConfig(retryCount + 1), backoffDelay);
          }
        }
      } catch (err) {
        console.error('Error fetching config:', err);
        setError(err);
        
        // Retry on error with exponential backoff
        if (retryCount < 3) {
          const backoffDelay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => fetchConfig(retryCount + 1), backoffDelay);
        }
      }
    };

    // Initial fetch
    fetchConfig();

    // Set up polling interval
    const intervalId = setInterval(() => fetchConfig(), interval);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [interval]);

  return { config, error };
}
