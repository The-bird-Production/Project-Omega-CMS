import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "name@exemple.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const formData = new URLSearchParams();
        formData.append("email", credentials.email);
        formData.append("password", credentials.password);
        // Appelez votre API avec les identifiants fournis par l'utilisateur
        const response = await fetch("http://localhost:3001/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });
        const user = await response.json();
        if (response.ok && user) {
          // Si les identifiants sont valides, renvoyez l'utilisateur
          console.log(user);
          return user;
        } else {
          // Si les identifiants sont invalides, renvoyez null
          return null;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async onError(error, session, event) {
      console.error("NextAuth.onError", error);
    },
    async session(session, user) {
      console.log(session);
      if (user) {
        session.user = user.data.data;
        session.authToken = user.data.token;
      } else {
        console.log("No user");
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
