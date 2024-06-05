const supertest = require('supertest');
require('dotenv').config();
const app = require('./app');

const apiTestClient = supertest.agent(app);

describe('Media Management Functionalities', () => {

  it('should successfully upload a file', async () => {
    const uploadResponse = await apiTestClient
      .post('/upload') 
      .attach('mediaFile', 'path/to/test/file.jpg') 
      .set('Authorization', `Bearer ${process.env.TEST_AUTH_TOKEN}`);
    
    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body).toHaveProperty('uploadedFileUrl'); 
  });

  it('should successfully download a file', async () => {
    const uploadedFilePath = '/path/to/uploaded/file.jpg'; 
    const downloadResponse = await apiTestClient
      .get(`/download/${uploadedFilePath}`) 
      .set('Authorization', `Bearer ${process.env.TEST_AUTH_TOKEN}`);

    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.headers['content-type']).toBe('image/jpeg');
  });

  it('should successfully retrieve file metadata', async () => {
    const targetFileId = 'specific-file-id'; 
    const metadataResponse = await apiTestClient
      .get(`/metadata/${targetFileId}`) 
      .set('Authorization', `Bearer ${process.env.TEST_AUTH_TOKEN}`);

    expect(metadataResponse.status).toBe(200);
    expect(metadataResponse.body).toHaveProperty('id', targetFileId);
    expect(metadataResponse.body).toHaveProperty('fileSize');
    expect(metadataResponse.body).toHaveProperty('creationDate');
  });

  it('should successfully delete a file', async () => {
    const fileToDeleteId = 'target-file-id-for-deletion'; 
    const deletionResponse = await apiTestClient
      .delete(`/delete/${fileToDeleteId}`) 
      .set('Authorization', `Bearer ${process.env.TEST_AUTH_TOKEN}`);

    expect(deletionResponse.status).toBe(200);
  });

});