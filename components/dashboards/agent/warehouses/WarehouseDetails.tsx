'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditWarehouseDialog } from './EditWarehouseDialog';
import { DeleteWarehouseDialog } from './DeleteWarehouseDialog';

interface WarehouseDetailsProps {
  warehouse: any;
  token: string;
}

export function WarehouseDetails({ warehouse, token }: WarehouseDetailsProps) {
  if (!warehouse) {
    return <div>Warehouse not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{warehouse.name}</h1>
        <div className="flex gap-2">
          <EditWarehouseDialog 
            warehouse={warehouse} 
            token={token} 
            onSuccess={() => window.location.reload()} 
          />
          <DeleteWarehouseDialog 
            warehouseId={warehouse.id} 
            token={token} 
            onSuccess={() => window.location.href = '/agent-dashboard/warehouse'} 
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p>{warehouse.address}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">City</h3>
            <p>{warehouse.city}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Country</h3>
            <p>{warehouse.country}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
            <p>{new Date(warehouse.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p>{new Date(warehouse.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {warehouse.inventories.length > 0 ? (
            <div className="space-y-4">
              {/* Render inventory items here */}
            </div>
          ) : (
            <p>No inventory items found for this warehouse.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/agent-dashboard/warehouse">
            Back to Warehouses
          </Link>
        </Button>
      </div>
    </div>
  );
}