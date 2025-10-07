import { useToast } from '@/components/ui/toast';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/lib/convex';
import { Id } from '@/lib/convex';
import { useMutation } from 'convex/react';
import { useCallback, useState } from 'react';

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onSuccess?: (url: string, storageId: Id<'_storage'>) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const { user, isSignedIn } = useUser();
  const { success, error } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useMutation(api.vehicles.generateUploadUrl);

  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    onSuccess,
    onError,
  } = options;

  const uploadFile = useCallback(
    async (
      file: File
    ): Promise<{ url: string; storageId: Id<'_storage'> } | null> => {
      if (!isSignedIn || !user) {
        const errorMsg = 'Please sign in to upload files';
        error('Authentication Required', errorMsg);
        onError?.(errorMsg);
        return null;
      }

      // Validate file
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
        error('Invalid File Type', errorMsg);
        onError?.(errorMsg);
        return null;
      }

      if (file.size > maxSize) {
        const errorMsg = `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`;
        error('File Too Large', errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Generate upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.statusText}`);
        }

        const { storageId } = await result.json();

        // Get the file URL
        const fileUrl = `${uploadUrl.split('?')[0]}?storageId=${storageId}`;

        setUploadProgress(100);
        success('Upload Successful', 'File uploaded successfully');

        const result_data = { url: fileUrl, storageId };
        onSuccess?.(fileUrl, storageId);
        return result_data;
      } catch (err) {
        console.error('Upload error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        error('Upload Failed', errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [
      isSignedIn,
      user,
      generateUploadUrl,
      maxSize,
      allowedTypes,
      success,
      error,
      onSuccess,
      onError,
    ]
  );

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  };
}
