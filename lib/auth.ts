import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from 'jsonwebtoken';

// Enhanced error handling
class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  
  // Remove basePath for Next.js 15 - it's deprecated
  // The API routes will automatically be at /api/auth/*
  
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
      async authorize(credentials, req) {
        try {
          console.log('🔐 Admin login attempt started');

          if (!credentials?.identifier || !credentials?.password) {
            throw new AuthError('Email and password are required', 'MISSING_CREDENTIALS');
          }

          console.log('📡 Calling API:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin-login`);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin-login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                identifier: credentials.identifier,
                password: credentials.password
              }),
            }
          );

          const data = await response.json();
          
          console.log('📡 Admin API Response status:', response.status);
          console.log('📡 Admin API Response data:', JSON.stringify(data, null, 2));

          if (!response.ok) {
            console.log('❌ API error response:', data);
            const errorMessage = data.message || `Login failed with status: ${response.status}`;
            throw new AuthError(errorMessage, 'API_ERROR');
          }

          if (!data.success) {
            console.log('❌ API success: false', data);
            throw new AuthError(data.message || 'Login failed', 'LOGIN_FAILED');
          }

          if (!data.token) {
            console.log('❌ No token in response');
            throw new AuthError('No authentication token received', 'NO_TOKEN');
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
            console.log('❌ No admin data found');
            throw new AuthError('No admin data received', 'NO_USER_DATA');
          }

          console.log('✅ Admin data extracted successfully:', {
            id: adminData.id,
            email: adminData.email,
            name: `${adminData.firstname} ${adminData.lastname}`,
            role: adminData.role
          });

          const role = adminData.role === 'fulfillment_officer' ? 'fulfillment_officer' : 'super_admin';

          const user = {
            id: adminData.id?.toString() || 'admin-id',
            userId: adminData.id?.toString(),
            name: `${adminData.firstname || adminData.firstName || adminData.firtname || ''} ${adminData.lastname || adminData.lastName || ''}`.trim(),
            email: adminData.email || adminData.mail || credentials.identifier,
            role: role,
            token: data.token,
            username: adminData.username,
            firstname: adminData.firstname,
            lastname: adminData.lastname,
            profile_image: adminData.profile_image,
            is_temp_password: adminData.is_temp_password,
            status: adminData.status || "ACTIVE"
          };

          console.log('✅ Returning user object for admin');
          return user;

        } catch (error: any) {
          console.error('💥 Admin auth error:', {
            message: error.message,
            code: error.code
          });
          
          if (error instanceof AuthError) {
            throw error;
          }
          throw new AuthError(error.message || 'Admin authentication failed', 'UNKNOWN_ERROR');
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
      async authorize(credentials, req) {
        try {
          console.log('🔐 Fulfillment officer login attempt started');

          if (!credentials?.identifier || !credentials?.password) {
            throw new AuthError('Email and password are required', 'MISSING_CREDENTIALS');
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/fulfillment-officer-login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                identifier: credentials.identifier,
                password: credentials.password
              }),
            }
          );

          const data = await response.json();
          
          console.log('📡 Fulfillment officer API Response status:', response.status);

          if (!response.ok) {
            console.log('❌ API error response:', data);
            throw new AuthError(
              data.message || `Login failed with status: ${response.status}`, 
              'API_ERROR'
            );
          }

          if (!data.success) {
            console.log('❌ API success: false', data);
            throw new AuthError(data.message || 'Fulfillment officer login failed', 'LOGIN_FAILED');
          }

          if (!data.token) {
            console.log('❌ No token in response');
            throw new AuthError('No authentication token received', 'NO_TOKEN');
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
            console.log('❌ No admin data found');
            throw new AuthError('No admin data received', 'NO_USER_DATA');
          }

          console.log('✅ Fulfillment officer data extracted:', adminData);

          const user = {
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

          console.log('✅ Returning user object for fulfillment officer:', user);
          return user;

        } catch (error: any) {
          console.error('💥 Fulfillment officer auth error:', error);
          
          if (error instanceof AuthError) {
            throw error;
          }
          throw new AuthError(error.message || 'Fulfillment officer authentication failed', 'UNKNOWN_ERROR');
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
      async authorize(credentials, req) {
        try {
          console.log('🔐 Cashier login attempt started');

          if (!credentials?.identifier || !credentials?.password) {
            throw new AuthError('Email and password are required', 'MISSING_CREDENTIALS');
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/cashier-login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                identifier: credentials.identifier,
                password: credentials.password
              }),
            }
          );

          const data = await response.json();
          
          console.log('📡 Cashier API Response status:', response.status);

          if (!response.ok) {
            console.log('❌ API error response:', data);
            throw new AuthError(
              data.message || `Cashier login failed with status: ${response.status}`, 
              'API_ERROR'
            );
          }

          if (!data.success) {
            console.log('❌ API success: false', data);
            throw new AuthError(data.message || 'Cashier login failed', 'LOGIN_FAILED');
          }

          if (!data.token) {
            console.log('❌ No token in response');
            throw new AuthError('No authentication token received', 'NO_TOKEN');
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
            console.log('❌ No cashier data found');
            throw new AuthError('No cashier data received', 'NO_USER_DATA');
          }

          console.log('✅ Cashier data extracted:', {
            id: cashierData.id,
            email: cashierData.email,
            name: `${cashierData.firstname} ${cashierData.lastname}`,
            role: cashierData.role
          });

          const user = {
            id: cashierData.id?.toString() || 'cashier-id',
            userId: cashierData.id?.toString(),
            name: `${cashierData.firstname || cashierData.firstName || cashierData.firtname || ''} ${cashierData.lastname || cashierData.lastName || ''}`.trim(),
            email: cashierData.email || cashierData.mail || credentials.identifier,
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

          console.log('✅ Returning user object for cashier:', user);
          return user;

        } catch (error: any) {
          console.error('💥 Cashier auth error:', error.message);
          
          if (error instanceof AuthError) {
            throw error;
          }
          throw new AuthError(error.message || 'Cashier authentication failed', 'UNKNOWN_ERROR');
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
      async authorize(credentials, req) {
        try {
          console.log('🔐 Employee OTP verification attempt started');

          if (!credentials?.userId || !credentials?.otp) {
            throw new AuthError('User ID and OTP are required', 'MISSING_CREDENTIALS');
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-otp`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                userId: credentials.userId,
                otp: credentials.otp
              }),
            }
          );

          const data = await response.json();
          
          console.log('📡 Employee OTP API Response status:', response.status);

          if (!response.ok) {
            console.log('❌ API error response:', data);
            throw new AuthError(
              data.message || `OTP verification failed with status: ${response.status}`, 
              'API_ERROR'
            );
          }

          if (!data.success) {
            console.log('❌ API success: false', data);
            throw new AuthError(data.message || 'OTP verification failed', 'LOGIN_FAILED');
          }

          if (!data.token) {
            console.log('❌ No token in response');
            throw new AuthError('No authentication token received', 'NO_TOKEN');
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
            console.log('❌ No user data found');
            throw new AuthError('No user data received', 'NO_USER_DATA');
          }

          console.log('✅ Employee data extracted:', userData);

          const user = {
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

          console.log('✅ Returning user object for employee:', user);
          return user;

        } catch (error: any) {
          console.error('💥 Employee auth error:', error);
          
          if (error instanceof AuthError) {
            throw error;
          }
          throw new AuthError(error.message || 'Employee authentication failed', 'UNKNOWN_ERROR');
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      console.log('🔐 SignIn callback - user role:', user?.role);
      
      // If user exists, allow sign in
      if (user) {
        console.log('✅ SignIn allowed for user:', user.email);
        return true;
      }
      
      // If no user, redirect to error with proper error message
      console.log('❌ SignIn denied - no user object');
      return `/auth/error?error=${encodeURIComponent('Authentication failed: No user data returned')}`;
    },

    async jwt({ token, user, trigger, session }) {
      try {
        console.log('🔄 JWT callback - trigger:', trigger);

        if (user) {
          console.log('✅ Adding user data to JWT token');
          token = {
            ...token,
            id: String(user.id || ''),
            userId: String(user.userId || user.id || ''),
            name: String(user.name || ''),
            email: String(user.email || ''),
            role: String(user.role || ''),
            token: String(user.token || ''),
            status: String(user.status || 'ACTIVE'),
            ...(user.username && { username: String(user.username) }),
            ...(user.firstname && { firstname: String(user.firstname) }),
            ...(user.lastname && { lastname: String(user.lastname) }),
            ...(user.profile_image && { profile_image: String(user.profile_image) }),
            ...(typeof user.is_temp_password !== 'undefined' && { 
              is_temp_password: Boolean(user.is_temp_password) 
            }),
          };
        }
        
        if (trigger === "update" && session?.user) {
          console.log('🔄 Updating JWT token with session data');
          token = { ...token, ...session.user };
        }
        
        return token;
      } catch (error) {
        console.error('❌ JWT callback error:', error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        console.log('🔄 Session callback - token role:', token.role);
        
        const safeSession = {
          ...session,
          user: {
            id: String(token.id || ''),
            userId: String(token.userId || token.id || ''),
            name: String(token.name || ''),
            email: String(token.email || ''),
            role: String(token.role || ''),
            token: String(token.token || ''),
            status: String(token.status || 'ACTIVE'),
            ...(token.username && { username: String(token.username) }),
            ...(token.firstname && { firstname: String(token.firstname) }),
            ...(token.lastname && { lastname: String(token.lastname) }),
            ...(token.profile_image && { profile_image: String(token.profile_image) }),
            ...(typeof token.is_temp_password !== 'undefined' && { 
              is_temp_password: Boolean(token.is_temp_password) 
            }),
          }
        };

        console.log('✅ Session created successfully for:', safeSession.user.email);
        return safeSession;
        
      } catch (error) {
        console.error('❌ Session callback error:', error);
        return {
          ...session,
          user: {
            id: '',
            name: '',
            email: '',
            role: '',
            token: '',
            status: 'ERROR'
          }
        };
      }
    },

    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback - url:', url, 'baseUrl:', baseUrl);
      
      // Handle successful authentication redirect
      if (url.includes('/api/auth/callback') || url.includes('/api/auth/signin')) {
        console.log('✅ Successful login, redirecting to dashboard');
        return `${baseUrl}/dashboard`;
      }
      
      // Handle error redirects properly
      if (url.includes('/api/auth/error')) {
        try {
          const errorUrl = new URL(url, baseUrl);
          const error = errorUrl.searchParams.get('error');
          
          console.log('❌ Auth error redirect:', error);
          
          if (error) {
            return `${baseUrl}/auth/error?error=${encodeURIComponent(error)}`;
          }
        } catch (e) {
          console.error('Error parsing error URL:', e);
        }
        return `${baseUrl}/auth/error?error=${encodeURIComponent('Authentication failed')}`;
      }
      
      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Allow same-origin URLs
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch (e) {
        console.error('Invalid URL in redirect:', url);
      }
      
      // Default to base URL
      return baseUrl;
    }
  },
};

export async function getServerUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user;
  } catch (error) {
    console.error('❌ getServerUser error:', error);
    return null;
  }
}