const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Base route for testing
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Upload endpoints are available',
    endpoints: {
      single: 'POST /api/v1/upload/single',
      multiple: 'POST /api/v1/upload/multiple',
      delete: 'DELETE /api/v1/upload/:filename'
    }
  });
});

// Multer configuration for inline image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/inline/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `inline-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed'));
    }
  },
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // Maximum 10 files at once
  },
});

// Upload single inline image
router.post('/single', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const fileUrl = `uploads/inline/${req.file.filename}`;
    
    res.status(200).json({
      url: fileUrl,
      path: fileUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message,
    });
  }
});

// Upload multiple inline images
router.post('/multiple', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    const uploadedFiles = req.files.map(file => `uploads/inline/${file.filename}`);

    res.status(200).json({
      urls: uploadedFiles,
      paths: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message,
    });
  }
});

// Delete inline image
router.delete('/:filename', (req, res) => {
  try {
    const fs = require('fs');
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/inline/', filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message,
    });
  }
});

module.exports = router;
