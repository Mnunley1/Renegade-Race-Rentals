import { Button } from '@renegade/ui';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Camera, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string, storageId?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function ImageUpload({
  currentImage,
  onImageChange,
  className = '',
  size = 'md',
  disabled = false,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading } = useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    onSuccess: (url, storageId) => {
      onImageChange(url, storageId);
      setPreviewUrl(null);
    },
    onError: error => {
      console.error('Upload error:', error);
      setPreviewUrl(null);
    },
  });

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange('');
    setPreviewUrl(null);
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const displayImage = previewUrl || currentImage;

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full overflow-hidden cursor-pointer transition-all duration-200
          ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
          ${isUploading ? 'opacity-70' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {displayImage ? (
          <div className='relative w-full h-full'>
            <img
              src={displayImage}
              alt='Profile'
              className='w-full h-full object-cover'
            />
            {!disabled && !isUploading && (
              <button
                onClick={handleRemoveImage}
                className='absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
              >
                <X className='h-3 w-3' />
              </button>
            )}
            {isUploading && (
              <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin' />
              </div>
            )}
          </div>
        ) : (
          <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
            {isUploading ? (
              <div className='w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
            ) : (
              <Camera className={`${iconSizes[size]} text-gray-400`} />
            )}
          </div>
        )}
      </div>

      {!disabled && (
        <div className='mt-2 text-center'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleClick}
            disabled={isUploading}
            className='text-xs'
          >
            <Upload className='h-3 w-3 mr-1' />
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </Button>
          <p className='text-xs text-gray-500 mt-1'>JPG, PNG, WebP up to 5MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/jpg,image/png,image/webp'
        onChange={handleFileInputChange}
        className='hidden'
        disabled={disabled || isUploading}
      />
    </div>
  );
}
