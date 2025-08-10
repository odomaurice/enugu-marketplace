"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { LargeSkeleton } from "./AdminChartDialog";

const chartConfig = {
  desktop: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Generate dummy order data for the last 12 months
const generateDummyOrderData = () => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  return months.map((month) => ({
    month,
    completed: Math.floor(Math.random() * 100) + 50, // Random between 50-150
    pending: Math.floor(Math.random() * 30) + 10,   // Random between 10-40
    total: 0 // Will be calculated
  })).map(item => ({
    ...item,
    total: item.completed + item.pending
  }));
};

export function OrdersChart() {
  const { data = generateDummyOrderData(), isLoading, isError, error } = useQuery({
    queryKey: ["admin-orders-charts"],
    queryFn: async () => {
      // For future live data integration:
      // const response = await fetch("/api/charts/admin-orders-chart");
      // if (!response.ok) throw new Error("Failed to fetch order data");
      // return response.json();
      
      // For now, return dummy data but keep the async structure
      return Promise.resolve(generateDummyOrderData());
    },
    // refetchInterval: 1000 * 60 * 5, // 5 minutes (can be enabled later)
  });

  if (isLoading) {
    return <LargeSkeleton />;
  }

  if (isError) {
    return <p>{error?.message || "Error loading order data"}</p>;
  }

  return (
    <Card className="mb-6 md:w-1/2 w-full">
      <CardHeader>
        <CardTitle className="text-[18px]">Orders</CardTitle>
        <CardDescription className="text-[14px]">
          Showing order statistics for the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillDesktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
            <Area
              dataKey="pending"
              type="natural"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Order trends overview
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}