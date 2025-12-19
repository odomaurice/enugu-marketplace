'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface ComplianceData {
  id: string;
  userId: string;
  form_url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    loan_unit: number;
    loan_amount_collected: number;
    salary_per_month: number;
    government_entity: string;
    is_compliance_submitted: boolean;
    status: string;
    updatedAt: string;
  };
}

interface ComplianceResponse {
  message: string;
  data: ComplianceData;
}

interface LoanStatsProps {
  initialLoanUnit: number;
  initialLoanTaken: number;
  token: string;
}

export function LoanStats({
  initialLoanUnit,
  initialLoanTaken,
  token,
}: LoanStatsProps) {
  const { data: session } = useSession();
  const [lastUpdated, setLastUpdated] = useState('');

  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['compliance-data', token],
    queryFn: async (): Promise<ComplianceData | null> => {
      try {
        const res = await axios.get<ComplianceResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-compliance`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data.data ?? null;
      } catch {
        return null;
      }
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (data?.user?.updatedAt) {
      setLastUpdated(
        new Date(data.user.updatedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
  }, [data]);

  const user = data?.user;
  const loanUnit = user?.loan_unit ?? initialLoanUnit;
  const loanTaken = user?.loan_amount_collected ?? initialLoanTaken;
  const usedPercent = loanUnit > 0 ? (loanTaken / loanUnit) * 100 : 0;
  const available = loanUnit - loanTaken;

  const format = (v: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(v || 0);

  if (isLoading) return null;

  return (
    <>
      {/* Purchasing Unit */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">
              Purchasing Unit
            </h3>
            
          </div>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {format(loanUnit)}
          </p>

          <p className="text-xs text-green-600 mt-1">
            {format(available)} available
          </p>

          <div className="mt-3">
            <div className="h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min(100, usedPercent)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {usedPercent.toFixed(1)}% used
            </p>
          </div>
        </div>

        <div className="h-11 w-11 rounded-lg bg-orange-50 flex items-center justify-center ml-4">
          <svg
            className="h-6 w-6 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"
            />
          </svg>
        </div>
      </div>

      {/* Purchasing Unit Spent */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between mt-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600">
            Purchasing Unit Spent
          </h3>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {format(loanTaken)}
          </p>

          {user?.government_entity && (
            <p className="text-xs text-gray-500 mt-2">
              <strong>Entity:</strong> {user.government_entity}
            </p>
          )}

          {/* {user?.salary_per_month && (
            <p className="text-xs text-gray-500">
              <strong>Salary:</strong> {format(user.salary_per_month)}
            </p>
          )} */}
        </div>

        <div className="h-11 w-11 rounded-lg bg-green-50 flex items-center justify-center ml-4">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6" />
          </svg>
        </div>
      </div>
    </>
  );
}
