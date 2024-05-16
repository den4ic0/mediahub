const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const fileExistenceCache = {};

const uploadPath = process.env.UPLOAD_PATH || 'uploads';
const port = process.env.PORT || 3000;

function logActivity(activity) {
  console.log(`${new Date().toISOString()} - ${activity}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logActivity(`Destination set for file upload: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    logActivity(`Generating filename for upload: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.use('/media', express.static(uploadPath));

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    logActivity(`File uploaded: ${req.file.filename}`);
    fileExistenceCache[req.file.filename] = true;
    return res.json({
      message: 'File uploaded successfully',
      fileInfo: req.file
    });
  }
  
  logActivity('Upload attempt with no file');
  res.status(400).send('No file uploaded');
});

app.get('/file-info', (req, res) => {
  const fileName = req.query.filename;
  const filePath = path.join(uploadPath, fileName);

  if (fileExistenceCache[fileName] !== undefined) {
    if (fileExistenceCache[fileName]) {
      logActivity(`File info accessed from cache: ${fileName}`);
      return res.json({
        message: 'File exists',
        filename: fileName,
        url: `${req.protocol}://${req.get('host')}/media/${fileName}`
      });
    } else {
      logActivity(`File not found (cached): ${fileName}`);
      return res.status(404).send('File not found');
    }
  }

  if (fs.existsSync(filePath)) {
    logActivity(`File info accessed: ${fileName}`);
    fileExistenceCache[fileName] = true;
    return res.json({
      message: 'File exists',
      filename: fileName,
      url: `${req.protocol}://${req.get('host')}/media/${fileName}`
    });
  } else {
    fileExistenceCache[fileName] = false;
  }

  logActivity(`File not found: ${fileName}`);
  res.status(404).send('File not found');
});

app.use((req, res) => {
  logActivity(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).send('Route not found');
});

app.listen(port, () => {
  logActivity(`Server started on port ${port}`);
});