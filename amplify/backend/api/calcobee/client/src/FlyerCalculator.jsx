import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Grid,
  useTheme,
  Divider,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Calculate as CalculateIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import QuotePDF from './components/QuotePDF';
import './styles/QuotePDF.css';
import './styles/Calculator.css';
import axios from 'axios';

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

const ResultCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%)",
  borderRadius: "12px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(25, 118, 210, 0.15)",
  },
}));

// Paper size options
const paperSizes = [
  { value: "A2", label: "A2 (420 x 594 mm)" },
  { value: "A3", label: "A3 (297 x 420 mm)" },
  { value: "A4", label: "A4 (210 x 297 mm)" },
  { value: "A5", label: "A5 (148 x 210 mm)" },
  { value: "A6", label: "A6 (105 x 148 mm)" },
  { value: "17x22", label: "17 x 22 inches" },
  { value: "11x17", label: "11 x 17 inches" },
  { value: "11x8.5", label: "11 x 8.5 inches" },
  { value: "5.5x8.5", label: "5.5 x 8.5 inches" },
  { value: "5.5x4.23", label: "5.5 x 4.23 inches" },
  { value: "B3", label: "B3 (353 x 500 mm)" },
  { value: "B4", label: "B4 (250 x 353 mm)" },
  { value: "B5", label: "B5 (176 x 250 mm)" },
  { value: "B6", label: "B6 (125 x 176 mm)" },
  { value: "B7", label: "B7 (88 x 125 mm)" }
];

export default function FlyerCalculator({ config, onSuccess = () => {}, onError = () => {} }) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [gsm, setGsm] = useState(130);
  const [selectedSize, setSelectedSize] = useState("A4");
  const [totalSheets, setTotalSheets] = useState(1000);
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  const [isLamination, setIsLamination] = useState(false);
  const [laminationType, setLaminationType] = useState("Gloss BOPP");
  const [laminationSide, setLaminationSide] = useState("single");
  const [spotUV, setSpotUV] = useState(false);
  const [spotUVSide, setSpotUVSide] = useState("single");
  const [result, setResult] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Constants & references
  const sheetsPerLargeSheet = {
    A2: 1,
    A3: 2,
    A4: 4,
    A5: 8,
    A6: 16,
    "17x22": 1,
    "11x17": 2,
    "11x8.5": 4,
    "5.5x8.5": 8,
    "5.5x4.23": 16,
  };

  const laminationRates = config?.laminationRates || {
    "Gloss BOPP": 1.8,
    "Matt BOPP": 1.8,
    "Gloss Thermal": 3.2,
    "Matt Thermal": 3.2,
    "Velvet": 11.25,
  };

  const minimumRates = config?.minimumLaminationCosts || {
    "BOPP": 600,
    "Thermal": 700,
    "Velvet": 700,
  };

  const printingFixedCost = config?.plateCost4C || 2000;
  const printingCostPer1000 = config?.printingCostPer1000_4C || 300;
  const spotUVRateVal = config?.spotUVRate || 2.5;
  const spotUVMinimum = config?.spotUVMinimum || 3500;

  // Calculate paper cost
  const calculatePaperCost = (size, gsm, sheets) => {
    return ((sheets * gsm * 0.4572 * 0.635) / 1000) * (config?.paperRate || 100);
  };

  // Calculate printing cost
  const calcPrintingCost = (sheets, isDoubleSided) => {
    const printingSheets = isDoubleSided ? sheets * 2 : sheets;
    let printingVariable = 0;
    if (printingSheets > 1000) {
      const blocksNeeded = Math.ceil((printingSheets - 1000) / 1000);
      printingVariable = blocksNeeded * printingCostPer1000;
    }
    return printingFixedCost + printingVariable;
  };

  // Calculate spot UV cost
  function calculateSpotUvCost(spotUV, sheets, isDoubleSided) {
    if (!spotUV) return 0;
    const spotUVSheets = spotUVSide === "double" ? sheets * 2 : sheets;
    return Math.max(spotUVSheets * spotUVRateVal, spotUVMinimum);
  }

  // Calculate lamination cost
  const calculateLaminationCost = (laminationType, sheets, isDoubleSided) => {
    if (laminationType === "None") return 0;

    const baseRate = laminationRates[laminationType] || 0;
    const lamSheets = laminationSide === "double" ? sheets * 2 : sheets;
    let tempLaminationCost = baseRate * lamSheets;

    let key = "";
    if (laminationType.includes("BOPP")) key = "BOPP";
    else if (laminationType.includes("Thermal")) key = "Thermal";
    else if (laminationType.includes("Velvet")) key = "Velvet";

    tempLaminationCost = Math.max(tempLaminationCost, minimumRates[key]);
    return tempLaminationCost;
  };

  const calculateTotalCost = async () => {
    setIsLoading(true);
    try {
      if (!selectedSize || !gsm || !totalSheets) {
        onError("Please fill in all required fields");
        return;
      }

      const sps = sheetsPerLargeSheet[selectedSize] || 1;
      const effectiveSheets = totalSheets / sps;
      const printingSheets = isDoubleSided ? effectiveSheets * 2 : effectiveSheets;

      // Calculate paper cost
      const paperCost = calculatePaperCost(selectedSize, gsm, effectiveSheets);

      // Calculate printing cost
      const printingCost = calcPrintingCost(effectiveSheets, isDoubleSided);

      // Calculate lamination cost
      const laminationCost = isLamination
        ? calculateLaminationCost(laminationType, effectiveSheets, isDoubleSided)
        : 0;

      // Calculate spot UV cost
      const spotUVCost = calculateSpotUvCost(spotUV, effectiveSheets, isDoubleSided);

      // Calculate total cost
      const totalCostBeforeGST = paperCost + printingCost + laminationCost + spotUVCost;
      const gst = totalCostBeforeGST * 0.18;
      const totalCostWithGST = totalCostBeforeGST + gst;

      setResult({
        effectiveSheets,
        printingSheets,
        paperCost,
        printingCost,
        laminationCost,
        spotUVCost,
        totalCostBeforeGST,
        gst,
        totalCostWithGST,
      });

      onSuccess();
    } catch (error) {
      onError("Error calculating costs: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="calculator-container">
      {mounted ? (
        <Fade in={true} timeout={500}>
          <Box>
            <div className="calculator-header">
              <img 
                src="/images/amda-prints-logo.png" 
                alt="AMDA Prints Logo" 
                className="calculator-logo"
              />
              <div className="calculator-tagline">WE PRINT THE SOLUTIONS!</div>
            </div>
            <StyledPaper elevation={0} sx={{ p: 3, borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 500 }}>Paper Size</InputLabel>
                    <Select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      label="Paper Size"
                      sx={{ 
                        cursor: "pointer",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      {paperSizes.map((size) => (
                        <MenuItem key={size.value} value={size.value}>
                          {size.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={totalSheets}
                    onChange={(e) => setTotalSheets(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ 
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.1)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 500 }}>GSM</InputLabel>
                    <Select
                      value={gsm}
                      onChange={(e) => setGsm(Number(e.target.value))}
                      label="GSM"
                      sx={{ 
                        cursor: "pointer",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      {[60, 70, 80, 90, 100, 130, 170, 210, 250, 300, 350, 400].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 500 }}>Double Sided</InputLabel>
                    <Select
                      value={isDoubleSided ? "yes" : "no"}
                      onChange={(e) => setIsDoubleSided(e.target.value === "yes")}
                      label="Double Sided"
                      sx={{ 
                        cursor: "pointer",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 500 }}>Lamination</InputLabel>
                    <Select
                      value={isLamination ? "yes" : "no"}
                      onChange={(e) => setIsLamination(e.target.value === "yes")}
                      label="Lamination"
                      sx={{ 
                        cursor: "pointer",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 500 }}>Lamination Type</InputLabel>
                    <Select
                      value={laminationType}
                      onChange={(e) => setLaminationType(e.target.value)}
                      label="Lamination Type"
                      disabled={!isLamination}
                      sx={{ 
                        cursor: isLamination ? "pointer" : "not-allowed",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      {Object.keys(laminationRates).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 500 }}>Lamination Side</InputLabel>
                    <Select
                      value={laminationSide}
                      onChange={(e) => setLaminationSide(e.target.value)}
                      label="Lamination Side"
                      disabled={!isLamination}
                      sx={{ 
                        cursor: isLamination ? "pointer" : "not-allowed",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <MenuItem value="single">Single Side</MenuItem>
                      <MenuItem value="double">Double Side</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 500 }}>Spot UV</InputLabel>
                    <Select
                      value={spotUV ? "yes" : "no"}
                      onChange={(e) => setSpotUV(e.target.value === "yes")}
                      label="Spot UV"
                      sx={{ 
                        cursor: "pointer",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 500 }}>Spot UV Side</InputLabel>
                    <Select
                      value={spotUVSide}
                      onChange={(e) => setSpotUVSide(e.target.value)}
                      label="Spot UV Side"
                      disabled={!spotUV}
                      sx={{ 
                        cursor: spotUV ? "pointer" : "not-allowed",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <MenuItem value="single">Single Side</MenuItem>
                      <MenuItem value="double">Double Side</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center", mt: 2 }}>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      onClick={calculateTotalCost}
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
                      sx={{
                        borderRadius: "12px",
                        padding: "12px 24px",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                        "&:hover": {
                          boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                        },
                      }}
                    >
                      {isLoading ? "Calculating..." : "Calculate Cost"}
                    </StyledButton>
                    <Tooltip title="Save Calculation">
                      <IconButton 
                        color="primary" 
                        disabled={!result}
                        sx={{
                          backgroundColor: "rgba(25, 118, 210, 0.1)",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.2)",
                          },
                        }}
                      >
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print Quote">
                      <IconButton 
                        color="primary" 
                        disabled={!result}
                        sx={{
                          backgroundColor: "rgba(25, 118, 210, 0.1)",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.2)",
                          },
                        }}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
                {result && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 3, borderColor: "rgba(0, 0, 0, 0.1)" }} />
                    <ResultCard elevation={0} sx={{ 
                      p: 3, 
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%)",
                      boxShadow: "0 8px 24px rgba(25, 118, 210, 0.15)",
                    }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          Cost Summary
                        </Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                          ₹{result.totalCostWithGST.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}>
                          Cost Breakdown
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={8}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>Paper Cost:</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1" align="right" sx={{ fontWeight: 500 }}>₹{result.paperCost.toFixed(2)}</Typography>
                          </Grid>
                          {isLamination && (
                            <>
                              <Grid item xs={8}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>Lamination Cost:</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="body1" align="right" sx={{ fontWeight: 500 }}>₹{result.laminationCost.toFixed(2)}</Typography>
                              </Grid>
                            </>
                          )}
                          {spotUV && (
                            <>
                              <Grid item xs={8}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>Spot UV Cost:</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="body1" align="right" sx={{ fontWeight: 500 }}>₹{result.spotUVCost.toFixed(2)}</Typography>
                              </Grid>
                            </>
                          )}
                          <Grid item xs={8}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>Printing Cost:</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1" align="right" sx={{ fontWeight: 500 }}>₹{result.printingCost.toFixed(2)}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2, borderColor: "rgba(0, 0, 0, 0.1)" }} />
                          </Grid>
                          <Grid item xs={8}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>Subtotal:</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1" align="right" sx={{ fontWeight: 600 }}>₹{result.totalCostBeforeGST.toFixed(2)}</Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>GST (18%):</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1" align="right" sx={{ fontWeight: 500 }}>₹{result.gst.toFixed(2)}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2, borderColor: "rgba(0, 0, 0, 0.1)" }} />
                          </Grid>
                          <Grid item xs={8}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "primary.main" }}>Total (with GST):</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1" align="right" sx={{ fontWeight: 700, color: "primary.main" }}>₹{result.totalCostWithGST.toFixed(2)}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </ResultCard>
                  </Grid>
                )}
              </Grid>
            </StyledPaper>
          </Box>
        </Fade>
      ) : null}
      {result && mounted ? (
        <Fade in={true} timeout={500}>
          <Box sx={{ mt: 3 }}>
            <QuotePDF
              title="Flyer"
              totalCost={result.totalCostWithGST}
              gst={0.18}
              finalTotal={result.totalCostWithGST}
              size={selectedSize}
              quantity={totalSheets}
              pages={1}
              binding="None"
              paperType={`${gsm}gsm`}
              lamination={isLamination}
              spotUV={spotUV}
              dripOff={spotUV}
              spotUVOption={spotUVSide}
              dripOffOption="None"
              gsm={gsm}
              isDoubleSided={isDoubleSided}
              laminationType={laminationType}
              laminationSide={laminationSide}
              spotUVSide={spotUVSide}
            />
          </Box>
        </Fade>
      ) : null}
    </div>
  );
}
