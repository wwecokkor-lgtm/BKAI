// ================================================================
// 🖥️ NODE.JS STORAGE SERVER (Use this for the 100GB Requirement)
// ================================================================
// This code is meant to be run on a VPS/Dedicated Server to handle
// large file storage if you wish to bypass Firebase Storage costs.

/*
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = 4000;
const MAX_STORAGE_LIMIT = 100 * 1024 * 1024 * 1024; // 100 GB

// Middleware
app.use(cors());
app.use(express.json());

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'local-storage', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed'));
  }
});

// Check Total Storage Usage Middleware
const checkStorageQuota = (req, res, next) => {
  const directoryPath = path.join(__dirname, 'local-storage');
  
  // Recursive function to get folder size
  const getAllFiles = (dirPath, arrayOfFiles) => {
    files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        arrayOfFiles.push(path.join(dirPath, "/", file))
      }
    })
    return arrayOfFiles
  }

  try {
    const files = getAllFiles(directoryPath);
    let totalSize = 0;
    files.forEach(filePath => {
      totalSize += fs.statSync(filePath).size;
    });

    if (totalSize >= MAX_STORAGE_LIMIT) {
      return res.status(507).json({ error: 'Server Storage Full (100GB Limit Reached)' });
    }
    next();
  } catch (err) {
    // If folder doesn't exist yet, proceed
    next();
  }
};

// Routes
app.post('/upload', checkStorageQuota, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Serve Static Files
app.use('/uploads', express.static(path.join(__dirname, 'local-storage', 'uploads')));

app.listen(PORT, () => {
  console.log(`Storage Server running on port ${PORT}`);
  console.log(`Storage Limit: 100GB`);
});
*/

export const SERVER_INFO = "This file contains the Node.js server code for local storage.";