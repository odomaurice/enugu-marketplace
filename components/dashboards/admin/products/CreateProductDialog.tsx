
'use client';

import { useEffect, useState } from 'react';
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}


export function CreateProductDialog({ token, onSuccess }: { token: string; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    brand: '',
    isPerishable: 'true',
    shelfLifeDays: '',
    unit: 'KG',
    packageType: 'Bag',
    active: 'true',
    categoryId: '',
    product_image: null as File | null,
    images: [] as File[],
  });

   useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'product_image' | 'images') => {
    if (e.target.files) {
      if (field === 'product_image') {
        setFormData(prev => ({ ...prev, product_image: e.target.files![0] }));
      } else {
        setFormData(prev => ({ ...prev, images: Array.from(e.target.files!) }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('description', formData.description);
    formPayload.append('basePrice', formData.basePrice);
    formPayload.append('brand', formData.brand);
    formPayload.append('isPerishable', formData.isPerishable);
    formPayload.append('shelfLifeDays', formData.shelfLifeDays);
    formPayload.append('unit', formData.unit);
    formPayload.append('packageType', formData.packageType);
    formPayload.append('active', formData.active);
    formPayload.append('categoryId', formData.categoryId);
    if (formData.product_image) {
      formPayload.append('product_image', formData.product_image);
    }
    formData.images.forEach((image) => {
      formPayload.append('images', image);
    });

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/create-product`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
           
          },
        }
      );

      toast.success('Product created successfully!');
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating product:', error);
      console.error('Error creating product:', error.response?.data || error);

      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] font-header">
        <ScrollArea className="h-[400px] w-full ">
        <DialogHeader>
          <DialogTitle className='mb-4'>Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
            />
          </div>

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
                // disabled={formData.isPerishable === 'false'}
              />
            </div>
          </div>

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

          <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleSelectChange('categoryId', value)}
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          <div className="space-y-2">
            <Label>Main Product Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'product_image')}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Images</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'images')}
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}