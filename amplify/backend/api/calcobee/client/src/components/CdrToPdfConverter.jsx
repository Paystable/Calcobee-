import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Alert, 
  CircularProgress,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin // Use the same origin as the current page
  : 'http://localhost:5001';

const CdrToPdfConverter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.toLowerCase().endsWith('.cdr')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid CDR file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending request to:', `${API_BASE_URL}/api/conversion/cdr-to-pdf`);
      const response = await axios.post(
        `${API_BASE_URL}/api/conversion/cdr-to-pdf`,
        formData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
          timeout: 180000 // 3 minutes timeout
        }
      );

      // Check if the response is an error message
      if (response.headers['content-type']?.includes('application/json')) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || 'An error occurred during conversion');
            if (errorData.details) {
              console.error('Conversion error details:', errorData.details);
            }
          } catch (e) {
            setError('An error occurred during conversion');
          }
        };
        reader.readAsText(response.data);
        return;
      }

      // Create download URL for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setSuccess('File converted successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      if (error.response) {
        if (error.response.status === 413) {
          setError('File size too large. Please upload a file smaller than 10MB.');
        } else if (error.response.status === 415) {
          setError('Invalid file type. Please upload a CDR file.');
        } else if (error.response.status === 403) {
          setError('Access denied. Please try again later.');
        } else {
          setError(error.response.data?.error || 'An error occurred during conversion');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'converted.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: '600px', 
      mx: 'auto', 
      p: isMobile ? 2 : 3,
      mt: 4
    }}>
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h2" 
          gutterBottom
          align="center"
          sx={{ mb: 3 }}
        >
          CDR to PDF Converter
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2
        }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              mb: 2,
              width: isMobile ? '100%' : 'auto',
              minHeight: '48px'
            }}
          >
            Select CDR File
            <input
              type="file"
              hidden
              accept=".cdr"
              onChange={handleFileChange}
            />
          </Button>

          {file && (
            <Typography variant="body2" color="textSecondary" align="center">
              Selected file: {file.name}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            mt: 2
          }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || loading}
              sx={{ 
                flex: 1,
                minHeight: '48px'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Convert to PDF'}
            </Button>

            {downloadUrl && (
              <Button
                variant="outlined"
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
                sx={{ 
                  flex: 1,
                  minHeight: '48px'
                }}
              >
                Download PDF
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError('');
          setSuccess('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => {
            setError('');
            setSuccess('');
          }}
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CdrToPdfConverter; 