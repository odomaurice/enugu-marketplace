'use client'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentAPI } from '@/lib/api/compliance';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const useConsentInfiniteQuery = () => {
   const { data: clientSession } = useSession();
   const [serverUser, setServerUser] = useState(null);
   const [isLoading, setIsLoading] = useState(true);


   useEffect(() => {
         fetch('/api/auth/session')
           .then(res => res.json())
           .then(setServerUser)
           .catch(console.error)
           .finally(() => setIsLoading(false));
       }, []);
   
     const user = clientSession?.user || serverUser;
  const token = user?.token;

  return useInfiniteQuery({
    queryKey: ['compliance'],
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
      if (!token) throw new Error('No authentication token');
      return consentAPI.getAllCompliance(Number(pageParam), 10, token);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = lastPage.pagination?.pages || 1;
      
      // If we have more pages to fetch, return the next page number
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      
      // Otherwise, return undefined to stop fetching
      return undefined;
    },
    enabled: !!token,
  });
};

export const useConsentMutation = () => {
const { data: clientSession } = useSession();
   const [serverUser, setServerUser] = useState(null);
   const [isLoading, setIsLoading] = useState(true);


   useEffect(() => {
         fetch('/api/auth/session')
           .then(res => res.json())
           .then(setServerUser)
           .catch(console.error)
           .finally(() => setIsLoading(false));
       }, []);
   
     const user = clientSession?.user || serverUser;
  const token = user?.token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ complianceId, status }: { complianceId: string; status: 'APPROVED' | 'DENIED' }) => {
      if (!token) throw new Error('No authentication token');
      return consentAPI.updateComplianceStatus(complianceId, status, token);
    },
    onSuccess: () => {
      // Invalidate and refetch compliance data
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });
};