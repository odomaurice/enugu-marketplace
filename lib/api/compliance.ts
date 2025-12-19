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

// Helper function to determine the base endpoint based on user role
const getBaseEndpoint = (role: 'admin' | 'fulfillment_officer') => {
  return role === 'admin' ? 'admin' : 'fulfillment_officer';
};

export const consentAPI = {
  // Get all compliance forms with pagination (works for both admin and agent)
  getAllCompliance: async (
    page: number = 1, 
    limit: number = 10, 
    token: string,
    role: 'admin' | 'fulfillment_officer' = 'admin' // Default to admin for backward compatibility
  ): Promise<ConsentResponse> => {
    const baseEndpoint = getBaseEndpoint(role);
    const endpoint = role === 'admin' 
      ? `${BASE_URL}/admin/all-compliance` 
      : `${BASE_URL}/agent/all-compliance`;
    
    const response = await fetch(
      `${endpoint}?page=${page}&limit=${limit}`,
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

  // Get single compliance form (works for both admin and agent)
  getCompliance: async (
    complianceId: string, 
    token: string,
    role: 'admin' | 'fulfillment_officer' = 'admin'
  ): Promise<SingleComplianceResponse> => {
    const baseEndpoint = getBaseEndpoint(role);
    const endpoint = role === 'admin'
      ? `${BASE_URL}/admin/get-compliance`
      : `${BASE_URL}/agent/get-compliance`;
    
    const response = await fetch(
      `${endpoint}?compliance_id=${complianceId}`,
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

  // Update compliance status (admin only - agents typically can't approve/deny)
  updateComplianceStatus: async (
    complianceId: string, 
    status: 'APPROVED' | 'DENIED', 
    token: string,
    role: 'admin' | 'fulfillment_officer' = 'admin'
  ): Promise<SingleComplianceResponse> => {
    // Agents typically don't have permission to update compliance status
    if (role === 'fulfillment_officer') {
      throw new Error('Agents are not authorized to update compliance status');
    }
    
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

  // Additional agent-specific methods
  agentAPI: {
    // Get compliance forms assigned to specific agent
    getAssignedCompliance: async (
      page: number = 1, 
      limit: number = 10, 
      token: string
    ): Promise<ConsentResponse> => {
      const response = await fetch(
        `${BASE_URL}/agent/assigned-compliance?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch assigned compliance forms');
      }
      
      return response.json();
    },

    // Update compliance form details (agent might be able to add notes or update progress)
    updateComplianceDetails: async (
      complianceId: string, 
      updates: any, // Define proper type based on what agents can update
      token: string
    ): Promise<SingleComplianceResponse> => {
      const response = await fetch(
        `${BASE_URL}/agent/approve-deny-compliance?compliance_id=${complianceId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update compliance details');
      }
      
      return response.json();
    },
  },

  // Additional admin-specific methods
  adminAPI: {
    // Assign compliance form to agent (admin only)
    assignComplianceToAgent: async (
      complianceId: string, 
      agentId: string, 
      token: string
    ): Promise<SingleComplianceResponse> => {
      const response = await fetch(
        `${BASE_URL}/admin/assign-compliance?compliance_id=${complianceId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ agentId }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to assign compliance to agent');
      }
      
      return response.json();
    },

    // Get compliance statistics (admin only)
    getComplianceStats: async (token: string): Promise<any> => {
      const response = await fetch(
        `${BASE_URL}/admin/compliance-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch compliance statistics');
      }
      
      return response.json();
    },
  },
};

// Usage examples:
/*
// For admin
const adminCompliance = await consentAPI.getAllCompliance(1, 10, adminToken, 'admin');

// For agent  
const agentCompliance = await consentAPI.getAllCompliance(1, 10, agentToken, 'agent');

// Admin updating status
await consentAPI.updateComplianceStatus('123', 'APPROVED', adminToken, 'admin');

// Agent getting assigned forms
const assignedForms = await consentAPI.agentAPI.getAssignedCompliance(1, 10, agentToken);

// Admin assigning to agent
await consentAPI.adminAPI.assignComplianceToAgent('123', 'agent456', adminToken);
*/