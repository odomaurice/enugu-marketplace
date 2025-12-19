'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditInventoryDialog } from './EditInventoryDialog';
import { DeleteInventoryDialog } from './DeleteInventoryDialog';

interface InventoryDetailsProps {
  inventory: any;
  token: string;
}

export function InventoryDetails({ inventory, token }: InventoryDetailsProps) {
  if (!inventory) {
    return <div>Inventory not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {inventory.productName} - {inventory.variantName}
        </h1>
        <div className="flex gap-2">
          <EditInventoryDialog 
            inventory={inventory} 
            token={token} 
            onSuccess={() => window.location.reload()} 
          />
          <DeleteInventoryDialog 
            inventoryId={inventory.id} 
            token={token} 
            onSuccess={() => window.location.href = '/admin-dashboard/inventory'} 
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Variant ID</h3>
            <p>{inventory.variantId}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
            <p>{inventory.quantity}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Low Stock Level</h3>
            <p>{inventory.lowStockLevel}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Batch Number</h3>
            <p>{inventory.batchNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Warehouse</h3>
            <p>{inventory.warehouseName} (ID: {inventory.warehouseId})</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
            <p>{new Date(inventory.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p>{new Date(inventory.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/admin-dashboard/inventory">
            Back to Inventories
          </Link>
        </Button>
      </div>
    </div>
  );
}