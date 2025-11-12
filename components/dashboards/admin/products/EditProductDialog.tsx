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
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update product');
      } else {
        toast.error('Failed to update product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          Edit Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full mx-2 sm:mx-0 sm:max-w-[800px] max-h-[95vh] font-header p-0">
        <ScrollArea className="h-full max-h-[95vh]">
          <div className="p-4 sm:p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg sm:text-xl">Edit Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Information */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="text-sm sm:text-base resize-vertical min-h-[80px]"
                />
              </div>

              {/* Pricing and Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="text-sm sm:text-base">Base Price</Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm sm:text-base">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Perishable Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isPerishable" className="text-sm sm:text-base">Perishable</Label>
                  <Select
                    value={formData.isPerishable}
                    onValueChange={(value) => handleSelectChange('isPerishable', value)}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Is perishable?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true" className="text-sm sm:text-base">Yes</SelectItem>
                      <SelectItem value="false" className="text-sm sm:text-base">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shelfLifeDays" className="text-sm sm:text-base">Shelf Life (Days)</Label>
                  <Input
                    id="shelfLifeDays"
                    name="shelfLifeDays"
                    type="number"
                    value={formData.shelfLifeDays}
                    onChange={handleChange}
                    disabled={formData.isPerishable === 'false'}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Unit and Package Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm sm:text-base">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleSelectChange('unit', value)}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG" className="text-sm sm:text-base">Kilogram (KG)</SelectItem>
                      <SelectItem value="G" className="text-sm sm:text-base">Gram (G)</SelectItem>
                      <SelectItem value="L" className="text-sm sm:text-base">Liter (L)</SelectItem>
                      <SelectItem value="ML" className="text-sm sm:text-base">Milliliter (ML)</SelectItem>
                      <SelectItem value="PC" className="text-sm sm:text-base">Piece (PC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packageType" className="text-sm sm:text-base">Package Type</Label>
                  <Select
                    value={formData.packageType}
                    onValueChange={(value) => handleSelectChange('packageType', value)}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bag" className="text-sm sm:text-base">Bag</SelectItem>
                      <SelectItem value="Bottle" className="text-sm sm:text-base">Bottle</SelectItem>
                      <SelectItem value="Box" className="text-sm sm:text-base">Box</SelectItem>
                      <SelectItem value="Can" className="text-sm sm:text-base">Can</SelectItem>
                      <SelectItem value="Jar" className="text-sm sm:text-base">Jar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category and Status */}
              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-sm sm:text-base">Category ID</Label>
                <Input
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="active" className="text-sm sm:text-base">Status</Label>
                <Select
                  value={formData.active}
                  onValueChange={(value) => handleSelectChange('active', value)}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-sm sm:text-base">Active</SelectItem>
                    <SelectItem value="false" className="text-sm sm:text-base">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Uploads */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Main Product Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="text-sm sm:text-base"
                />
                {product.product_image && !mainImageFile && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Current: {product.product_image.split('/').pop()}
                  </p>
                )}
                {mainImageFile && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    New file: {mainImageFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Additional Images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  className="text-sm sm:text-base"
                />
                {product.images && product.images.length > 0 && additionalImagesFiles.length === 0 && (
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    <p className="font-medium">Current images:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      {product.images.map((img, index) => (
                        <li key={index} className="truncate">
                          {img.split('/').pop()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {additionalImagesFiles.length > 0 && (
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    <p className="font-medium">New files:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      {additionalImagesFiles.map((file, index) => (
                        <li key={index} className="truncate">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  {loading ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}