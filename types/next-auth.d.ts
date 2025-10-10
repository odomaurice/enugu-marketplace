import "next-auth";

declare module "next-auth" {
  interface User {
    // Common fields
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string; // This can now be "super_admin", "fulfillment_officer", "cashier", or "user"
    token: string;
    status?: string;
    is_temp_password?: boolean;
    
    // Employee-specific fields (optional)
    phone?: string;
    level?: string;
    employee_id?: string;
    government_entity?: string;
    salary_per_month?: number;
    loan_unit?: number;
    loan_amount_collected?: number;
    is_address_set?: boolean;
    is_compliance_submitted?: boolean; 
    
    // Admin/Cashier-specific fields (optional)
    username?: string;
    firstname?: string;
    lastname?: string;
    profile_image?: string | null;
    
    // Common optional fields
    image?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }
  
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    // Common fields
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    token: string;
    status?: string; 
    is_temp_password?: boolean;
    is_compliance_submitted?: boolean;
    
    // Employee-specific fields
    phone?: string;
    level?: string;
    employee_id?: string;
    government_entity?: string;
    salary_per_month?: number;
    loan_unit?: number;
    loan_amount_collected?: number;
    is_address_set?: boolean;
    
    // Admin/Cashier-specific fields
    username?: string;
    firstname?: string;
    lastname?: string;
    profile_image?: string | null;
    
    // Common optional fields
    image?: string | null;
  }
}