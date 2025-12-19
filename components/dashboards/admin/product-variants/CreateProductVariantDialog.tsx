'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  description: string;
  variants: Array<{
    sku: string;
  }>;
}

interface Attribute {
  key: string;
  value: string;
}

export function CreateProductVariantDialog({ token, onSuccess }: { token: string; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([{ key: '', value: '' }]);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    netWeight: '',
    price: '',
    productId: '',
    expiryDate: '',
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, token]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      const skuPrefix = selectedProduct.name.substring(0, 3).toUpperCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setFormData(prev => ({
        ...prev,
        productId,
        sku: `${skuPrefix}-${randomSuffix}`
      }));
    }
  };

  const handleAttributeChange = (index: number, field: 'key' | 'value', val: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = val;
    setAttributes(updatedAttributes);
  };

  const addAttributeField = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const removeAttributeField = (index: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    setAttributes(updatedAttributes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert attributes to JSON format
    const attributeJson = attributes.reduce((acc: Record<string, string>, attr) => {
      if (attr.key && attr.value) {
        acc[attr.key] = attr.value;
      }
      return acc;
    }, {});

    const formPayload = new FormData();
    formPayload.append('sku', formData.sku);
    formPayload.append('name', formData.name);
    formPayload.append('netWeight', formData.netWeight);
    formPayload.append('price', formData.price);
    formPayload.append('productId', formData.productId);
    formPayload.append('attribute', JSON.stringify(attributeJson));
    formPayload.append('expiryDate', formData.expiryDate || '');
    if (imageFile) {
      formPayload.append('image', imageFile);
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/create-product-variant`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Product variant created successfully!');
      setOpen(false);
      setImageFile(null);
      setAttributes([{ key: '', value: '' }]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating product variant:', error);
      toast.error('Failed to create product variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Variant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] font-header">
        <ScrollArea className="h-[500px] w-full rounded-md p-4">
          <DialogHeader>
            <DialogTitle className="mb-4">Create New Product Variant</DialogTitle>
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
              <Label htmlFor="productId">Product</Label>
              <Select
                value={formData.productId}
                onValueChange={handleProductSelect}
                disabled={productsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={productsLoading ? "Loading products..." : "Select a product"} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Variant Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imageFile && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {imageFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Attributes</Label>
              {attributes.map((attr, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-end">
                  <div className="col-span-2">
                    <Label htmlFor={`attr-key-${index}`}>Key</Label>
                    <Input
                      id={`attr-key-${index}`}
                      value={attr.key}
                      onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                      placeholder="e.g., color"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`attr-value-${index}`}>Value</Label>
                    <Input
                      id={`attr-value-${index}`}
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      placeholder="e.g., red"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAttributeField(index)}
                    disabled={attributes.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttributeField}
              >
                Add Attribute
              </Button>
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
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Variant'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}