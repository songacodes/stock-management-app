import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import { getImageUrl } from '../utils/imageUrl';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  multiple = true,
  maxFiles = 10,
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      const newImages: string[] = [...images];

      try {
        for (const file of acceptedFiles.slice(0, maxFiles - images.length)) {
          const formData = new FormData();
          formData.append('image', file);

          const token = localStorage.getItem('token');
          const response = await fetch(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/tiles/upload-image`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const data = await response.json();
          if (data.success && data.data.original) {
            console.log('Image uploaded successfully:', data.data.original);
            newImages.push(data.data.original);
          } else {
            console.error('Upload response missing data:', data);
          }
        }

        onImagesChange(newImages);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload images. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [images, onImagesChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: multiple,
    maxFiles: maxFiles - images.length,
    disabled: uploading || images.length >= maxFiles,
  });

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };


  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: uploading || images.length >= maxFiles ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          opacity: uploading || images.length >= maxFiles ? 0.6 : 1,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        {uploading ? (
          <Box>
            <CircularProgress size={24} sx={{ mb: 1 }} />
            <Typography>Uploading...</Typography>
          </Box>
        ) : images.length >= maxFiles ? (
          <Typography>Maximum {maxFiles} images reached</Typography>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              {isDragActive
                ? 'Drop the images here...'
                : `Drag & drop images here, or click to select`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {multiple
                ? `You can upload up to ${maxFiles - images.length} more image(s)`
                : 'Single image upload'}
            </Typography>
          </Box>
        )}
      </Box>

      {images.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {images.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper
                sx={{
                  position: 'relative',
                  padding: 1,
                  '&:hover .delete-button': {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    paddingTop: '100%',
                    position: 'relative',
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  {getImageUrl(image) ? (
                    <img
                      src={getImageUrl(image)}
                      alt={`Upload ${index + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        console.error('Image preview error:', image, 'Full URL:', getImageUrl(image));
                        (e.target as HTMLImageElement).style.display = 'none';
                        const errorBox = (e.target as HTMLImageElement).nextElementSibling;
                        if (errorBox) {
                          (errorBox as HTMLElement).style.display = 'block';
                        }
                      }}
                    />
                  ) : null}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: getImageUrl(image) ? 'none' : 'block',
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </Box>
                <IconButton
                  className="delete-button"
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'error.main',
                    color: 'white',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      bgcolor: 'error.dark',
                    },
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                {index === 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    Primary
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageUpload;

