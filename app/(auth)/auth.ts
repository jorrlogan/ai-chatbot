import { compare } from 'bcrypt-ts';
import NextAuth, { type Session, type User as BaseUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUser } from '@/lib/db/queries';

import { authConfig } from './auth.config';

export interface User extends BaseUser {
  id: string;
  orgId?: string;
}

export interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].password!);
        if (!passwordsMatch) return null;
        return users[0] as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as User;
        token.id = typedUser.id;
        token.orgId = typedUser.orgId;
      }

      return token;
    },
    async session({ session, token }) {
      const sess = session as ExtendedSession;
      if (sess.user) {
        sess.user.id = token.id as string;
        sess.user.orgId = token.orgId as string;
      }
      return sess;
    },
  },
});
