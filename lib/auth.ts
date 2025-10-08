import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
    signIn: '/admin-login',
    signOut: '/',
    error: '/auth/error',
    verifyRequest: '/auth/verify-otp',
    newUser: '/auth/new-user'
  },

  providers: [
    CredentialsProvider({
      id: "admin_login",
      name: "Admin",
      credentials: {
        identifier: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Admin login attempt with:', {
            identifier: credentials?.identifier,
            hasPassword: !!credentials?.password
          });

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin-login`,
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
          
          console.log('📡 Admin API Response:', {
            status: response.status,
            success: data.success,
            message: data.message,
            hasToken: !!data.token,
            hasAdminData: !!data.admin,
            fullResponse: data
          });

          if (!response.ok) {
            console.log('❌ API returned error status:', response.status);
            throw new Error(data.message || `Login failed with status: ${response.status}`);
          }

          if (!data.success) {
            console.log('❌ API returned success: false');
            throw new Error(data.message || 'Login failed');
          }

          if (!data.token) {
            console.log('❌ No token in response');
            throw new Error('No authentication token received');
          }

          let adminData: any = null;
          
          if (data.token) {
            try {
              const decoded: any = jwt.decode(data.token);
              console.log('🔓 Decoded JWT:', decoded);
              
              if (decoded && decoded.admin) {
                adminData = decoded.admin;
              }
            } catch (decodeError) {
              console.error('Error decoding JWT token:', decodeError);
            }
          }

          if (!adminData) {
            adminData = data.admin || data.super_admin || data.data;
          }

          if (!adminData) {
            console.log('❌ No admin data found in token or response');
            throw new Error('No admin data received');
          }

          console.log('✅ Admin data extracted:', {
            id: adminData.id,
            email: adminData.email,
            name: `${adminData.firstname} ${adminData.lastname}`,
            role: adminData.role
          });

          const role = adminData.role === 'fulfillment_officer' ? 'fulfillment_officer' : 'super_admin';

          return {
            id: adminData.id?.toString() || 'admin-id',
            userId: adminData.id?.toString(),
            name: `${adminData.firstname || adminData.firstName || adminData.firtname || ''} ${adminData.lastname || adminData.lastName || ''}`.trim(),
            email: adminData.email || adminData.mail || credentials?.identifier,
            role: role,
            token: data.token,
            username: adminData.username,
            firstname: adminData.firstname,
            lastname: adminData.lastname,
            profile_image: adminData.profile_image,
            is_temp_password: adminData.is_temp_password,
            status: adminData.status || "ACTIVE"
          };
        } catch (error: any) {
          console.error('💥 Admin auth error:', error.message);
          throw new Error(error.message || 'Admin authentication failed');
        }
      },
    }),

    CredentialsProvider({
      id: "fulfillment_officer_login",
      name: "Fulfillment Officer",
      credentials: {
        identifier: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Fulfillment officer login attempt with:', {
            identifier: credentials?.identifier
          });

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/fulfillment-officer-login`,
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
          
          console.log('📡 Fulfillment officer API Response:', {
            status: response.status,
            success: data.success,
            message: data.message,
            hasToken: !!data.token
          });

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Fulfillment officer login failed');
          }

          let adminData: any = null;
          
          if (data.token) {
            try {
              const decoded: any = jwt.decode(data.token);
              console.log('🔓 Decoded JWT:', decoded);
              
              if (decoded && decoded.admin) {
                adminData = decoded.admin;
              }
            } catch (decodeError) {
              console.error('Error decoding JWT token:', decodeError);
            }
          }

          if (!adminData) {
            adminData = data.admin || data.data;
          }

          if (!adminData) {
            throw new Error('No admin data received');
          }

          console.log('✅ Fulfillment officer data extracted:', adminData);

          return {
            id: adminData.id?.toString(),
            userId: adminData.id?.toString(),
            name: `${adminData.firstname || adminData.firstName || adminData.firtname || ''} ${adminData.lastname || adminData.lastName || ''}`.trim(),
            email: adminData.email || adminData.mail,
            role: "fulfillment_officer",
            token: data.token,
            username: adminData.username,
            firstname: adminData.firstname,
            lastname: adminData.lastname,
            profile_image: adminData.profile_image,
            is_temp_password: adminData.is_temp_password,
            status: adminData.status || "ACTIVE"
          };
        } catch (error: any) {
          console.error('💥 Fulfillment officer auth error:', error);
          throw new Error(error.message || 'Fulfillment officer authentication failed');
        }
      },
    }),

    CredentialsProvider({
      id: "cashier_login",
      name: "Cashier",
      credentials: {
        identifier: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Cashier login attempt with:', {
            identifier: credentials?.identifier,
            hasPassword: !!credentials?.password
          });

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/cashier-login`,
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
          
          console.log('📡 Cashier API Response:', {
            status: response.status,
            success: data.success,
            message: data.message,
            hasToken: !!data.token,
            hasCashierData: !!data.cashier,
            fullResponse: data
          });

          if (!response.ok) {
            console.log('❌ API returned error status:', response.status);
            throw new Error(data.message || `Cashier login failed with status: ${response.status}`);
          }

          if (!data.success) {
            console.log('❌ API returned success: false');
            throw new Error(data.message || 'Cashier login failed');
          }

          if (!data.token) {
            console.log('❌ No token in response');
            throw new Error('No authentication token received');
          }

          let cashierData: any = null;
          
          if (data.token) {
            try {
              const decoded: any = jwt.decode(data.token);
              console.log('🔓 Decoded JWT:', decoded);
              
              if (decoded && decoded.cashier) {
                cashierData = decoded.cashier;
              }
            } catch (decodeError) {
              console.error('Error decoding JWT token:', decodeError);
            }
          }

          if (!cashierData) {
            cashierData = data.cashier || data.data;
          }

          if (!cashierData) {
            console.log('❌ No cashier data found in token or response');
            throw new Error('No cashier data received');
          }

          console.log('✅ Cashier data extracted:', {
            id: cashierData.id,
            email: cashierData.email,
            name: `${cashierData.firstname} ${cashierData.lastname}`,
            role: cashierData.role
          });

          return {
            id: cashierData.id?.toString() || 'cashier-id',
            userId: cashierData.id?.toString(),
            name: `${cashierData.firstname || cashierData.firstName || cashierData.firtname || ''} ${cashierData.lastname || cashierData.lastName || ''}`.trim(),
            email: cashierData.email || cashierData.mail || credentials?.identifier,
            role: "cashier",
            token: data.token,
            username: cashierData.username,
            firstname: cashierData.firstname,
            lastname: cashierData.lastname,
            profile_image: cashierData.profile_image,
            status: "ACTIVE",
            created_at: cashierData.created_at,
            updated_at: cashierData.updated_at
          };
        } catch (error: any) {
          console.error('💥 Cashier auth error:', error.message);
          throw new Error(error.message || 'Cashier authentication failed');
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
          console.log('🔐 Employee OTP verification attempt with:', {
            userId: credentials?.userId
          });

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-otp`,
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
          
          console.log('📡 Employee OTP API Response:', {
            status: response.status,
            success: data.success,
            message: data.message
          });
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'OTP verification failed');
          }

          let userData: any = null;
          
          if (data.token) {
            try {
              const decoded: any = jwt.decode(data.token);
              console.log('🔓 Decoded JWT:', decoded);
              
              if (decoded && decoded.user) {
                userData = decoded.user;
              }
            } catch (decodeError) {
              console.error('Error decoding JWT token:', decodeError);
            }
          }

          if (!userData) {
            userData = data.user || data.data;
          }

          if (!userData) {
            throw new Error('No user data received');
          }

          console.log('✅ Employee data extracted:', userData);

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
          console.error('💥 Employee auth error:', error);
          throw new Error(error.message || 'Employee authentication failed');
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('🔄 JWT callback - trigger:', trigger);
      console.log('📥 JWT token input:', token);
      console.log('👤 JWT user input:', user);

      if (user) {
        token = { ...token, ...user };
        console.log('✅ JWT after user merge:', token);
      }
      
      if (trigger === "update" && session?.user) {
        token = { ...token, ...session.user };
        console.log('🔄 JWT after session update:', token);
      }
      
      return token;
    },

    async session({ session, token }) {
      console.log('🔄 Session callback - token:', token);
      
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          userId: token.userId as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
          token: token.token as string,
          status: token.status as string,
        };

        // Handle admin, fulfillment officer, and cashier roles (all have similar properties)
        if (token.role === "super_admin" || token.role === "fulfillment_officer" || token.role === "cashier") {
          session.user = {
            ...session.user,
            username: token.username as string,
            firstname: token.firstname as string,
            lastname: token.lastname as string,
            profile_image: token.profile_image as string,
            is_temp_password: token.is_temp_password as boolean,
          };

          // Add cashier-specific fields if available
          if (token.role === "cashier") {
            session.user = {
              ...session.user,
              createdAt: token.created_at as string,
              updatedAt: token.updated_at as string,
            };
          }
        } else if (token.role === "user") {
          session.user = {
            ...session.user,
            is_compliance_submitted: token.is_compliance_submitted as boolean,
            loan_unit: token.loan_unit as number,
            loan_amount_collected: token.loan_amount_collected as number,
            salary_per_month: token.salary_per_month as number,
            government_entity: token.government_entity as string,
            phone: token.phone as string,
            employee_id: token.employee_id as string,
          };
        }
      }
      
      console.log('✅ Final session:', session);
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback - url:', url, 'baseUrl:', baseUrl);
      
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

export async function getServerUser() {
  const session = await getServerSession(authOptions);
  console.log('👤 getServerUser session:', session);
  return session?.user;
}