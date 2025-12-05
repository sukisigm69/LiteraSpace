// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from "@/app/lib/actions";
import { compare } from "bcryptjs";

export const authOptions = {
  pages: { signIn: "/login" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials;

          const user = await getUserByEmail(email);
          console.log("User:", user);
          if (!user) return null;

          const isValid = await compare(password, user.password);
          console.log("Password valid:", isValid);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role,
            image:
              user.profile_image ||
              "https://i.pinimg.com/736x/ef/ed/b2/efedb22a7a6f6e4a18deb432228d137b.jpg",
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
