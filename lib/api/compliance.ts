
import { Consent, SingleComplianceResponse, UpdateComplianceStatus } from '@/types/compliance';

export interface ConsentResponse {
  message: string;
  data: Consent[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const consentAPI = {
  // Get all compliance forms with pagination
  getAllCompliance: async (page: number = 1, limit: number = 10, token: string): Promise<ConsentResponse> => {
    const response = await fetch(
      `${BASE_URL}/admin/all-compliance?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch compliance forms');
    }
    
    return response.json();
  },

  // Get single compliance form
  getCompliance: async (complianceId: string, token: string): Promise<SingleComplianceResponse> => {
    const response = await fetch(
      `${BASE_URL}/admin/get-compliance?compliance_id=${complianceId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch compliance form');
    }
    
    return response.json();
  },

  // Update compliance status
  updateComplianceStatus: async (
    complianceId: string, 
    status: 'APPROVED' | 'DENIED', 
    token: string
  ): Promise<SingleComplianceResponse> => {
    const response = await fetch(
      `${BASE_URL}/admin/approve-deny-compliance?compliance_id=${complianceId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update compliance status');
    }
    
    return response.json();
  },
};