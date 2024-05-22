import React, { useState, useEffect } from 'react';
import './MediaGallery.css';

interface Image {
  id: string;
  name: string;
  url: string;
}

const fetchGalleryImages = async (): Promise<Image[]> => {
  return [
    { id: '1', name: 'Image1.png', url: 'http://example.com/image1.png' },
    { id: '2', name: 'Image2.png', url: 'http://example.com/image2.png' },
  ];
};

const cache: Record<string, any> = {};

function withResponseCache<T>(func: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T> {
  return async (...args: any[]): Promise<T> => {
    const cacheKey = JSON.stringify(args);
    if (!cache[cacheKey]) {
      cache[cacheKey] = await func(...args);
    }
    return cache[cacheKey];
  };
}

const fetchImagesWithCache = withResponseCache(fetchGalleryImages);

const MediaGallery: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<Image[]>([]);
  
  useEffect(() => {
    const loadGalleryImages = async () => {
      const imagesFromCache = await fetchImagesWithCache();
      setGalleryImages(imagesFromCache);
    };

    loadGalleryImages();
  }, []);

  const handleImageUpload = async (fileList: FileList | null) => {
    if (fileList) {
      const uploadPromises = Array.from(fileList).map(file => uploadGalleryImage(file));
      const newGalleryImages = await Promise.all(uploadPromises);
      setGalleryImages(prevImages => [...prevImages, ...newGalleryImages]);
    }
  };

  const uploadGalleryImage = async (file: File): Promise<Image> => {
    return {
      id: URL.createObjectURL(file),
      name: file.name,
      url: URL.createObjectURL(file),
    };
  };

  const handleImageDelete = (imageId: string) => {
    setGalleryImages(galleryImages.filter(image => image.id !== imageId));
  };

  const handleDragEnd = (result: any) => {
  };

  return (
    <div className="media-gallery">
      <input type="file" multiple onChange={(e) => handleImageUpload(e.target.files)} />
      <div className="image-grid">
        {galleryImages.map((image) => (
          <div key={image.id} className="image-item">
            <img src={image.url} alt={image.name} />
            <button onClick={() => handleImageDelete(image.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;