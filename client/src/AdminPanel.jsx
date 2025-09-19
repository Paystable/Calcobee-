import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Tooltip,
  Paper,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { updateConfig, fetchConfig } from './utils/api';
import { useConfigContext } from './ConfigContext';

/**
 * AdminPanel receives `config` + `setConfig`.
 * We copy the parent's config into localConfig so we can
 * edit fields before saving. Once the user clicks "Save",
 * we do a PUT to the server and call setConfig(localConfig)
 * to let the rest of the app see the changes.
 */

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: "12px",
  textTransform: "none",
  fontSize: "1.1rem",
  fontWeight: 600,
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  },
  "&.Mui-disabled": {
    transform: "none",
    boxShadow: "none",
  },
}));

const ConfigCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%)",
  borderRadius: "12px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(25, 118, 210, 0.15)",
  },
}));

export default function AdminPanel() {
  const { config, setConfig, loading, error, refetch } = useConfigContext();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    // Paper rates
    paperRate: config?.paperRate || 100,
    
    // Printing rates
    plateCost4C: config?.plateCost4C || 2000,
    newSizePlateCost4C: config?.newSizePlateCost4C || 2500,
    plateCost1C: config?.plateCost1C || 1000,
    newSizePlateCost1C: config?.newSizePlateCost1C || 1500,
    printingCostPer1000_4C: config?.printingCostPer1000_4C || 300,
    printingCostPer1000_1C: config?.printingCostPer1000_1C || 150,
    newSizePlateCostPer1000_4C: config?.newSizePlateCostPer1000_4C || 350,
    newSizeCostPer1000_1C: config?.newSizeCostPer1000_1C || 180,
    
    // Lamination rates
    laminationRates: config?.laminationRates || {
      "None": 0,
      "Gloss BOPP": 1.8,
      "Matt BOPP": 1.8,
      "Gloss Thermal": 3.2,
      "Matt Thermal": 3.2,
      "Velvet": 11.25,
    },
    newSizeLaminationRates: config?.newSizeLaminationRates || {
      "None": 0,
      "Gloss BOPP": 2.5,
      "Matt BOPP": 2.5,
      "Gloss Thermal": 4.5,
      "Matt Thermal": 4.5,
      "Velvet": 18,
    },
    minimumLaminationCosts: config?.minimumLaminationCosts || {
      "BOPP": 600,
      "Thermal": 700,
      "Velvet": 700,
    },
    
    // Finishing rates
    spotUVRate: config?.spotUVRate || 2.5,
    spotUVMinimum: config?.spotUVMinimum || 3500,
    dripOffRate: config?.dripOffRate || 2.5,
    dripOffMinimum: config?.dripOffMinimum || 4500,
    coatingRate: config?.coatingRate || 1.2,
    coatingMinimum: config?.coatingMinimum || 500,
    
    // Binding rates
    bindingRates: config?.bindingRates || {
      "none": 0,
      "staple": 2,
      "spiral": 15,
      "wiro": 15,
      "perfect": 25,
    },
  });

  // Update form data when config changes
  useEffect(() => {
    if (config) {
      setFormData({
        paperRate: config.paperRate || 100,
        plateCost4C: config.plateCost4C || 2000,
        newSizePlateCost4C: config.newSizePlateCost4C || 2500,
        plateCost1C: config.plateCost1C || 1000,
        newSizePlateCost1C: config.newSizePlateCost1C || 1500,
        printingCostPer1000_4C: config.printingCostPer1000_4C || 300,
        printingCostPer1000_1C: config.printingCostPer1000_1C || 150,
        newSizePlateCostPer1000_4C: config.newSizePlateCostPer1000_4C || 350,
        newSizeCostPer1000_1C: config.newSizeCostPer1000_1C || 180,
        laminationRates: config.laminationRates || {
          "None": 0,
          "Gloss BOPP": 1.8,
          "Matt BOPP": 1.8,
          "Gloss Thermal": 3.2,
          "Matt Thermal": 3.2,
          "Velvet": 11.25,
        },
        newSizeLaminationRates: config.newSizeLaminationRates || {
          "None": 0,
          "Gloss BOPP": 2.5,
          "Matt BOPP": 2.5,
          "Gloss Thermal": 4.5,
          "Matt Thermal": 4.5,
          "Velvet": 18,
        },
        minimumLaminationCosts: config.minimumLaminationCosts || {
          "BOPP": 600,
          "Thermal": 700,
          "Velvet": 700,
        },
        spotUVRate: config.spotUVRate || 2.5,
        spotUVMinimum: config.spotUVMinimum || 3500,
        dripOffRate: config.dripOffRate || 2.5,
        dripOffMinimum: config.dripOffMinimum || 4500,
        coatingRate: config.coatingRate || 1.2,
        coatingMinimum: config.coatingMinimum || 500,
        bindingRates: config.bindingRates || {
          "none": 0,
          "staple": 2,
          "spiral": 15,
          "wiro": 15,
          "perfect": 25,
        },
      });
    }
  }, [config]);

  const handleChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleLaminationRateChange = (type) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setFormData({
      ...formData,
      laminationRates: {
        ...formData.laminationRates,
        [type]: value,
      },
    });
  };

  const handleNewSizeLaminationRateChange = (type) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setFormData({
      ...formData,
      newSizeLaminationRates: {
        ...formData.newSizeLaminationRates,
        [type]: value,
      },
    });
  };

  const handleMinimumCostChange = (type) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setFormData({
      ...formData,
      minimumLaminationCosts: {
        ...formData.minimumLaminationCosts,
        [type]: value,
      },
    });
  };

  const handleBindingRateChange = (type) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setFormData({
      ...formData,
      bindingRates: {
        ...formData.bindingRates,
        [type]: value,
      },
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (apiAvailable) {
        // If API is available, update the server
        const updatedConfig = await updateConfig(formData);
        setConfig(updatedConfig);
        setShowSuccess(true);
        setShowError(false);
        setErrorMessage("");
      } else {
        // If API is not available, just update the local state
        setConfig(formData);
        setShowSuccess(true);
        setShowError(false);
        setErrorMessage("");
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setShowError(true);
      setErrorMessage(error.message || 'Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      paperRate: config?.paperRate || 100,
      plateCost4C: config?.plateCost4C || 2000,
      newSizePlateCost4C: config?.newSizePlateCost4C || 2500,
      plateCost1C: config?.plateCost1C || 1000,
      newSizePlateCost1C: config?.newSizePlateCost1C || 1500,
      printingCostPer1000_4C: config?.printingCostPer1000_4C || 300,
      printingCostPer1000_1C: config?.printingCostPer1000_1C || 150,
      newSizePlateCostPer1000_4C: config?.newSizePlateCostPer1000_4C || 350,
      newSizeCostPer1000_1C: config?.newSizeCostPer1000_1C || 180,
      laminationRates: config?.laminationRates || {
        "None": 0,
        "Gloss BOPP": 1.8,
        "Matt BOPP": 1.8,
        "Gloss Thermal": 3.2,
        "Matt Thermal": 3.2,
        "Velvet": 11.25,
      },
      newSizeLaminationRates: config?.newSizeLaminationRates || {
        "None": 0,
        "Gloss BOPP": 2.5,
        "Matt BOPP": 2.5,
        "Gloss Thermal": 4.5,
        "Matt Thermal": 4.5,
        "Velvet": 18,
      },
      minimumLaminationCosts: config?.minimumLaminationCosts || {
        "BOPP": 600,
        "Thermal": 700,
        "Velvet": 700,
      },
      spotUVRate: config?.spotUVRate || 2.5,
      spotUVMinimum: config?.spotUVMinimum || 3500,
      dripOffRate: config?.dripOffRate || 2.5,
      dripOffMinimum: config?.dripOffMinimum || 4500,
      coatingRate: config?.coatingRate || 1.2,
      coatingMinimum: config?.coatingMinimum || 500,
      bindingRates: config?.bindingRates || {
        "none": 0,
        "staple": 2,
        "spiral": 15,
        "wiro": 15,
        "perfect": 25,
      },
    });
  };

  // Add error handling for initial config load
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await fetchConfig();
        setConfig(data);
        setApiAvailable(true);
        setShowError(false);
        setErrorMessage("");
      } catch (error) {
        console.error('Error loading configuration:', error);
        setShowError(true);
        setErrorMessage(error.message || 'Failed to load configuration. Please try again.');
        setApiAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Add a retry function
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const data = await fetchConfig();
      setConfig(data);
      setApiAvailable(true);
      setShowError(false);
      setErrorMessage("");
    } catch (error) {
      console.error('Error loading configuration:', error);
      setShowError(true);
      setErrorMessage(error.message || 'Failed to load configuration. Please try again.');
      setApiAvailable(false);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {!apiAvailable && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetry}
              disabled={isRetrying}
              startIcon={isRetrying ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
          }
        >
          <Typography variant="body1">
            <strong>Using cached configuration.</strong> API is not available. 
            Changes will be saved locally but won't be synchronized with the server.
          </Typography>
        </Alert>
      )}

      <StyledPaper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Panel
          </Typography>
          <Box>
            <StyledButton
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={isLoading}
              startIcon={<SaveIcon />}
              sx={{ mr: 2 }}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </StyledButton>
            <StyledButton
              variant="outlined"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
            >
              Reset
            </StyledButton>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Paper & Printing" />
          <Tab label="Lamination" />
          <Tab label="Finishing" />
          <Tab label="Binding" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  Paper Rates
                </Typography>
                <TextField
                  fullWidth
                  label="Paper Rate"
                  type="number"
                  value={formData.paperRate}
                  onChange={handleChange('paperRate')}
                  sx={{ mb: 2 }}
                />
              </ConfigCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  Printing Rates
                </Typography>
                <TextField
                  fullWidth
                  label="4 Color Plate Cost"
                  type="number"
                  value={formData.plateCost4C}
                  onChange={handleChange('plateCost4C')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="New Size 4 Color Plate Cost"
                  type="number"
                  value={formData.newSizePlateCost4C}
                  onChange={handleChange('newSizePlateCost4C')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="1 Color Plate Cost"
                  type="number"
                  value={formData.plateCost1C}
                  onChange={handleChange('plateCost1C')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="New Size 1 Color Plate Cost"
                  type="number"
                  value={formData.newSizePlateCost1C}
                  onChange={handleChange('newSizePlateCost1C')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="4 Color Printing Cost per 1000"
                  type="number"
                  value={formData.printingCostPer1000_4C}
                  onChange={handleChange('printingCostPer1000_4C')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="1 Color Printing Cost per 1000"
                  type="number"
                  value={formData.printingCostPer1000_1C}
                  onChange={handleChange('printingCostPer1000_1C')}
                />
                <TextField
                  fullWidth
                  label="New Size 4 Color Plate Cost per 1000"
                  type="number"
                  value={formData.newSizePlateCostPer1000_4C}
                  onChange={handleChange('newSizePlateCostPer1000_4C')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="New Size 1 Color Cost per 1000"
                  type="number"
                  value={formData.newSizeCostPer1000_1C}
                  onChange={handleChange('newSizeCostPer1000_1C')}
                  sx={{ mb: 2 }}
                />
              </ConfigCard>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  Standard Lamination Rates
                </Typography>
                {Object.entries(formData.laminationRates).map(([type, rate]) => (
                  <TextField
                    key={type}
                    fullWidth
                    label={`${type} Rate`}
                    type="number"
                    value={rate}
                    onChange={handleLaminationRateChange(type)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </ConfigCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  New Size Lamination Rates
                </Typography>
                {Object.entries(formData.newSizeLaminationRates).map(([type, rate]) => (
                  <TextField
                    key={type}
                    fullWidth
                    label={`${type} Rate`}
                    type="number"
                    value={rate}
                    onChange={handleNewSizeLaminationRateChange(type)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </ConfigCard>
            </Grid>
            <Grid item xs={12}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  Minimum Lamination Costs
                </Typography>
                {Object.entries(formData.minimumLaminationCosts).map(([type, cost]) => (
                  <TextField
                    key={type}
                    fullWidth
                    label={`${type} Minimum Cost`}
                    type="number"
                    value={cost}
                    onChange={handleMinimumCostChange(type)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </ConfigCard>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  Spot UV Rates
                </Typography>
                <TextField
                  fullWidth
                  label="Spot UV Rate"
                  type="number"
                  value={formData.spotUVRate}
                  onChange={handleChange('spotUVRate')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Spot UV Minimum Cost"
                  type="number"
                  value={formData.spotUVMinimum}
                  onChange={handleChange('spotUVMinimum')}
                />
              </ConfigCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  Drip Off Rates
                </Typography>
                <TextField
                  fullWidth
                  label="Drip Off Rate"
                  type="number"
                  value={formData.dripOffRate}
                  onChange={handleChange('dripOffRate')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Drip Off Minimum Cost"
                  type="number"
                  value={formData.dripOffMinimum}
                  onChange={handleChange('dripOffMinimum')}
                />
              </ConfigCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  Coating Rates
                </Typography>
                <TextField
                  fullWidth
                  label="Coating Rate"
                  type="number"
                  value={formData.coatingRate}
                  onChange={handleChange('coatingRate')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Coating Minimum Cost"
                  type="number"
                  value={formData.coatingMinimum}
                  onChange={handleChange('coatingMinimum')}
                />
              </ConfigCard>
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ConfigCard>
                <Typography variant="h6" gutterBottom>
                  Binding Rates
                </Typography>
                {Object.entries(formData.bindingRates).map(([type, rate]) => (
                  <TextField
                    key={type}
                    fullWidth
                    label={`${type} Rate`}
                    type="number"
                    value={rate}
                    onChange={handleBindingRateChange(type)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </ConfigCard>
            </Grid>
          </Grid>
        )}
      </StyledPaper>

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          {apiAvailable 
            ? "Configuration saved successfully to the server!" 
            : "Configuration saved locally. Changes will not be synchronized with the server."}
        </Alert>
      </Snackbar>
    </Box>
  );
}
