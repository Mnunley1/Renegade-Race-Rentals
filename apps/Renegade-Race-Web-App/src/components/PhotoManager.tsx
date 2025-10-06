import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoItem, useVehicles } from '@/hooks/useVehicles';
import {
  Camera,
  Check,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface PhotoManagerProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

export default function PhotoManager({
  photos,
  onPhotosChange,
  maxPhotos = 10,
}: PhotoManagerProps) {
  const { processAndUploadImage } = useVehicles();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      console.log('handleFileSelect called with files:', files);
      if (!files) return;

      const newPhotos: PhotoItem[] = [];
      const fileArray = Array.from(files);

      // Validate file count
      if (photos.length + fileArray.length > maxPhotos) {
        alert(`You can only upload up to ${maxPhotos} photos`);
        return;
      }

      // Validate file types and sizes
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          alert(`${file.name} is too large. Please choose files under 5MB`);
          continue;
        }

        const preview = URL.createObjectURL(file);
        newPhotos.push({
          file,
          preview,
          isProcessing: true,
        });
      }

      // Add new photos to the list
      onPhotosChange([...photos, ...newPhotos]);

      // Process each new photo
      setIsProcessing(true);
      try {
        const updatedPhotos = [...photos];

        for (let i = 0; i < newPhotos.length; i++) {
          const photoIndex = photos.length + i;
          const photo = newPhotos[i];

          try {
            const processedData = await processAndUploadImage(
              photo.file,
              photoIndex === 0, // First photo is primary
              photoIndex
            );

            updatedPhotos[photoIndex] = {
              ...photo,
              isProcessing: false,
              processedData,
            };
          } catch (error) {
            console.error('Error processing photo:', error);
            updatedPhotos[photoIndex] = {
              ...photo,
              isProcessing: false,
              error: 'Failed to process image',
            };
          }
        }

        onPhotosChange(updatedPhotos);
      } catch (error) {
        console.error('Error processing photos:', error);
      } finally {
        setIsProcessing(false);
      }

      // Reset the file input
      const fileInput = document.getElementById(
        'photo-upload'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    [photos, onPhotosChange, maxPhotos, processAndUploadImage]
  );

  const removePhoto = useCallback(
    (index: number) => {
      const updatedPhotos = photos.filter((_, i) => i !== index);
      // Update primary photo if needed
      if (index === 0 && updatedPhotos.length > 0) {
        updatedPhotos[0] = {
          ...updatedPhotos[0],
          processedData: updatedPhotos[0].processedData
            ? {
                ...updatedPhotos[0].processedData,
                isPrimary: true,
              }
            : undefined,
        };
      }
      onPhotosChange(updatedPhotos);
    },
    [photos, onPhotosChange]
  );

  const setPrimaryPhoto = useCallback(
    (index: number) => {
      const updatedPhotos = photos.map((photo, i) => ({
        ...photo,
        processedData: photo.processedData
          ? {
              ...photo.processedData,
              isPrimary: i === index,
            }
          : undefined,
      }));
      onPhotosChange(updatedPhotos);
    },
    [photos, onPhotosChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Camera className='h-5 w-5' />
          Vehicle Photos
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Upload Area */}
        <div
          className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors'
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Upload Vehicle Photos
          </h3>
          <p className='text-gray-600 mb-4'>
            Add high-quality photos of your vehicle ({photos.length}/{maxPhotos}{' '}
            uploaded)
          </p>
          <div className='space-y-2'>
            <input
              type='file'
              id='photo-upload'
              multiple
              accept='image/*'
              onChange={e => handleFileSelect(e.target.files)}
              className='hidden'
              disabled={isProcessing || photos.length >= maxPhotos}
            />
            <Button
              type='button'
              variant='outline'
              disabled={isProcessing || photos.length >= maxPhotos}
              className='cursor-pointer hover:bg-gray-50'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Choose Files button clicked');
                const fileInput = document.getElementById(
                  'photo-upload'
                ) as HTMLInputElement;
                console.log('File input found:', fileInput);
                if (fileInput) {
                  fileInput.click();
                  console.log('File input clicked');
                } else {
                  console.error('File input not found');
                }
              }}
            >
              <Plus className='h-4 w-4 mr-2' />
              {isProcessing ? 'Processing...' : 'Choose Files'}
            </Button>
            <p className='text-xs text-gray-500'>
              JPG, PNG files up to 5MB each. Drag and drop supported.
            </p>
          </div>
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {photos.map((photo, index) => (
              <div
                key={index}
                className='relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200'
              >
                <img
                  src={photo.preview}
                  alt={`Vehicle photo ${index + 1}`}
                  className='w-full h-full object-cover'
                />

                {/* Processing Overlay */}
                {photo.isProcessing && (
                  <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                    <div className='text-center text-white'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2'></div>
                      <p className='text-sm'>Processing...</p>
                    </div>
                  </div>
                )}

                {/* Error Overlay */}
                {photo.error && (
                  <div className='absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center'>
                    <div className='text-center text-white'>
                      <X className='h-8 w-8 mx-auto mb-2' />
                      <p className='text-sm'>{photo.error}</p>
                    </div>
                  </div>
                )}

                {/* Success Overlay */}
                {photo.processedData && !photo.isProcessing && !photo.error && (
                  <div className='absolute inset-0 bg-green-500 bg-opacity-75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <div className='text-center text-white'>
                      <Check className='h-8 w-8 mx-auto mb-2' />
                      <p className='text-sm'>Ready</p>
                    </div>
                  </div>
                )}

                {/* Primary Badge */}
                {photo.processedData?.isPrimary && (
                  <div className='absolute top-2 left-2 bg-[#EF1C25] text-white text-xs px-2 py-1 rounded'>
                    Primary
                  </div>
                )}

                {/* Action Buttons */}
                <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <div className='flex gap-1'>
                    {!photo.processedData?.isPrimary && photo.processedData && (
                      <Button
                        size='sm'
                        variant='secondary'
                        className='h-8 w-8 p-0'
                        onClick={() => setPrimaryPhoto(index)}
                      >
                        <ImageIcon className='h-4 w-4' />
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='destructive'
                      className='h-8 w-8 p-0'
                      onClick={() => removePhoto(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='font-medium text-blue-900 mb-2'>Photo Tips</h4>
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>
              • Include photos from different angles (front, side, rear,
              interior)
            </li>
            <li>• Use good lighting and avoid shadows</li>
            <li>• Show any unique features or modifications</li>
            <li>• Make sure the vehicle is clean and presentable</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
