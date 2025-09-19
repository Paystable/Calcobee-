// Get the last used quote number from localStorage or start from 0
const getLastQuoteNumber = () => {
  const lastNumber = localStorage.getItem('lastQuoteNumber');
  return lastNumber ? parseInt(lastNumber) : 0;
};

// Generate the next quote number
export const generateQuoteNumber = () => {
  const lastNumber = getLastQuoteNumber();
  const newNumber = lastNumber + 1;
  
  // Store the new number
  localStorage.setItem('lastQuoteNumber', newNumber.toString());
  
  // Format: QT-XXXXXX (6 digits, zero-padded)
  return `QT-${newNumber.toString().padStart(6, '0')}`;
};

// Reset quote number (if needed)
export const resetQuoteNumber = () => {
  localStorage.setItem('lastQuoteNumber', '0');
}; 