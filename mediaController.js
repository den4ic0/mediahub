require('dotenv').config();

const express = require('express');
const multer = require('multer');
const { v4: generateUniqueIdentifier } = require('uuid');
const aws = require('aws-sdk');
const detectMimeType = require('file-type');

const amazonS3Client = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const inMemoryStorageEngine = multer.memoryStorage();
const fileUploadMiddleware = multer({ storage: inMemoryStorageEngine });

const app = express();
app.use(express.json());

const uploadFileToAmazonS3 = async (file) => {
  const fileTypeDetails = await detectMimeType.fromBuffer(file.buffer);
  const uniqueFileName = `${generateUniqueIdentifier()}.${fileTypeDetails.ext}`;
  const s3FileUploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: uniqueFileName,
    Body: file.buffer,
    ContentType: fileTypeDetails.mime,
  };

  return amazonS3Client.upload(s3FileUploadParams).promise();
};

const deleteFileFromAmazonS3 = async (fileIdentifier) => {
  const s3FileDeleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileIdentifier,
  };

  return amazonS3Client.deleteObject(s3FileDeleteParams).promise();
};

app.post('/media', fileUploadMiddleware.single('file'), async (req, res) => {
    try {
        const uploadResult = await uploadFileToAmazonS3(req.file);
        res.status(201).send({
            message: "File uploaded successfully",
            fileInfo: uploadResult,
        });
    } catch (uploadError) {
        console.error('Upload error:', uploadError);
        res.status(500).send({ error: "Failed to upload file." });
    }
});

app.delete('/media/:fileName', async (req, res) => {
    try {
        await deleteFileFromAmazonS3(req.params.fileName);
        res.status(200).send({ message: "File deleted successfully." });
    } catch (deletionError) {
        console.error('Deletion error:', deletionError);
        res.status(500).send({ error: "Failed to delete file." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});