import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { Session } from "next-auth";
import { createUser, fetchUser } from "./app/api/ddb";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    /**
     * Attach accessToken to user object so await auth() includes access token
     */
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (token?.accessToken) {
        // @ts-ignore
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user }) {
      if (user?.email) {
        const ddbUser = await fetchUser(user.email);
        if (!ddbUser) {
          console.log(`Creating base user on firt signin: ${JSON.stringify(user)}`);
          await createUser({ id: user.email, name: user.name || "", image: user.image || "", generation: "", gender: "" });
        }
        else console.log(`User already exists: ${JSON.stringify(user)}`);
      }

      return true;
    },
  },
});

export async function isUserAuthenticated(clientAccessToken: string | null) {
  if (!clientAccessToken) return false;
  // @ts-ignore
  const { accessToken: accessTokenServer } = await auth();
  return accessTokenServer === clientAccessToken;
}
