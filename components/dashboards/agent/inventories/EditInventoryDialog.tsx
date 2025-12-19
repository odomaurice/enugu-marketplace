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

interface EditInventoryDialogProps {
  inventory: any;
  token: string;
  onSuccess: () => void;
}

export function EditInventoryDialog({ inventory, token, onSuccess }: EditInventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    variantId: inventory.variantId,
    quantity: inventory.quantity.toString(),
    lowStockLevel: inventory.lowStockLevel.toString(),
    batchNumber: inventory.batchNumber,
    warehouseId: inventory.warehouseId,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/update-inventory?inventory_id=${inventory.id}`,
        {
          ...formData,
          quantity: Number(formData.quantity),
          lowStockLevel: Number(formData.lowStockLevel),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Inventory updated successfully!');
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      toast.error(error.response?.data?.message || 'Failed to update inventory');
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
          <DialogTitle>Edit Inventory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="variantId">Variant ID</Label>
            <Input
              id="variantId"
              name="variantId"
              value={formData.variantId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockLevel">Low Stock Level</Label>
              <Input
                id="lowStockLevel"
                name="lowStockLevel"
                type="number"
                value={formData.lowStockLevel}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouseId">Warehouse ID</Label>
            <Input
              id="warehouseId"
              name="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              required
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
              {loading ? 'Updating...' : 'Update Inventory'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}