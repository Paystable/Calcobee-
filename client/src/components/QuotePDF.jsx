import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { generateQuoteNumber } from '../utils/quoteNumberManager';

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf" },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfCxc4AMP6lbBP.ttf", fontWeight: "bold" },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
  },
  letterhead: {
    marginBottom: 30,
    borderBottom: "2px solid #1976D2",
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "column",
    width: "60%",
    backgroundColor: "#4d89fe",
    padding: "15px",
    borderRadius: "8px",
    alignItems: "flex-start",
  },
  logo: {
    width: 220,
    height: 90,
    objectFit: "contain",
    backgroundColor: "transparent",
  },
  tagline: {
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 8,
    letterSpacing: 1.2,
    textAlign: "left",
    fontWeight: "bold",
  },
  companyInfo: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 3,
    textAlign: "right",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  label: {
    flex: 1,
    fontSize: 12,
    color: "#666666",
  },
  value: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
  },
  costBreakdown: {
    marginTop: 20,
    border: "1px solid #e0e0e0",
    borderRadius: 4,
    padding: 15,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
  },
  costLabel: {
    fontSize: 12,
    color: "#666666",
  },
  costValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #e0e0e0",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1976d2",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1976d2",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 60,
    color: "rgba(25, 118, 210, 0.1)",
    fontWeight: "bold",
  },
  buyerInfo: {
    marginBottom: 20,
    padding: 15,
    border: "1px solid #e0e0e0",
    borderRadius: 4,
  },
  buyerField: {
    marginBottom: 8,
  },
  buyerLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  buyerValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

// Create Document Component
const QuoteDocument = ({
  title,
  totalCost,
  gst,
  finalTotal,
  size,
  quantity,
  pages,
  binding,
  paperType,
  lamination,
  spotUV,
  dripOff,
  spotUVOption,
  dripOffOption,
  gsm,
  isDoubleSided,
  laminationType,
  laminationSide,
  spotUVSide,
  buyerInfo,
  quoteNumber
}) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead */}
        <View style={styles.letterhead}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              src={process.env.PUBLIC_URL + "/images/amda-prints-logo.png"}
            />
            <Text style={styles.tagline}>WE PRINT THE SOLUTIONS!</Text>
          </View>
          <View>
            <Text style={styles.companyInfo}>Sumel 11, An Indian Textile Plaza</Text>
            <Text style={styles.companyInfo}>143, BAPS Cir, nr. BAPS</Text>
            <Text style={styles.companyInfo}>Bhadreshwar Society, Shahibag</Text>
            <Text style={styles.companyInfo}>Ahmedabad, Gujarat 380004</Text>
            <Text style={styles.companyInfo}>GSTIN: 24AAGFO0792D1ZH</Text>
          </View>
        </View>

        {/* Watermark */}
        <Text style={styles.watermark}>AMDA PRINTING</Text>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Quote</Text>
            <Text style={styles.subtitle}>Quote Number: {quoteNumber}</Text>
            <Text style={styles.subtitle}>Date: {currentDate}</Text>
          </View>
        </View>

        {/* Buyer Information */}
        <View style={styles.buyerInfo}>
          <Text style={styles.sectionTitle}>Buyer Information</Text>
          <View style={styles.buyerField}>
            <Text style={styles.buyerLabel}>Name:</Text>
            <Text style={styles.buyerValue}>{buyerInfo.name}</Text>
          </View>
          <View style={styles.buyerField}>
            <Text style={styles.buyerLabel}>Address:</Text>
            <Text style={styles.buyerValue}>{buyerInfo.address}</Text>
          </View>
          <View style={styles.buyerField}>
            <Text style={styles.buyerLabel}>Mobile:</Text>
            <Text style={styles.buyerValue}>{buyerInfo.mobile}</Text>
          </View>
          <View style={styles.buyerField}>
            <Text style={styles.buyerLabel}>GSTIN:</Text>
            <Text style={styles.buyerValue}>{buyerInfo.gstin}</Text>
          </View>
        </View>

        {/* Project Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Project Type:</Text>
            <Text style={styles.value}>{title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Paper Size:</Text>
            <Text style={styles.value}>{size}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.value}>{quantity} sheets</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>GSM:</Text>
            <Text style={styles.value}>{gsm}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Paper Type:</Text>
            <Text style={styles.value}>{paperType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Printing:</Text>
            <Text style={styles.value}>{isDoubleSided ? "Double Sided" : "Single Sided"}</Text>
          </View>
        </View>

        {/* Finishing Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finishing Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Lamination:</Text>
            <Text style={styles.value}>
              {lamination ? `${laminationType} (${laminationSide})` : "None"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Spot UV:</Text>
            <Text style={styles.value}>
              {spotUV ? `${spotUVOption} Side` : "None"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Drip Off:</Text>
            <Text style={styles.value}>
              {dripOff ? `${dripOffOption}` : "None"}
            </Text>
          </View>
        </View>

        {/* Cost Breakdown */}
        <View style={styles.costBreakdown}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Base Cost:</Text>
            <Text style={styles.costValue}>₹{totalCost.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>GST ({gst * 100}%):</Text>
            <Text style={styles.costValue}>
              ₹{(finalTotal - totalCost).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing AMDA Printing</Text>
          <Text>This quote is valid for 30 days from the date of issue</Text>
          <Text>For any queries, please contact us at support@amdaprinting.com</Text>
        </View>
      </Page>
    </Document>
  );
};

// Main Component with PDF Viewer and Download Link
const QuotePDF = (props) => {
  const [quoteNumber, setQuoteNumber] = useState('');
  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    address: "",
    mobile: "",
    gstin: "",
  });

  useEffect(() => {
    // Generate a new quote number when the component mounts
    setQuoteNumber(generateQuoteNumber());
  }, []);

  const handleBuyerInfoChange = (field, value) => {
    setBuyerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Buyer Information Form */}
      <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
        <h3 style={{ marginBottom: "15px", color: "#1976d2" }}>Buyer Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#666666" }}>Name:</label>
            <input
              type="text"
              value={buyerInfo.name}
              onChange={(e) => handleBuyerInfoChange("name", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #e0e0e0",
              }}
              placeholder="Enter buyer name"
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#666666" }}>Mobile:</label>
            <input
              type="text"
              value={buyerInfo.mobile}
              onChange={(e) => handleBuyerInfoChange("mobile", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #e0e0e0",
              }}
              placeholder="Enter mobile number"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#666666" }}>Address:</label>
            <textarea
              value={buyerInfo.address}
              onChange={(e) => handleBuyerInfoChange("address", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #e0e0e0",
                minHeight: "60px",
              }}
              placeholder="Enter address"
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#666666" }}>GSTIN:</label>
            <input
              type="text"
              value={buyerInfo.gstin}
              onChange={(e) => handleBuyerInfoChange("gstin", e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #e0e0e0",
              }}
              placeholder="Enter GSTIN number"
            />
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div style={{ flex: 1, position: "relative" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <QuoteDocument {...props} buyerInfo={buyerInfo} quoteNumber={quoteNumber} />
        </PDFViewer>
        <div style={{ position: "absolute", bottom: 20, right: 20 }}>
          <PDFDownloadLink
            document={<QuoteDocument {...props} buyerInfo={buyerInfo} quoteNumber={quoteNumber} />}
            fileName={`quote-${quoteNumber}.pdf`}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {({ blob, url, loading, error }) =>
              loading ? "Loading document..." : "Download PDF"
            }
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
};

export default QuotePDF; 