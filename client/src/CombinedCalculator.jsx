import React, { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Fade } from '@mui/material';
import BookCalculator from './BookCalculator';
import BrochureCalculator from './BrochureCalculator';
import FlyerCalculator from './FlyerCalculator';
import CdrToPdfConverter from './components/CdrToPdfConverter';
import './styles/Calculator.css';
import { useConfigContext } from './ConfigContext';

function CombinedCalculator() {
  const { config } = useConfigContext();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const calculators = [
    { 
      label: "Flyer",
      description: "Create instant flyer printing quotes with our smart calculator. Generate comprehensive PDF quotes including paper options, quantities, and finishing details. Ideal for businesses, marketers, and event organizers seeking precise pricing for promotional materials.",
      component: <FlyerCalculator config={config} />
    },
    { 
      label: "Book",
      description: "Generate professional book printing quotes instantly with our advanced calculator. Export detailed PDF quotes with cost breakdowns, specifications, and finishing options. Perfect for publishers, authors, and print buyers looking for quick, accurate pricing.",
      component: <BookCalculator config={config} />
    },
    { 
      label: "Brochure",
      description: "Calculate brochure printing costs instantly with our specialized calculator. Export detailed PDF quotes with paper selections, binding options, and finishing choices. Essential for marketing teams, designers, and businesses planning promotional materials.",
      component: <BrochureCalculator config={config} />
    },
    {
      label: "CDR to PDF",
      description: "Convert your CorelDRAW (CDR) files to PDF format instantly. Upload your CDR files and download them in PDF format, ready for printing or sharing.",
      component: <CdrToPdfConverter />
    }
  ];

  return (
    <Box>
      {/* Logo Header */}
      <div className="calculator-header">
        <div className="calculator-logo-container">
          <div className="logo-wrapper">
            <img 
              src={process.env.PUBLIC_URL + "/images/amda-prints-logo.png"} 
              alt="AMDA Prints Logo" 
              className="calculator-logo"
            />
            <div className="calculator-tagline">WE PRINT THE SOLUTIONS!</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="calculator-tabs">
        <Container>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            TabIndicatorProps={{
              style: {
                backgroundColor: '#4d89fe',
                height: '3px',
                borderRadius: '3px'
              }
            }}
            sx={{
              '& .MuiTab-root': {
                color: '#666666',
                fontWeight: 500,
                fontSize: '16px',
                '&.Mui-selected': {
                  color: '#4d89fe'
                }
              }
            }}
          >
            {calculators.map((calc, index) => (
              <Tab 
                key={calc.label} 
                label={calc.label}
                aria-label={`Switch to ${calc.label} Calculator`}
              />
            ))}
          </Tabs>
        </Container>
      </div>

      {/* Calculator Content */}
      <Container className="calculator-container">
        <Fade in={true} timeout={300}>
          <div>
            <Typography variant="h4" component="h1" className="calculator-title" gutterBottom>
              {calculators[activeTab].label} Calculator
            </Typography>
            <Typography variant="body1" className="calculator-description" gutterBottom>
              {calculators[activeTab].description}
            </Typography>
            {calculators[activeTab].component}
          </div>
        </Fade>
      </Container>
    </Box>
  );
}

export default CombinedCalculator; 