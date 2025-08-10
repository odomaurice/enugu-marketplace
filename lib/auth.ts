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

          return {
            id: data.admin?.id?.toString(),
            userId: data.admin?.id?.toString(),
            name: `${data.admin?.firstname} ${data.admin?.lastname}`.trim(),
            email: data.admin?.email,
            role: "admin",
            token: data.token,
            image: data.admin?.profile_image
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

          const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
          const userData = tokenPayload.user;

          return {
            id: userData.id || data.userId?.toString(),
            userId: data.userId?.toString(),
            name: `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || `Employee ${data.userId}`,
            email: userData.email || `${data.userId}@enugufoodbank.com`,
            role: "user",
            token: data.token,
            image: userData.profile_image || null
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
        return {
          ...token,
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          token: user.token,
          image: user.image
        };
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        userId: token.userId as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as string,
        token: token.token as string,
        image: token.image as string | null
      };
      return session;
    },

    async redirect({ url, baseUrl }) {

      // If redirecting after login, use the stored returnUrl
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