require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { v4: generateUuid } = require('uuid');
const aws = require('aws-sdk');
const mimeTypeDetector = require('file-type');

const s3Client = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const memoryStorage = multer.memoryStorage();
const fileUploader = multer({ storage: memoryStorage });

const app = express();
app.use(express.json());

const uploadFileToS3 = async (file) => {
    const detectedFileType = await mimeTypeDetector.fromBuffer(file.buffer);
    const uniqueFileName = generateUuid();
    const s3UploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uniqueFileName}.${detectedFileType.ext}`,
        Body: file.buffer,
        ContentType: detectedFileType.mime,
    };

    return s3Client.upload(s3UploadParams).promise();
};

const removeFileFromS3 = async (fileKey) => {
    const s3DeleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
    };

    return s3Client.deleteObject(s3DeleteParams).promise();
};

app.post('/media', fileUploader.single('file'), async (req, res) => {
    try {
        const uploadResult = await uploadFileToS3(req.file);
        res.status(201).send({
            message: "File uploaded successfully",
            data: uploadResult,
        });
    } catch (error) {
        res.status(500).send({ error: "Failed to upload file." });
    }
});

app.delete('/media/:fileKey', async (req, res) => {
    try {
        await removeFileFromS3(req.params.fileKey);
        res.status(200).send({ message: "File deleted successfully." });
    } catch (error) {
        res.status(500).send({ error: "Failed to delete file." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});