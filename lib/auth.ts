import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
      id: "admin",
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
          if (!response.ok) throw new Error(data.message || 'Login failed');

          // Decode token to get all admin data
          const tokenPayload = JSON.parse(
            Buffer.from(data.token.split('.')[1], 'base64').toString()
          );

          return {
            ...data.admin,
            ...tokenPayload.admin, // Note: using admin instead of user
            id: data.admin?.id?.toString(),
            userId: data.admin?.id?.toString(),
            name: `${data.admin?.firstname} ${data.admin?.lastname}`.trim(),
            token: data.token,
            role: "admin"
          };
        } catch (error: any) {
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
          if (!response.ok) throw new Error(data.message || 'OTP verification failed');

          // Decode token to get all user data
          const tokenPayload = JSON.parse(
            Buffer.from(data.token.split('.')[1], 'base64').toString()
          );

          return {
            ...data.user,
            ...tokenPayload.user,
            id: data.user?.id?.toString(),
            userId: data.user?.employee_id,
            name: `${data.user?.firstname} ${data.user?.lastname}`.trim(),
            token: data.token,
            role: "user",
            loan_unit: tokenPayload.user?.loan_unit ?? 0,
            loan_amount_collected: tokenPayload.user?.loan_amount_collected ?? 0,
            salary_per_month: tokenPayload.user?.salary_per_month ?? 0,
            government_entity: tokenPayload.user?.government_entity ?? ''
          };
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initialize tokenPayload with empty object
        let tokenPayload: any = { user: {}, admin: {} };
        
        try {
          if (user.token) {
            tokenPayload = JSON.parse(
              Buffer.from(user.token.split('.')[1], 'base64').toString()
            );
          }
        } catch (e) {
          console.error("Token decode error:", e);
        }

        // Handle admin vs user differently
        if (user.role === "admin") {
          return {
            ...token,
            ...user,
            ...(tokenPayload.admin || {}),
            // Admin-specific fields
            role: "admin"
          };
        } else {
          return {
            ...token,
            ...user,
            ...(tokenPayload.user || {}),
            // User-specific fields with fallbacks
            loan_unit: user.loan_unit ?? tokenPayload.user?.loan_unit ?? 0,
            loan_amount_collected: user.loan_amount_collected ?? tokenPayload.user?.loan_amount_collected ?? 0,
            salary_per_month: user.salary_per_month ?? tokenPayload.user?.salary_per_month ?? 0,
            government_entity: user.government_entity ?? tokenPayload.user?.government_entity ?? '',
            role: "user"
          };
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Initialize tokenPayload with empty object
      let tokenPayload: any = { user: {}, admin: {} };
      
      try {
        if (token.token) {
          tokenPayload = JSON.parse(
            Buffer.from(token.token.split('.')[1], 'base64').toString()
          );
        }
      } catch (e) {
        console.error("Token decode error:", e);
      }

      // Handle admin vs user differently
      if (token.role === "admin") {
        session.user = {
          ...session.user,
          ...token,
          ...(tokenPayload.admin || {}),
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
          token: token.token as string
        };
      } else {
        session.user = {
          ...session.user,
          ...token,
          ...(tokenPayload.user || {}),
          // User-specific fields with fallbacks
          loan_unit: Number(token.loan_unit ?? tokenPayload.user?.loan_unit ?? 0),
          loan_amount_collected: Number(token.loan_amount_collected ?? tokenPayload.user?.loan_amount_collected ?? 0),
          salary_per_month: Number(token.salary_per_month ?? tokenPayload.user?.salary_per_month ?? 0),
          government_entity: token.government_entity ?? tokenPayload.user?.government_entity ?? '',
          // Core fields
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
          token: token.token as string
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

export async function getServerUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}