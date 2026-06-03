import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [], // Configure providers here
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true; // Add actual auth logic for /admin routes later
    },
  },
});
