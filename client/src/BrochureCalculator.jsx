/* ----------------------------------------------------------------------
   3) BROCHURE CALCULATOR (Detailed Calculation Logic)
---------------------------------------------------------------------- */
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
import axios from "axios";

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

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
}));

export default function BrochureCalculator({ config, onSuccess = () => {}, onError = () => {} }) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState("A4");
  const [quantity, setQuantity] = useState(1000);
  const [totalPages, setTotalPages] = useState("8");
  const [coverGSM, setCoverGSM] = useState("300");
  const [insideGSM, setInsideGSM] = useState("300");
  const [coverLaminationType, setCoverLaminationType] = useState("None");
  const [insideLaminationType, setInsideLaminationType] = useState("None");
  const [spotUVOption, setSpotUVOption] = useState("None");
  const [coatingOption, setCoatingOption] = useState("None");
  const [dripOffOption, setDripOffOption] = useState("None");
  const [bindingType, setBindingType] = useState("none");
  const [result, setResult] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [plateCount, setPlateCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle A2 size restrictions
  useEffect(() => {
    if (selectedSize === "A2") {
      setCoverLaminationType("None");
      setInsideLaminationType("None");
      setSpotUVOption("None");
      setCoatingOption("None");
      setDripOffOption("None");
    }
  }, [selectedSize]);

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

  const paperSizeRates = {
    A3: 1.0,
    A4: 1.0,
    A5: 1.0,
    A6: 1.0,
    "11x8.5": 1.0,
    "5.5x8.5": 1.0,
    "5.5x4.23": 1.0,
    "B3": 1.0,
    "B4": 1.0,
    "B5": 1.0,
    "B6": 1.0,
    "B7": 1.0,
  };

  const paperSizes = [
    { value: "A3", label: "A3" },
    { value: "A4", label: "A4" },
    { value: "A5", label: "A5" },
    { value: "A6", label: "A6" },
    { value: "11x8.5", label: "11x8.5" },
    { value: "5.5x8.5", label: "5.5x8.5" },
    { value: "5.5x4.23", label: "5.5x4.23" },
    { value: "B3", label: "B3 (13.9 × 19.7)" },
    { value: "B4", label: "B4 (9.8 × 13.9)" },
    { value: "B5", label: "B5 (6.9 × 9.8)" },
    { value: "B6", label: "B6 (4.9 × 6.9)" },
    { value: "B7", label: "B7 (3.5 × 4.9)" },
  ];

  const newPaperSizes = [
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
  ];

  const specialPaperSizes = [
    "11x8.5",
    "5.5x8.5",
    "5.5x4.23",
  ];

  // Add missing constants
  const multiPageOptions = [
    { value: "4", label: "4 Pages" },
    { value: "8", label: "8 Pages" },
    { value: "12", label: "12 Pages" },
    { value: "16", label: "16 Pages" },
    { value: "20", label: "20 Pages" },
    { value: "24", label: "24 Pages" },
    { value: "32", label: "32 Pages" },
    { value: "40", label: "40 Pages" },
    { value: "48", label: "48 Pages" },
    { value: "60", label: "60 Pages" },
    { value: "64", label: "64 Pages" },
    { value: "72", label: "72 Pages" },
    { value: "80", label: "80 Pages" },
    { value: "100", label: "100 Pages" },
  ];

  const coverGSMOptions = [
    { value: '300', label: '300 GSM' },
    { value: '350', label: '350 GSM' },
    { value: '400', label: '400 GSM' }
  ];

  const insideGSMOptions = [
    { value: '70', label: '70 GSM' },
    { value: '80', label: '80 GSM' },
    { value: '100', label: '100 GSM' },
    { value: '120', label: '120 GSM' },
    { value: '150', label: '150 GSM' },
    { value: '170', label: '170 GSM' },
    { value: '200', label: '200 GSM' },
    { value: '250', label: '250 GSM' },
    { value: '300', label: '300 GSM' }
  ];

  const bindingOptions = [
    { value: "none", label: "No Binding" },
    { value: "staple", label: "Staple / Saddle Stitch" },
    { value: "spiral", label: "Spiral Binding" },
    { value: "wiro", label: "Wiro Binding" },
    { value: "perfect", label: "Perfect Binding" },
  ];

  // Use config values directly and consistently
  const laminationRates = config?.laminationRates || {
    "None": 0,
    "Gloss BOPP": 1.8,
    "Matt BOPP": 1.8,
    "Gloss Thermal": 3.2,
    "Matt Thermal": 3.2,
    "Velvet": 11.25,
  };
  const newSizeLaminationRates = config?.newSizeLaminationRates || {
    "None": 0,
    "Gloss BOPP": 2.5,
    "Matt BOPP": 2.5,
    "Gloss Thermal": 4.5,
    "Matt Thermal": 4.5,
    "Velvet": 18,
  };
  const minimumRates = config?.minimumLaminationCosts || {
    "BOPP": 600,
    "Thermal": 700,
    "Velvet": 700,
  };
  const plateCost4C = config?.plateCost4C || 2000;
  const plateCost1C = config?.plateCost1C || 1000;
  const printingCostPer1000_4C = config?.printingCostPer1000_4C || 300;
  const printingCostPer1000_1C = config?.printingCostPer1000_1C || 150;
  const spotUVRateVal = config?.spotUVRate || 2.5;
  const spotUVMinimum = config?.spotUVMinimum || 3500;
  const dripOffRateVal = config?.dripOffRate || 2.5;
  const dripOffFixedPerPlate = config?.dripOffMinimum || 4500;
  const coatingRate = config?.coatingRate || 1.2;
  const coatingMinimum = config?.coatingMinimum || 500;

  const calcPrintingCost = (sheets, isDoubleSided) => {
    const printingSheets = isDoubleSided ? sheets * 2 : sheets;
    const plateCost = config?.plateCost4C || 2000;
    const costPer1000 = config?.printingCostPer1000_4C || 300;
    
    // Calculate variable cost based on number of blocks needed
    let printingVariable = 0;
    if (printingSheets > 1000) {
      const blocksNeeded = Math.ceil((printingSheets - 1000) / 1000);
      printingVariable = blocksNeeded * costPer1000;
    }

    return plateCost + printingVariable;
  };

  // Calculate lamination cost
  function calculateLaminationCost(laminationType, sheets, isDoubleSided) {
    if (!laminationType || laminationType === "None" || !sheets) return 0;
    
    // Get lamination rates from config with proper structure
    const isNewSize = newPaperSizes.includes(selectedSize);
    const baseRate = isNewSize 
      ? config?.newSizeLaminationRates?.[laminationType] || 0
      : config?.laminationRates?.[laminationType] || 0;
    
    if (!baseRate) return 0;

    const laminationSheets = isDoubleSided ? sheets * 2 : sheets;
    return laminationSheets * baseRate;
  }

  const calculateBindingCost = (binding, pages, size) => {
    let cost = 0;
    switch (binding) {
      case "staple":
        // Up to 20 pages => cost is ₹2
        // Above 20 pages => add ₹0.10 per page over 20
        cost = pages <= 20 ? 2 : 2 + (pages - 20) * 0.1;
        break;

      case "spiral":
        // Flat cost of ₹15 (no additional logic)
        cost = 15;
        break;

      case "wiro":
        // Flat cost of ₹15 (same logic as spiral)
        cost = 15;
        break;

      case "perfect":
        // Up to 50 pages => ₹6
        // Above 50 pages => additional ₹0.50 for each block of 8 pages
        cost = pages <= 50 
          ? 6 
          : 6 + Math.ceil((pages - 50) / 8) * 0.5;
        break;

      case "hardcover":
        // If pages <= 100:
        //   A4 => ₹30
        //   A5 => ₹45
        // Otherwise => same or fallback to ₹30 if not A5
        cost = pages <= 100
          ? (size === "A4" 
              ? 30 
              : size === "A5" 
                ? 45 
                : 30)
          : (size === "A5" 
              ? 45 
              : 30);
        break;

      default:
        // No binding selected
        cost = 0;
    }
    return cost;
  };

  // Add new validation for staple binding
  function canUseStaple(gsmVal, pageVal) {
    return !(gsmVal >= 300 && pageVal > 32);
  }

  const showStapleHiddenAlert = (() => {
    const gsmNum = parseInt(insideGSM, 10) || 80;
    const pagesNum = parseInt(totalPages, 10) || 8;
    return gsmNum >= 300 && pagesNum > 32;
  })();

  const filteredBindingOptions = bindingOptions.filter((option) => {
    if (option.value === "staple") {
      const gsmNum = parseInt(insideGSM, 10) || 80;
      const pagesNum = parseInt(totalPages, 10) || 8;
      if (!canUseStaple(gsmNum, pagesNum)) {
        return false;
      }
    }
    return true;
  });

  // Updated Spot UV calculation
  function calculateSpotUvCost(spotUV, sheets, isDoubleSided) {
    if (!spotUV) return 0;
    const spotUVSheets = isDoubleSided ? sheets * 2 : sheets;
    const rate = config?.spotUVRate || 2.5;
    const minimum = config?.spotUVMinimum || 3500;
    return Math.max(spotUVSheets * rate, minimum);
  }

  // Updated DripOff calculation
  function calculateDripOffCost(option, totalPages, coverSheets, insideSheets) {
    if (option === "None") return 0;
    const doPages = option === "Only Cover" ? coverPages : totalPages;
    const doSheets = option === "Only Cover" ? coverSheets : coverSheets + insideSheets;
    const platesNeeded = Math.ceil(doPages / 4);
    let totalDoCost = 0;
    let leftover = doPages;
    
    for (let i = 0; i < platesNeeded; i++) {
      const pagesThisPlate = leftover >= 4 ? 4 : leftover;
      leftover -= pagesThisPlate;
      const fraction = pagesThisPlate / doPages;
      const doSheetsThisPlate = fraction * doSheets;
      const variableCost = dripOffRateVal * doSheetsThisPlate;
      const costForPlate = Math.max(dripOffFixedPerPlate, variableCost);
      totalDoCost += costForPlate;
    }
    return totalDoCost;
  }

  // Calculate number of plates needed based on paper size
  const calculatePlatesNeeded = () => {
    // Each plate can hold different number of pages based on paper size
    const pagesPerPlate = {
      "A3": 2,  // 2 pages per plate (1 sheet front and back)
      "A4": 4,  // 4 pages per plate (2 sheets front and back)
      "A5": 8,  // 8 pages per plate (4 sheets front and back)
      "A6": 16, // 16 pages per plate (8 sheets front and back)
      "11x8.5": 4,
      "5.5x8.5": 8,
      "5.5x4.23": 16,
      "B3": 2,
      "B4": 4,
      "B5": 8,
      "B6": 16,
      "B7": 32
    };

    const pages = parseInt(totalPages);
    const maxPagesPerPlate = pagesPerPlate[selectedSize] || 4; // Default to 4 if size not found
    return Math.ceil(pages / maxPagesPerPlate);
  };

  // Calculate fixed cost (plate cost)
  const calculateFixedCost = () => {
    const platesNeeded = calculatePlatesNeeded();
    setPlateCount(platesNeeded);
    return platesNeeded * plateCost4C;
  };

  const calculateCost = async () => {
    setIsLoading(true);
    try {
      const pgs = parseInt(totalPages, 10) || 0;
      const coverPages = 4; // Cover always has 4 pages
      const insidePages = Math.max(pgs - coverPages, 0);

      const factor = sheetsPerLargeSheet[selectedSize] || 4;
      const coverPlates = Math.ceil(coverPages / factor);
      const insidePlates = Math.ceil(insidePages / factor);

      const sps = sheetsPerLargeSheet[selectedSize] || 1;
      const coverEffectiveSheets = (coverPages / 2) * (quantity / sps);
      const insideEffectiveSheets = (insidePages / 2) * (quantity / sps);
      
      // Calculate total sheets needed
      const sheets = Math.ceil(quantity / sps);

      console.log('Brochure Calculator - Initial Values:', {
        totalPages: pgs,
        coverPages,
        insidePages,
        factor,
        coverPlates,
        insidePlates,
        sps,
        coverEffectiveSheets,
        insideEffectiveSheets,
        sheets,
        quantity,
        selectedSize
      });

      // Cover printing - always 4C
      const coverPrintingCost = calcPrintingCost(
        coverPlates,
        coverEffectiveSheets,
        plateCost4C,
        printingCostPer1000_4C
      );

      console.log('Brochure Calculator - Cover Printing:', {
        coverEffectiveSheets,
        coverPrintingCost,
        coverPlates,
        plateCost: plateCost4C,
        costPer1000: printingCostPer1000_4C
      });

      // Inside printing - always 4C
      let insidePrintingCost = 0;
      if (insidePages > 0) {
        insidePrintingCost = calcPrintingCost(
          insidePlates,
          insideEffectiveSheets,
          plateCost4C,
          printingCostPer1000_4C
        );
      }

      console.log('Brochure Calculator - Inside Printing:', {
        insidePages,
        insideEffectiveSheets,
        insidePrintingCost,
        insidePlates,
        plateCost: plateCost4C,
        costPer1000: printingCostPer1000_4C
      });

      const printingCost = coverPrintingCost + insidePrintingCost;
      console.log('Brochure Calculator - Total Printing Cost:', printingCost);

      // Calculate paper cost
      const numericCoverGsm = parseInt(coverGSM, 10) || 130;
      const numericInsideGsm = parseInt(insideGSM, 10) || 80;
      const dimensionFactor = newPaperSizes.includes(selectedSize) ? 0.20 : 0.29;

      const coverRate =
        (((coverPages / 2) * quantity) / sps) *
        numericCoverGsm *
        dimensionFactor /
        1000 *
        config?.paperRate;

      const insideRateSheets = (insidePages / 2) * (quantity / sps);
      const insideRate =
        (insideRateSheets * numericInsideGsm * dimensionFactor) / 1000 *
        config?.paperRate;

      const paperCost = coverRate + insideRate;

      // Calculate binding cost
      let bindingCost = 0;
      if (bindingType !== "none") {
        const baseRate = calculateBindingCost(bindingType, pgs, selectedSize);
        // For A4 size, use full quantity. For other sizes, use sheets
        const sheetsForBinding = selectedSize === "A4" ? quantity : sheets;
        bindingCost = baseRate * sheetsForBinding;
        console.log('Binding Cost Calculation:', {
          bindingType,
          pages: pgs,
          size: selectedSize,
          baseRate,
          sheetsForBinding,
          totalBindingCost: bindingCost
        });
      }

      // Calculate coating cost
      let coatingSheets = 0;
      if (coatingOption !== "None") {
        if (coatingOption === "Cover Only") {
          coatingSheets = coverEffectiveSheets * 2; // Multiply by 2 for both sides
        } else {
          coatingSheets = (coverEffectiveSheets + insideEffectiveSheets) * 2; // Multiply by 2 for both sides
        }
      }
      let coatingCost = 0;
      if (coatingSheets > 0) {
        const tempCoatingCost = coatingSheets * coatingRate;
        coatingCost = Math.max(tempCoatingCost, coatingMinimum);
      }

      // Calculate cover lamination cost
      let coverLaminationCost = 0;
      if (coverLaminationType !== "None") {
        coverLaminationCost = calculateLaminationCost(coverLaminationType, sheets, sheets);
      }

      // Calculate inside lamination cost
      let insideLaminationCost = 0;
      if (insideLaminationType !== "None") {
        insideLaminationCost = calculateLaminationCost(insideLaminationType, sheets, sheets);
      }

      // Total lamination cost
      const laminationCost = coverLaminationCost + insideLaminationCost;

      // Calculate spot UV cost
      let spotUVCost = 0;
      if (spotUVOption !== "None") {
        spotUVCost = calculateSpotUvCost(spotUVOption, sheets, sheets);
      }

      // Calculate drip off cost
      const dripOffCost = calculateDripOffCost(dripOffOption, pgs, sheets, sheets);

      // Calculate total cost
      const totalCost = paperCost + printingCost + bindingCost + laminationCost + spotUVCost + dripOffCost + coatingCost;

      // Add 18% GST
      const totalCostWithGST = totalCost * 1.18;

      setResult({
        paperCost,
        printingCost,
        bindingCost,
        laminationCost,
        spotUVCost,
        dripOffCost,
        coatingCost,
        totalCost,
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
              <div className="calculator-logo-container">
                <img 
                  src={process.env.PUBLIC_URL + "/images/amda-prints-logo.png"}
                  alt="AMDA Prints Logo" 
                  className="calculator-logo"
                />
              </div>
              <div className="calculator-tagline">WE PRINT THE SOLUTIONS!</div>
            </div>
            <StyledPaper elevation={0} sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Paper Size</InputLabel>
                    <StyledSelect
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      label="Paper Size"
                    >
                      {paperSizes.map((size) => (
                        <MenuItem key={size.value} value={size.value}>
                          {size.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                    {selectedSize === "A2" && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        A2 size requires a separate plate for each side. Lamination, spot UV, coating, and drip-off options are not available.
                      </Typography>
                    )}
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Total Pages</InputLabel>
                    <StyledSelect
                      value={totalPages}
                      onChange={(e) => setTotalPages(e.target.value)}
                      label="Total Pages"
                    >
                      {multiPageOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Cover GSM</InputLabel>
                    <StyledSelect
                      value={coverGSM}
                      onChange={(e) => setCoverGSM(e.target.value)}
                      label="Cover GSM"
                    >
                      {coverGSMOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Inside GSM</InputLabel>
                    <StyledSelect
                      value={insideGSM}
                      onChange={(e) => setInsideGSM(e.target.value)}
                      label="Inside GSM"
                    >
                      {insideGSMOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Cover Lamination</InputLabel>
                    <StyledSelect
                      value={coverLaminationType}
                      onChange={(e) => setCoverLaminationType(e.target.value)}
                      label="Cover Lamination"
                      disabled={selectedSize === "A2"}
                      sx={{ 
                        cursor: selectedSize === "A2" ? "not-allowed" : "pointer",
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
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Inside Lamination</InputLabel>
                    <StyledSelect
                      value={insideLaminationType}
                      onChange={(e) => setInsideLaminationType(e.target.value)}
                      label="Inside Lamination"
                      disabled={selectedSize === "A2"}
                      sx={{ 
                        cursor: selectedSize === "A2" ? "not-allowed" : "pointer",
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
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Spot UV</InputLabel>
                    <StyledSelect
                      value={spotUVOption}
                      onChange={(e) => setSpotUVOption(e.target.value)}
                      label="Spot UV"
                      disabled={selectedSize === "A2"}
                      sx={{ 
                        cursor: selectedSize === "A2" ? "not-allowed" : "pointer",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <MenuItem value="None">None</MenuItem>
                      <MenuItem value="Cover Only">Cover Only</MenuItem>
                      <MenuItem value="Full Book">Full Book</MenuItem>
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Coating</InputLabel>
                    <StyledSelect
                      value={coatingOption}
                      onChange={(e) => setCoatingOption(e.target.value)}
                      label="Coating"
                      disabled={selectedSize === "A2"}
                      sx={{ 
                        cursor: selectedSize === "A2" ? "not-allowed" : "pointer",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <MenuItem value="None">None</MenuItem>
                      <MenuItem value="Gloss">Gloss</MenuItem>
                      <MenuItem value="Matt">Matt</MenuItem>
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Drip Off</InputLabel>
                    <StyledSelect
                      value={dripOffOption}
                      onChange={(e) => setDripOffOption(e.target.value)}
                      label="Drip Off"
                      disabled={selectedSize === "A2"}
                      sx={{ 
                        cursor: selectedSize === "A2" ? "not-allowed" : "pointer",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <MenuItem value="None">None</MenuItem>
                      <MenuItem value="Cover Only">Cover Only</MenuItem>
                      <MenuItem value="Full Book">Full Book</MenuItem>
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Binding Type</InputLabel>
                    <StyledSelect
                      value={bindingType}
                      onChange={(e) => setBindingType(e.target.value)}
                      label="Binding Type"
                    >
                      {filteredBindingOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ 
                    display: "flex", 
                    gap: 2, 
                    alignItems: "center", 
                    mt: 2,
                    justifyContent: "center" 
                  }}>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      onClick={calculateCost}
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
                    >
                      {isLoading ? "Calculating..." : "Calculate Cost"}
                    </StyledButton>
                    <Tooltip title="Save Calculation">
                      <span>
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
                      </span>
                    </Tooltip>
                    <Tooltip title="Print Quote">
                      <span>
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
                      </span>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>

              {result && (
                <Zoom in={true} timeout={500}>
                  <ResultCard elevation={0} sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: 600 }}>
                      Cost Breakdown
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant="body2">Paper Cost:</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" align="right">₹{result.paperCost.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">Printing Cost:</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" align="right">₹{result.printingCost.toFixed(2)}</Typography>
                      </Grid>
                      {bindingType !== "none" && result.bindingCost !== undefined && (
                        <>
                          <Grid item xs={8}>
                            <Typography variant="body2">Binding Cost:</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" align="right">₹{result.bindingCost.toFixed(2)}</Typography>
                          </Grid>
                        </>
                      )}
                      {(coverLaminationType !== "None" || insideLaminationType !== "None") && result.laminationCost !== undefined && (
                        <>
                          <Grid item xs={8}>
                            <Typography variant="body2">Lamination Cost:</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" align="right">₹{result.laminationCost.toFixed(2)}</Typography>
                          </Grid>
                        </>
                      )}
                      {spotUVOption !== "None" && result.spotUVCost !== undefined && (
                        <>
                          <Grid item xs={8}>
                            <Typography variant="body2">Spot UV Cost:</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" align="right">₹{result.spotUVCost.toFixed(2)}</Typography>
                          </Grid>
                        </>
                      )}
                      {dripOffOption !== "None" && result.dripOffCost !== undefined && (
                        <>
                          <Grid item xs={8}>
                            <Typography variant="body2">Drip Off Cost:</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" align="right">₹{result.dripOffCost.toFixed(2)}</Typography>
                          </Grid>
                        </>
                      )}
                      {coatingOption !== "None" && result.coatingCost !== undefined && (
                        <>
                          <Grid item xs={8}>
                            <Typography variant="body2">Coating Cost:</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" align="right">₹{result.coatingCost.toFixed(2)}</Typography>
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total Cost:</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1" align="right" sx={{ fontWeight: 600 }}>₹{result.totalCost.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1976d2" }}>Total Cost (with GST):</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1" align="right" sx={{ fontWeight: 600, color: "#1976d2" }}>₹{result.totalCostWithGST.toFixed(2)}</Typography>
                      </Grid>
                    </Grid>
                  </ResultCard>
                </Zoom>
              )}
            </StyledPaper>
          </Box>
        </Fade>
      ) : null}
      {result && mounted ? (
        <Fade in={true} timeout={500}>
          <Box sx={{ mt: 3 }}>
            <QuotePDF
              title="Brochure"
              totalCost={result.totalCost}
              gst={0.18}
              finalTotal={result.totalCostWithGST}
              size={selectedSize}
              quantity={quantity}
              pages={totalPages}
              binding={bindingType}
              paperType={`${coverGSM}gsm (Cover), ${insideGSM}gsm (Inside)`}
              lamination={coverLaminationType !== "None" || insideLaminationType !== "None"}
              spotUV={spotUVOption !== "None"}
              dripOff={dripOffOption !== "None"}
              spotUVOption={spotUVOption}
              dripOffOption={dripOffOption}
              gsm={`${coverGSM}/${insideGSM}`}
              isDoubleSided={true}
              laminationType={`${coverLaminationType} (Cover), ${insideLaminationType} (Inside)`}
              laminationSide="double"
              spotUVSide="double"
            />
          </Box>
        </Fade>
      ) : null}
    </div>
  );
}
