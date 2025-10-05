// First, install multer: npm install multer

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if not exists (relative to project root)
const uploadsDir = path.join(__dirname, '../uploads/products'); // Assumes middlewares/ dir; adjust if needed
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config (local storage; for cloud like S3, use aws-sdk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (only images, with custom error)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Export for use in routes, plus uploadsDir for cleanup elsewhere
module.exports = {
  upload,
  uploadsDir
};