
'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

export function LoanStats({
  initialLoanUnit,
  initialLoanTaken,
  token
}: {
  initialLoanUnit: number;
  initialLoanTaken: number;
  token: string;
}) {
  const [loanUnit, setLoanUnit] = useState(initialLoanUnit);
  const [loanTaken, setLoanTaken] = useState(initialLoanTaken);

  // Auto-refresh loan data
  const { data } = useQuery({
    queryKey: ['loan-data', token],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data?.[1]?.user;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    initialData: { // Provide initial data
      loan_unit: initialLoanUnit,
      loan_amount_collected: initialLoanTaken
    }
  });

  // Update state when data changes
  useEffect(() => {
    if (data) {
      setLoanUnit(data.loan_unit);
      setLoanTaken(data.loan_amount_collected);
    }
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(value || 0);
  };

  return (
    <>
      {/* Loan Unit */}
      <div className="bg-white p-6 flex justify-between rounded-lg shadow">
        <div>
          <h3 className="font-medium text-md">Loan Unit</h3>
          <p className="text-xl text-gray-900 font-bold mt-2">
            {formatCurrency(loanUnit)}
          </p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Loan Taken */}
      <div className="bg-white p-6 flex justify-between rounded-lg shadow">
        <div>
          <h3 className="font-medium text-md">Loan Taken</h3>
          <p className="text-xl text-gray-900 font-bold mt-2">
            {formatCurrency(loanTaken)}
          </p>
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