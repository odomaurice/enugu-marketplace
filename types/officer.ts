
export interface FulfillmentOfficer {
  id?: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOfficerPayload {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}