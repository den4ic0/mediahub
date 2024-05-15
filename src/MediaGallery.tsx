import React, { useState, useEffect } from 'react';
import './MediaGallery.css';

interface ImageFile {
  id: string;
  name: string;
  url: string;
}

const fetchImages = async (): Promise<ImageFile[]> => {
  return [
    { id: '1', name: 'Image1.png', url: 'http://example.com/image1.png' },
    { id: '2', name: 'Image2.png', url: 'http://example.com/image2.png' },
  ];
}

const MediaGallery: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  
  useEffect(() => {
    const loadImages = async () => {
      const fetchedImages = await fetchImages();
      setImages(fetchedImages);
    }

    loadImages();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (files) {
      const uploadedImages = Array.from(files).map(file => {
        return uploadImage(file);
      });

      const newImages = await Promise.all(uploadedImages);
      setImages([...images, ...newImages]);
    }
  }

  const uploadImage = async (file: File): Promise<ImageFile> => {
    return {
      id: 'newId',
      name: file.name,
      url: URL.createObjectURL(file),
    };
  }

  const handleDelete = (imageId: string) => {
    setImages(images.filter(image => image.id !== imageId));
  }

  const handleDragEnd = (result: any) => {
  }

  return (
    <div className="media-gallery">
      <input type="file" multiple onChange={(e) => handleFileUpload(e.target.files)} />
      <div className="image-grid">
        {images.map(image => (
          <div key={image.id} className="image-item">
            <img src={image.url} alt={image.name} />
            <button onClick={() => handleDelete(image.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaGallery;