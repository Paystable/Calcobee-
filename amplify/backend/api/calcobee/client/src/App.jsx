import React from "react";
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminPanel from "./AdminPanel";
import CombinedCalculator from "./CombinedCalculator";
import { ConfigProvider } from "./ConfigContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfigProvider>
        <Router>
          <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
              <Routes>
                <Route path="/" element={<CombinedCalculator />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Container>
        </Router>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App; 