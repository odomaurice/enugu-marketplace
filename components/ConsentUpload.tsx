'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import axios from 'axios';

interface ConsentUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  token: string;
  returnUrl?: string;
}

export default function ConsentUpload({ 
  isOpen, 
  onClose, 
  onUploadSuccess, 
  token
}: ConsentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image to upload');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('compliance_form', selectedFile);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/add-compliance`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success('Compliance document uploaded successfully!');
        // Reset state first
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsUploading(false);
        
        // Call success callback first, then close
        onUploadSuccess();
        onClose();
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload compliance document');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Compliance Document</DialogTitle>
          <DialogDescription>
            Please upload your compliance document to complete verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="compliance_form">Compliance Document (Image)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-48 max-w-full object-contain rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to browse or drag and drop your image here
                  </p>
                </div>
              )}
              <Input
                id="compliance_form"
                name="compliance_form"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}