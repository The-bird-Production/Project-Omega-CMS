import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default NextAuth({
  // Configurez les fournisseurs d'authentification
  providers: [
    Credentials({
      // Configuration pour l'authentification avec des identifiants
      credentials: {
        async authorize(credentials) {
          try {
            const formData = new URLSearchParams();
            formData.append("username", credentials.username);
            formData.append("password", credentials.password);
            // Appelez votre API avec les identifiants fournis par l'utilisateur
            const response = await fetch("http://localhost:3001/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: formData,
            });

            if (response.ok) {
              // Si les identifiants sont valides, renvoyez l'utilisateur
              const user = await response.json();
              return Promise.resolve(user);
            } else {
              // Si les identifiants sont invalides, renvoyez null
              return Promise.resolve(null);
            }
          } catch (error) {
            // Gérez les erreurs d'appel API
            console.error("Error authenticating user:", error);
            return Promise.resolve(null);
          }
        },
      },
    }),
  ],
  callbacks: {
    async onError(error, session, event) {
      console.error("NextAuth.onError", error);
    },
  },
  // Configurez d'autres options si nécessaire
});
