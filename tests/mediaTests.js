const supertest = require('supertest');
require('dotenv').config();
const app = require('./app');

const request = supertest.agent(app);

describe('Media Management Functionalities', () => {

  it('should upload a file successfully', async () => {
    const response = await request
      .post('/upload') 
      .attach('file', 'path/to/test/file.jpg') 
      .set('Authorization', `Bearer ${process.env.TEST_AUTH_TOKEN}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('fileUrl'); 
  });

  it('should download a file successfully', async () => {
    const fileUrl = '/path/to/uploaded/file.jpg'; 
    const response = await request
      .get(`/download/${fileUrl}`) 
      .set('Authorization', `Bearer ${process.env.TEST_AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/jpeg');
  });

  it('should retrieve file metadata successfully', async () => {
    const fileId = 'some-file-id'; 
    const response = await request
      .get(`/metadata/${fileId}`) 
      .set('Authorization', `Bearer ${process.env.TEST_AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', fileId);
    expect(response.body).toHaveProperty('size');
    expect(response.body).toHaveProperty('createdAt');
  });

  // Adding a new test case for deleting a file
  it('should delete a file successfully', async () => {
    const fileId = 'file-id-to-delete'; 
    const response = await request
      .delete(`/delete/${fileId}`) 
      .set('Authorization', `Bearer ${process.env.TEST_AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'File deleted successfully');
  });

});