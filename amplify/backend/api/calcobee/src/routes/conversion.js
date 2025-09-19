const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Ensure the filename has a .cdr extension
    const filename = file.originalname.toLowerCase().endsWith('.cdr') 
      ? file.originalname 
      : `${file.originalname}.cdr`;
    cb(null, Date.now() + '-' + filename);
  }
});

// File filter to accept only CDR files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/x-cdr' || file.originalname.toLowerCase().endsWith('.cdr')) {
    cb(null, true);
  } else {
    cb(new Error('Only CDR files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.access('uploads');
  } catch {
    await fs.mkdir('uploads');
    console.log('Created uploads directory');
  }
};

// Check if Inkscape is installed
const checkInkscape = async () => {
  try {
    const { stdout } = await execAsync('which inkscape');
    console.log('Inkscape found at:', stdout.trim());
    return true;
  } catch (error) {
    console.error('Inkscape is not installed:', error);
    return false;
  }
};

// CDR to PDF conversion endpoint
router.post('/cdr-to-pdf', upload.single('file'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);

    // Check if Inkscape is installed
    const inkscapeInstalled = await checkInkscape();
    if (!inkscapeInstalled) {
      return res.status(500).json({ 
        error: 'CDR to PDF conversion is not available',
        details: 'Inkscape is not installed on the server. Please contact the administrator.'
      });
    }

    await ensureUploadsDir();

    inputPath = req.file.path;
    outputPath = inputPath.replace('.cdr', '.pdf');

    console.log(`Starting conversion: ${inputPath} to ${outputPath}`);

    // Use Inkscape to convert CDR to PDF
    try {
      // First, try with the standard command
      try {
        console.log('Attempting conversion with standard command');
        await execAsync(`inkscape "${inputPath}" --export-filename="${outputPath}"`);
      } catch (standardError) {
        console.error('Standard conversion failed:', standardError);
        
        // Try alternative command if standard fails
        console.log('Attempting conversion with alternative command');
        await execAsync(`inkscape --file="${inputPath}" --export-pdf="${outputPath}"`);
      }
      
      // Check if the output file exists
      try {
        await fs.access(outputPath);
        console.log('Output file created successfully');
      } catch (err) {
        console.error('Output file not found after conversion');
        throw new Error('Conversion failed: Output file was not created');
      }
      
      // Read the converted PDF
      console.log('Reading PDF file');
      const pdfBuffer = await fs.readFile(outputPath);
      console.log('PDF file read successfully, size:', pdfBuffer.length);
      
      // Clean up the files
      console.log('Cleaning up temporary files');
      await fs.unlink(inputPath).catch(err => console.error('Error deleting input file:', err));
      await fs.unlink(outputPath).catch(err => console.error('Error deleting output file:', err));
      
      // Send the PDF back to the client
      console.log('Sending PDF to client');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
      res.send(pdfBuffer);
      console.log('PDF sent successfully');
      
    } catch (conversionError) {
      console.error('Error during conversion:', conversionError);
      
      // Clean up any files that might have been created
      try {
        if (inputPath && await fs.access(inputPath).then(() => true).catch(() => false)) {
          await fs.unlink(inputPath);
          console.log('Cleaned up input file');
        }
        if (outputPath && await fs.access(outputPath).then(() => true).catch(() => false)) {
          await fs.unlink(outputPath);
          console.log('Cleaned up output file');
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      
      res.status(500).json({ 
        error: 'Error converting file to PDF',
        details: 'Please ensure the CDR file is valid and try again. If the problem persists, contact support.'
      });
    }
  } catch (error) {
    console.error('Error handling file:', error);
    
    // Clean up any files that might have been created
    try {
      if (inputPath && await fs.access(inputPath).then(() => true).catch(() => false)) {
        await fs.unlink(inputPath);
      }
      if (outputPath && await fs.access(outputPath).then(() => true).catch(() => false)) {
        await fs.unlink(outputPath);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    res.status(500).json({ 
      error: 'Error processing file',
      details: error.message
    });
  }
});

module.exports = router; 