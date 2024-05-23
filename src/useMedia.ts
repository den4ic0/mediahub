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
  const [mediaFilesList, setMediaFilesList] = useState<MediaFile[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const retrieveMediaFiles = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/media`);
      setMediaFilesList(response.data);
    } catch (error) {
      setFetchError('Failed to fetch media files.');
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  const addMediaFile = async (file: File, metadata: Record<string, any> = {}) => {
    setIsFetching(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await retrieveMediaFiles();
    } catch (error) {
      setFetchError('Failed to upload file.');
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  const modifyMediaMetadata = async (fileId: string, newMetadata: Record<string, any>) => {
    setIsFetching(true);
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/media/${fileId}/metadata`, { metadata: newMetadata });
      await retrieveMediaFiles();
    } catch (error) {
      setFetchError('Failed to update metadata.');
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    retrieveMediaFiles();
  }, []);

  return { mediaFilesList, addMediaFile, modifyMediaMetadata, isLoading: isFetching, fetchError };
};

export default useMediaManager;