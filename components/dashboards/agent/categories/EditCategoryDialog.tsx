'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
  id: string | number;
  name: string;
  parentId?: string | number;
}

interface EditCategoryDialogProps {
  category: Category;
  token: string;
  onSuccess: () => void;
}

export function EditCategoryDialog({ category, token, onSuccess }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    parentId: category.parentId || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        ...(formData.parentId && { parentId: formData.parentId })
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/update-category?category_id=${category.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Category updated successfully!');
      setOpen(false);
      onSuccess();
    } catch (error: unknown) {
      console.error('Error updating category:', error);
      toast.error( 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] font-header">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Category ID (optional)</Label>
            <Input
              id="parentId"
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              placeholder="Leave empty for top-level category"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}