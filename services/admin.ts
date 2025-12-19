import axios from "axios";
import { UserWithRelations } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const adminService = {
  async getUsers(token: string): Promise<UserWithRelations[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 10000 // 10 seconds timeout
      });

      if (!response.data?.data) {
        throw new Error("Invalid response format from server");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("API Error:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error("Session expired. Please login again.");
      }
      
      if (error.response?.status === 403) {
        throw new Error("You don't have permission to access this resource.");
      }

      throw new Error(error.response?.data?.message || "Failed to fetch users");
    }
  },
};