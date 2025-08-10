"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mui/material";
import { Card } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface IAdminChart {
  products: number[];
  ordered: number[];
  delivered: number[];
}

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};

// Get last 7 days names (e.g., ["Mon", "Tue", ..., "Sun"])
const getLastWeekDays = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
  }
  return days;
};

const labels = getLastWeekDays();

export const LargeSkeleton = () => {
  return (
    <Skeleton
      className="w-full rounded-lg"
      height={350}
      variant="rectangular"
      animation="wave"
    />
  );
};

// Dummy data generator for last week's registrations
const generateDummyData = (): IAdminChart => {
  return {
    products: Array(7).fill(0).map(() => Math.floor(Math.random() * 20) + 5),
    ordered: Array(7).fill(0).map(() => Math.floor(Math.random() * 50) + 10),
    delivered: Array(7).fill(0).map(() => Math.floor(Math.random() * 30) + 5),
  };
};

export default function AdminChartDialog() {
  // For now, we'll use dummy data but keep the React Query structure
  const {
    data: chartData = generateDummyData(), // Fallback to dummy data
    isLoading,
    error,
    isError,
  } = useQuery<IAdminChart>({
    queryKey: ["line-chart-admin-all"],
    queryFn: async () => {
      // In the future, uncomment this to fetch real data
      // const response = await fetch("/api/charts/all-users-chart");
      // if (!response.ok) throw new Error("Failed to fetch chart data");
      // return response.json();
      
      // For now, return dummy data but keep the async structure
      return Promise.resolve(generateDummyData());
    },
    // Refetch options can be added later
    // refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <LargeSkeleton />;
  }

  if (isError) {
    return <p>{error?.message || "Error loading chart data"}</p>;
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Products",
        data: chartData.products,
        borderColor: "#ff0000",
        backgroundColor: "#E1341E",
        tension: 0.1,
      },
      {
        label: "Ordered",
        data: chartData.ordered,
        borderColor: "#FF6634",
        backgroundColor: "#D53500",
        tension: 0.1,
      },
      {
        label: "Delivered",
        data: chartData.delivered,
        borderColor: "#359671",
        backgroundColor: "#00ff00",
        tension: 0.1,
      },
    ],
  };

  return (
    <Card className="md:w-[80%] w-full h-full px-3 py-4">
    <div className=" mx-auto ">
      <h2 className="text-[18px] font-medium mb-4">User Registrations Last Week</h2>
      <Line options={options} data={data} />
    </div>
    </Card>
  );
}