const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.use('/media', express.static(process.env.UPLOAD_PATH || 'uploads'));

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    return res.json({
      message: 'File uploaded successfully',
      fileInfo: req.file
    });
  }
  
  res.status(400).send('No file uploaded');
});

app.get('/file-info', (req, res) => {
  const fileName = req.query.filename;
  const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);

  if (fs.existsSync(filePath)) {
    return res.json({
      message: 'File exists',
      filename: fileName,
      url: `${req.protocol}://${req.get('host')}/media/${fileName}`
    });
  }

  res.status(404).send('File not found');
});

app.use((req, res) => {
  res.status(404).send('Route not found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});