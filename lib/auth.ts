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

          // ONLY use fresh data from server response - NO token decoding!
          return {
            ...data.admin, // Fresh data from server
            id: data.admin?.id?.toString(),
            userId: data.admin?.id?.toString(),
            name: `${data.admin?.firstname} ${data.admin?.lastname}`.trim(),
            token: data.token,
            role: "admin",
            status: data.admin?.status || "ACTIVE"
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

          // ONLY use fresh data from server response - NO token decoding!
          return {
            ...data.user, // Fresh data from server
            id: data.user?.id?.toString(),
            userId: data.user?.employee_id,
            name: `${data.user?.firstname} ${data.user?.lastname}`.trim(),
            token: data.token,
            role: "user",
            status: data.user?.status || "PENDING",
            is_compliance_submitted: data.user?.is_compliance_submitted || false,
            loan_unit: data.user?.loan_unit ?? 0,
            loan_amount_collected: data.user?.loan_amount_collected ?? 0,
            salary_per_month: data.user?.salary_per_month ?? 0,
            government_entity: data.user?.government_entity ?? ''
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
        // Only use the fresh user data from authorize function
        // NO token decoding - that would give us old data!
        if (user.role === "admin") {
          return {
            ...token,
            ...user, // Fresh data from server
            role: "admin"
          };
        } else {
          return {
            ...token,
            ...user, // Fresh data from server
            role: "user"
          };
        }
      }
      return token;
    },

    async session({ session, token }) {
      // NO token decoding here either - use the fresh data from jwt callback
      if (token.role === "admin") {
        session.user = {
          ...session.user,
          ...token, // Fresh data from jwt callback
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
          token: token.token as string,
          status: token.status as string || "ACTIVE"
        };
      } else {
        session.user = {
          ...session.user,
          ...token, // Fresh data from jwt callback
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
          token: token.token as string,
          status: token.status as string || "PENDING",
          is_compliance_submitted: token.is_compliance_submitted as boolean || false,
          loan_unit: Number(token.loan_unit ?? 0),
          loan_amount_collected: Number(token.loan_amount_collected ?? 0),
          salary_per_month: Number(token.salary_per_month ?? 0),
          government_entity: token.government_entity as string ?? ''
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