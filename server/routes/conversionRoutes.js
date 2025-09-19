const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/x-coreldraw' || 
        file.originalname.toLowerCase().endsWith('.cdr')) {
      cb(null, true);
    } else {
      cb(new Error('Only CDR files are allowed'));
    }
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Conversion service is running' });
});

// CDR to PDF conversion endpoint
router.post('/cdr-to-pdf', upload.single('file'), async (req, res) => {
  let inputFile = null;
  let outputFile = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    inputFile = req.file.path;
    outputFile = inputFile.replace('.cdr', '.pdf');
    
    // Set timeout to 3 minutes
    const timeout = 180000;

    // Check if LibreOffice is installed
    try {
      await execPromise('soffice --version', { timeout: 5000 });
    } catch (error) {
      return res.status(500).json({
        error: 'Conversion service unavailable',
        message: 'LibreOffice is not installed on the server'
      });
    }

    // Convert CDR to PDF using LibreOffice
    const command = `soffice --headless --convert-to pdf --outdir "${path.dirname(outputFile)}" "${inputFile}"`;
    
    try {
      await execPromise(command, { timeout });
      
      // Check if conversion was successful
      if (await fs.pathExists(outputFile)) {
        // Read the converted file
        const pdfBuffer = await fs.readFile(outputFile);
        
        // Clean up files
        await fs.remove(inputFile);
        await fs.remove(outputFile);
        
        // Send the converted file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
        res.send(pdfBuffer);
      } else {
        throw new Error('Conversion failed - output file not created');
      }
    } catch (error) {
      // Handle timeout and other conversion errors
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return res.status(504).json({
          error: 'Conversion timeout',
          message: 'The conversion process took too long. Please try with a smaller file or contact support.'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Conversion error:', error);
    
    // Clean up any temporary files
    try {
      if (inputFile && await fs.pathExists(inputFile)) {
        await fs.remove(inputFile);
      }
      if (outputFile && await fs.pathExists(outputFile)) {
        await fs.remove(outputFile);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message || 'An error occurred during conversion',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 