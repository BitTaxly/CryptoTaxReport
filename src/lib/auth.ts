import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, User } from './userStore';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mode: { label: 'Mode', type: 'text' }, // 'login' or 'signup'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        const mode = credentials.mode || 'login';

        if (mode === 'signup') {
          // Check if user already exists
          const existingUser = await getUserByEmail(credentials.email);
          if (existingUser) {
            throw new Error('User with this email already exists');
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(credentials.password, 12);

          // Create new user
          const newUser = await createUser({
            email: credentials.email,
            password: hashedPassword,
            name: credentials.email.split('@')[0], // Use email prefix as default name
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
        } else {
          // Login mode
          const user = await getUserByEmail(credentials.email);

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};
