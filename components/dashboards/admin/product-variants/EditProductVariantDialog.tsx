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
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditProductVariantDialogProps {
  variant: any;
  token: string;
  onSuccess: () => void;
}

export function EditProductVariantDialog({ variant, token, onSuccess }: EditProductVariantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: variant.sku,
    name: variant.name,
    netWeight: variant.netWeight.toString(),
    price: variant.price.toString(),
    productId: variant.productId,
    image: variant.image || '',
    attribute: variant.attribute || '',
    expiryDate: variant.expiryDate ? new Date(variant.expiryDate).toISOString().split('T')[0] : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-product-variant?product_variant_id=${variant.id}`,
        {
          ...formData,
          netWeight: Number(formData.netWeight),
          price: Number(formData.price),
          expiryDate: formData.expiryDate || null,
          attribute: formData.attribute || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Product variant updated successfully!');
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating product variant:', error);
      toast.error(error.response?.data?.message || 'Failed to update product variant');
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
        <ScrollArea className="h-[400px] w-full ">
        <DialogHeader>
          <DialogTitle>Edit Product Variant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Variant Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="netWeight">Net Weight (kg)</Label>
              <Input
                id="netWeight"
                name="netWeight"
                type="number"
                step="0.01"
                value={formData.netWeight}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productId">Product ID</Label>
            <Input
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attribute">Attribute</Label>
            <Input
              id="attribute"
              name="attribute"
              value={formData.attribute}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
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
              {loading ? 'Updating...' : 'Update Variant'}
            </Button>
          </div>
        </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}