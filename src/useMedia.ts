import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

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

  const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || 'An unexpected error occurred';
    }
    return 'Non-Axios error occurred';
  }

  const retrieveMediaFiles = async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/media`);
      setMediaFilesList(response.data);
    } catch (error) {
      const errorMessage = handleAxiosError(error);
      setFetchError(`Failed to fetch media files: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  const addMediaFile = async (file: File, metadata: Record<string, any> = {}) => {
    setIsFetching(true);
    setFetchError(null);
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
      const errorMessage = handleAxiosError(error);
      setFetchError(`Failed to upload file: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  const modifyMediaMetadata = async (fileId: string, newMetadata: Record<string, any>) => {
    setIsFetching(true);
    setFetchError(null);
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/media/${fileId}/metadata`, { metadata: newMetadata });
      await retrieveMediaFiles();
    } catch (error) {
      const errorMessage = handleAxiosError(error);
      setFetchError(`Failed to update metadata: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    retrieveMediaFiles();
  }, []);

  return { mediaFilesArray, addMediaFile, modifyMediaMetadata, isLoading: isFetchingList, fetchErrorList };
};

export default useMediaManager;