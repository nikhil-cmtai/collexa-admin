// src/components/ui/ImageUpload.tsx
'use client'

import React, { useState, FC, ChangeEvent } from 'react';
import axios from 'axios';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string;
  onUploadComplete: (url: string) => void;
}

export const ImageUpload: FC<ImageUploadProps> = ({ value, onUploadComplete }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const { data: presignedDataResponse } = await axios.post<{
        data: { uploadUrl: string; publicUrl: string };
      }>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/uploads/generate-presigned-url`,
        {
          fileName: file.name,
          fileType: file.type,
        }
      );

      const { uploadUrl, publicUrl } = presignedDataResponse.data;

      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
      });

      onUploadComplete(publicUrl);
    } catch (err) {
      console.error('File upload failed:', err);
      setError('File upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (): void => {
    onUploadComplete('');
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <Image src={value} alt="Uploaded preview" layout="fill" objectFit="cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground relative">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 mb-2" />
              <span>Click or drag to upload</span>
            </>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
};