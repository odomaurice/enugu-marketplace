'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface ComplianceUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  token: string;
  returnUrl?: string; 
}

export default function ComplianceUpload({ 
  isOpen, 
  onClose, 
  onUploadSuccess, 
  token, 
  returnUrl 
}: ComplianceUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter(); // Initialize router

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG, PNG, GIF, WEBP)');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
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

      console.log('Uploading file:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/add-compliance`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.success) {
        toast.success('Compliance document uploaded successfully!');
        onUploadSuccess();
        onClose();
        
        // Redirect after successful upload
        if (returnUrl) {
          router.push(returnUrl); // Redirect to specified returnUrl
        } else {
          router.push('/employee-dashboard'); // Default redirect
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      if (error.response) {
        console.error('Server error response:', error.response.data);
        toast.error(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(error.message || 'Failed to upload compliance document');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Compliance Document</DialogTitle>
          <DialogDescription>
            Your account status is pending. Please upload a compliance document to complete your verification.
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Drag and drop your image here, or click to browse
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
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB
            </p>
            {selectedFile && (
              <p className="text-xs text-green-600">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
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