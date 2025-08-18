import "next-auth";

declare module "next-auth" {
  interface User {
    // Common fields
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    token: string;
    
    // Employee-specific fields (optional)
    phone?: string;
    level?: string;
    employee_id?: string;
    government_entity?: string;
    salary_per_month?: number;
    loan_unit?: number;
    loan_amount_collected?: number;
    is_address_set?: boolean;
    
    // Admin-specific fields (optional)
    username?: string;
    
    // Common optional fields
    image?: string | null;
    firstname?: string;
    lastname?: string;
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
    
    // Employee-specific fields
    phone?: string;
    level?: string;
    employee_id?: string;
    government_entity?: string;
    salary_per_month?: number;
    loan_unit?: number;
    loan_amount_collected?: number;
    is_address_set?: boolean;
    
    // Admin-specific fields
    username?: string;
    
    // Common optional fields
    image?: string | null;
    firstname?: string;
    lastname?: string;
  }
}