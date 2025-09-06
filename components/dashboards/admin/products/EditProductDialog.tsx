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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Product {
  id: string | number;
  name: string;
  description: string;
  basePrice: number | string;
  brand?: string;
  isPerishable: boolean;
  shelfLifeDays?: number | string;
  unit: string;
  packageType: string;
  active: boolean;
  categoryId: string | number;
  product_image?: string;
  images?: string[];
}

interface EditProductDialogProps {
  product: Product;
  token: string;
  onSuccess: () => void;
}

export function EditProductDialog({ product, token, onSuccess }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImagesFiles, setAdditionalImagesFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    basePrice: product.basePrice,
    brand: product.brand || '',
    isPerishable: product.isPerishable.toString(),
    shelfLifeDays: product.shelfLifeDays?.toString() || '',
    unit: product.unit,
    packageType: product.packageType,
    active: product.active.toString(),
    categoryId: product.categoryId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalImagesFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formPayload = new FormData();
    
    // Append all form data
    formPayload.append('name', formData.name);
    formPayload.append('description', formData.description);
    formPayload.append('basePrice', formData.basePrice.toString());
    if (formData.brand) formPayload.append('brand', formData.brand);
    formPayload.append('isPerishable', formData.isPerishable);
    if (formData.shelfLifeDays) formPayload.append('shelfLifeDays', formData.shelfLifeDays);
    formPayload.append('unit', formData.unit);
    formPayload.append('packageType', formData.packageType);
    formPayload.append('active', formData.active);
    formPayload.append('categoryId', formData.categoryId.toString());

    // Append images if they exist
    if (mainImageFile) {
      formPayload.append('product_image', mainImageFile);
    }
    
    additionalImagesFiles.forEach((file) => {
      formPayload.append('images', file);
    });

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-product?product_id=${product.id}`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Product updated successfully!');
      setOpen(false);
      onSuccess();
    } catch (error: unknown) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] font-header">
        <ScrollArea className="h-[600px] w-full p-4">
          <DialogHeader>
            <DialogTitle className="mb-4">Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Pricing and Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Perishable Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isPerishable">Perishable</Label>
                <Select
                  value={formData.isPerishable}
                  onValueChange={(value) => handleSelectChange('isPerishable', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Is perishable?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shelfLifeDays">Shelf Life (Days)</Label>
                <Input
                  id="shelfLifeDays"
                  name="shelfLifeDays"
                  type="number"
                  value={formData.shelfLifeDays}
                  onChange={handleChange}
                  disabled={formData.isPerishable === 'false'}
                />
              </div>
            </div>

            {/* Unit and Package Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">Kilogram (KG)</SelectItem>
                    <SelectItem value="G">Gram (G)</SelectItem>
                    <SelectItem value="L">Liter (L)</SelectItem>
                    <SelectItem value="ML">Milliliter (ML)</SelectItem>
                    <SelectItem value="PC">Piece (PC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type</Label>
                <Select
                  value={formData.packageType}
                  onValueChange={(value) => handleSelectChange('packageType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bag">Bag</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Can">Can</SelectItem>
                    <SelectItem value="Jar">Jar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category and Status */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category ID</Label>
              <Input
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <Select
                value={formData.active}
                onValueChange={(value) => handleSelectChange('active', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Uploads */}
            <div className="space-y-2">
              <Label>Main Product Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
              />
              {product.product_image && !mainImageFile && (
                <p className="text-sm text-muted-foreground">
                  Current: {product.product_image}
                </p>
              )}
              {mainImageFile && (
                <p className="text-sm text-muted-foreground">
                  New file: {mainImageFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Additional Images</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
              />
              {product.images && product.images.length > 0 && additionalImagesFiles.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Current images:</p>
                  <ul className="list-disc pl-5">
                    {product.images.map((img, index) => (
                      <li key={index}>{img}</li>
                    ))}
                  </ul>
                </div>
              )}
              {additionalImagesFiles.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>New files:</p>
                  <ul className="list-disc pl-5">
                    {additionalImagesFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}