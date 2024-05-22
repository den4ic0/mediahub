import { useState, useEffect } from 'react';
import axios from 'axios';

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  metadata?: Record<string, any>;
}

const useMediaManager = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMediaFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/media`);
      setMediaFiles(response.data);
    } catch (err) {
      setError('Failed to fetch media files.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadMediaFile = async (file: File, metadata: Record<string, any> = {}) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchMediaFiles();
    } catch (err) {
      setError('Failed to upload file.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateMediaMetadata = async (id: string, metadata: Record<string, any>) => {
    setLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/media/${id}/metadata`, { metadata });
      await fetchMediaFiles();
    } catch (err) {
      setError('Failed to update metadata.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  return { mediaFiles, uploadMediaFile, updateMediaMetadata, loading, error };
};

export default useMediaManager;