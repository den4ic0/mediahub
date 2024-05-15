const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

function logActivity(activity) {
  console.log(`${new Date().toISOString()} - ${activity}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = process.env.UPLOAD_PATH || 'uploads/';
    logActivity(`Destination set for file upload: ${dest}`);
    cb(null, dest);
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

app.use('/media', express.static(process.env.UPLOAD_PATH || 'uploads'));

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    logActivity(`File uploaded: ${req.file.filename}`);
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
  const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);

  if (fs.existsSync(filePath)) {
    logActivity(`File info accessed: ${fileName}`);
    return res.json({
      message: 'File exists',
      filename: fileName,
      url: `${req.protocol}://${req.get('host')}/media/${fileName}`
    });
  }

  logActivity(`File not found: ${fileName}`);
  res.status(404).send('File not found');
});

app.use((req, res) => {
  logActivity(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).send('Route not found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logActivity(`Server started on port ${port}`);
});