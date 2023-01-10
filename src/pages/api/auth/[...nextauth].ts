import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../server/db/client";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {},
      authorize: async (credentials, req) => {
        const {username, password} = credentials as {
          username: string;
          password: string;
        }
        const user = await prisma.user.findUnique({where: {username}});
        if(!user || !await bcrypt.compare(password, user.password)) 
          return null;
        return {id: user.id, name: user.username};
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  // Include user.id on session
  callbacks: {
    jwt: ({token, user}) => {
      if(user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
