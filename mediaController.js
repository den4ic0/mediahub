require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const aws = require('aws-sdk');
const fileType = require('file-type');

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());

const uploadToS3 = async (file) => {
    const fileTypeInfo = await fileType.fromBuffer(file.buffer);
    const fileName = uuidv4();
    const s3Params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${fileName}.${fileTypeInfo.ext}`,
        Body: file.buffer,
        ContentType: fileTypeInfo.mime,
    };

    return s3.upload(s3Params).promise();
};

const deleteFromS3 = async (key) => {
    const s3Params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };

    return s3.deleteObject(s3Params).promise();
};

app.post('/media', upload.single('file'), async (req, res) => {
    try {
        const result = await uploadToS3(req.file);
        res.status(201).send({
            message: "File uploaded successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).send({ error: "Failed to upload file." });
    }
});

app.delete('/media/:key', async (req, res) => {
    try {
        await deleteFromS3(req.params.key);
        res.status(200).send({ message: "File deleted successfully." });
    } catch (error) {
        res.status(500).send({ error: "Failed to delete file." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});