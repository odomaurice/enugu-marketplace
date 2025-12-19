'use client';
<<<<<<< HEAD

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
=======
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface LoanData {
  loan_unit: number;
  loan_amount_collected: number;
}

interface AddressResponse {
  data: Array<{
    user: LoanData;
  }>;
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f
}

export function LoanStats({
  initialLoanUnit,
  initialLoanTaken,
<<<<<<< HEAD
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
=======
  token
}: {
  initialLoanUnit: number;
  initialLoanTaken: number;
  token: string;
}) {
  const [loanUnit, setLoanUnit] = useState(initialLoanUnit);
  const [loanTaken, setLoanTaken] = useState(initialLoanTaken);

  // Auto-refresh loan data
  const { data, error, isLoading } = useQuery({
    queryKey: ['loan-data', token],
    queryFn: async (): Promise<LoanData> => {
      try {
        console.log('🔄 Fetching loan data...');
        const response = await axios.get<AddressResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('📊 Address API response:', response.data);
        
        // FIX: Access the first item in the data array
        if (response.data.data && response.data.data.length > 0) {
          const userData = response.data.data[0].user;
          console.log('👤 User data found:', userData);
          return {
            loan_unit: userData.loan_unit || 0,
            loan_amount_collected: userData.loan_amount_collected || 0
          };
        }
        
        console.log('⚠️ No address data found, using initial data');
        return {
          loan_unit: initialLoanUnit,
          loan_amount_collected: initialLoanTaken
        };
      } catch (err) {
        console.error('❌ Error fetching loan data:', err);
        throw err;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    initialData: { // Provide initial data
      loan_unit: initialLoanUnit,
      loan_amount_collected: initialLoanTaken
    }
  });

  // Update state when data changes
  useEffect(() => {
    if (data) {
      console.log('🔄 Updating loan stats with new data:', data);
      setLoanUnit(data.loan_unit);
      setLoanTaken(data.loan_amount_collected);
    }
  }, [data]);

  // Debug logging
  useEffect(() => {
    console.log('📈 Current loan stats:', { loanUnit, loanTaken });
  }, [loanUnit, loanTaken]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(value || 0);
  };

  if (isLoading) {
    return (
      <>
        <div className="bg-white p-6 flex justify-between rounded-lg shadow">
          <div>
            <h3 className="font-medium text-md">Purchasing Unit</h3>
            <p className="text-xl text-gray-900 font-bold mt-2">Loading...</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 flex justify-between rounded-lg shadow">
          <div>
            <h3 className="font-medium text-md">Purchasing Unit Spent</h3>
            <p className="text-xl text-gray-900 font-bold mt-2">Loading...</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    console.error('❌ Loan stats error:', error);
    return (
      <>
        <div className="bg-white p-6 flex justify-between rounded-lg shadow">
          <div>
            <h3 className="font-medium text-md">Purchasing Unit</h3>
            <p className="text-xl text-red-600 font-bold mt-2">Error loading data</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 flex justify-between rounded-lg shadow">
          <div>
            <h3 className="font-medium text-md">Purchasing Unit Spent</h3>
            <p className="text-xl text-red-600 font-bold mt-2">Error loading data</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Loan Unit */}
      <div className="bg-white p-6 flex justify-between rounded-lg shadow">
        <div>
          <h3 className="font-medium text-md">Purchasing Unit</h3>
          <p className="text-xl text-gray-900 font-bold mt-2">
            {formatCurrency(loanUnit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Available credit</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f
          </svg>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Loan Taken */}
      <div className="bg-white p-6 flex justify-between rounded-lg shadow">
        <div>
          <h3 className="font-medium text-md">Purchasing Unit Spent</h3>
          <p className="text-xl text-gray-900 font-bold mt-2">
            {formatCurrency(loanTaken)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total spent</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f
          </svg>
        </div>
      </div>
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f
