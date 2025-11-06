// components/dashboards/admin/orders/OrdersFilter.tsx
'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/order';

interface OrdersFilterProps {
  orders: Order[];
  onFilterChange: (filteredOrders: Order[]) => void;
}

export default function OrdersFilter({ orders, onFilterChange }: OrdersFilterProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ value: string; label: string }[]>([]);

  // Extract available years from orders
  useEffect(() => {
    const years = new Set<number>();
    orders.forEach(order => {
      const year = new Date(order.placedAt).getFullYear();
      if (year >= 2025) { // Starting from 2025 as per your requirement
        years.add(year);
      }
    });
    
    const sortedYears = Array.from(years).sort((a, b) => b - a); // Descending order
    setAvailableYears(sortedYears);
  }, [orders]);

  // Update available months when year changes
  useEffect(() => {
    if (selectedYear && selectedYear !== 'all') {
      const monthsInYear = new Set<number>();
      orders.forEach(order => {
        const orderDate = new Date(order.placedAt);
        if (orderDate.getFullYear().toString() === selectedYear) {
          monthsInYear.add(orderDate.getMonth()); // 0-11
        }
      });

      const monthOptions = Array.from(monthsInYear)
        .sort((a, b) => a - b)
        .map(month => ({
          value: (month + 1).toString().padStart(2, '0'),
          label: new Date(2000, month).toLocaleString('default', { month: 'long' })
        }));

      setAvailableMonths(monthOptions);
      setSelectedMonth('all'); // Reset month when year changes
    } else {
      setAvailableMonths([]);
      setSelectedMonth('all');
    }
  }, [selectedYear, orders]);

  // Apply filters when year or month changes
  useEffect(() => {
    let filtered = orders;

    if (selectedYear && selectedYear !== 'all') {
      filtered = filtered.filter(order => {
        const orderYear = new Date(order.placedAt).getFullYear().toString();
        return orderYear === selectedYear;
      });
    }

    if (selectedMonth && selectedMonth !== 'all') {
      filtered = filtered.filter(order => {
        const orderMonth = (new Date(order.placedAt).getMonth() + 1).toString().padStart(2, '0');
        return orderMonth === selectedMonth;
      });
    }

    onFilterChange(filtered);
  }, [selectedYear, selectedMonth, orders, onFilterChange]);

  const clearFilters = () => {
    setSelectedYear('all');
    setSelectedMonth('all');
  };

  const hasActiveFilters = selectedYear !== 'all' || selectedMonth !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end mb-6 p-4 border rounded-lg bg-gray-50">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Filter by Year</label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Filter by Month</label>
        <Select 
          value={selectedMonth} 
          onValueChange={setSelectedMonth}
          disabled={!selectedYear || selectedYear === 'all'}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={selectedYear && selectedYear !== 'all' ? "Select month" : "Select year first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {availableMonths.map(month => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div>
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}