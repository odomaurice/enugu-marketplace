"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DownloadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadUsersDialogProps {
  token: string;
}

export function UploadUsersDialog({ token }: UploadUsersDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/upload-users`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(`${response.data?.count || 'Users'} created successfully!`);
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error uploading users:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload users"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users-template`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] font-header">
        <DialogHeader>
          <DialogTitle>Bulk Create Users <br/> </DialogTitle>
        </DialogHeader>
        <span className="text-[13px] font-normal">Click on the download template below to get the csv template and after filling it, upload the file here to create new user(s)</span> 
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="csvFile">CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              CSV file with user data (max 1000 users)
            </p>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={downloadTemplate}
              className="text-blue-600"
            >
              <DownloadCloud className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || loading}>
              {loading ? "Uploading..." : "Upload Users"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}