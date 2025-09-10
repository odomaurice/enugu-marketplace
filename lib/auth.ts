import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 60 * 60, // 1 hour
  },

  pages: {
    signOut: '/',
    error: '/auth/error',
    verifyRequest: '/auth/verify-otp',
    newUser: '/auth/new-user'
  },

  providers: [
    CredentialsProvider({
      id: "super_admin",
      name: "Admin",
      credentials: {
        identifier: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(
            'https://enugu-state-food-bank.onrender.com/api/v1/auth/admin-login',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                identifier: credentials?.identifier,
                password: credentials?.password
              }),
            }
          );

          const data = await response.json();
          
          console.log('Admin login API response:', data); // Debug log
          
          // Check if the response indicates success
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed');
          }

          // Extract admin data from the token since it seems to be encoded there
          let adminData: any = null;
          
          if (data.token) {
            try {
              // Decode the JWT token to get the admin data
              const decoded: any = jwt.decode(data.token);
              console.log('Decoded JWT token:', decoded);
              
              if (decoded && decoded.admin) {
                adminData = decoded.super_admin;
              }
            } catch (decodeError) {
              console.error('Error decoding JWT token:', decodeError);
            }
          }

          // Fallback to direct data extraction if token decoding fails
          if (!adminData) {
            adminData = data.admin || data.super_admin || data.data;
          }

          if (!adminData) {
            throw new Error('No admin data received');
          }

          console.log('Extracted admin data:', adminData); // Debug log

          // Return the user object that will be stored in the session
          return {
            id: adminData.id?.toString(),
            userId: adminData.id?.toString(),
            name: `${adminData.firstname || adminData.firstName || adminData.firtname || ''} ${adminData.lastname || adminData.lastName || ''}`.trim(),
            email: adminData.email || adminData.mail,
            role: "super_admin",
            token: data.token,
            username: adminData.username,
            status: adminData.status || "ACTIVE"
          };
        } catch (error: any) {
          console.error('Admin auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Employee",
      credentials: {
        userId: { label: "User ID", type: "text" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(
            'https://enugu-state-food-bank.onrender.com/api/v1/auth/verify-otp',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                userId: credentials?.userId,
                otp: credentials?.otp
              }),
            }
          );

          const data = await response.json();
          
          console.log('Employee login API response:', data); // Debug log
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'OTP verification failed');
          }

          // Extract user data from the token
          let userData: any = null;
          
          if (data.token) {
            try {
              // Decode the JWT token to get the user data
              const decoded: any = jwt.decode(data.token);
              console.log('Decoded JWT token:', decoded);
              
              if (decoded && decoded.user) {
                userData = decoded.user;
              }
            } catch (decodeError) {
              console.error('Error decoding JWT token:', decodeError);
            }
          }

          // Fallback to direct data extraction if token decoding fails
          if (!userData) {
            userData = data.user || data.data;
          }

          if (!userData) {
            throw new Error('No user data received');
          }

          console.log('Extracted user data:', userData); // Debug log

          // Return the user object for the session
          return {
            id: userData.id?.toString(),
            userId: userData.id?.toString(),
            name: `${userData.firstname || userData.firstName || userData.firtname || ''} ${userData.lastname || userData.lastName || ''}`.trim(),
            email: userData.email || userData.mail,
            role: "user",
            token: data.token,
            status: userData.status || "PENDING",
            is_compliance_submitted: userData.is_compliance_submitted || false,
            loan_unit: Number(userData.loan_unit ?? 0),
            loan_amount_collected: Number(userData.loan_amount_collected ?? 0),
            salary_per_month: Number(userData.salary_per_month ?? 0),
            government_entity: userData.government_entity ?? '',
            phone: userData.phone,
            employee_id: userData.employee_id
          };
        } catch (error: any) {
          console.error('Employee auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        return { ...token, ...user };
      }
      
      // Handle session updates if needed
      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user };
      }
      
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
          token: token.token as string,
          status: token.status as string,
          // Include all other properties that might be needed
          ...(token.role === "super_admin" ? {
            username: token.username as string,
          } : {
            is_compliance_submitted: token.is_compliance_submitted as boolean,
            loan_unit: token.loan_unit as number,
            loan_amount_collected: token.loan_amount_collected as number,
            salary_per_month: token.salary_per_month as number,
            government_entity: token.government_entity as string,
            phone: token.phone as string,
            employee_id: token.employee_id as string,
          })
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.includes('/employee-dashboard')) {
        const parsedUrl = new URL(url, baseUrl);
        const returnUrl = parsedUrl.searchParams.get('returnUrl');
        if (returnUrl) {
          return `${baseUrl}${returnUrl}`;
        }
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  }
};

// export async function getServerUser() {
//   const session = await getServerSession(authOptions);
//   console.log('Server session:', session);
//   return NextResponse.json(JSON.parse(JSON.stringify(session?.user || null)));
// }

export async function getServerUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}