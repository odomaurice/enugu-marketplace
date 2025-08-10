import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    token: string;
    image?: string | null;
  }
  
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    token: string;
    image?: string | null;
  }
}