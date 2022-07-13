import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const default_user = process.env.DEFAULT_USERNAME
const default_pwd = process.env.DEFAULT_PWD
// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  // session: {
  //   jwt: true,
  // },
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const { username, password }  = credentials
        if(username === default_user && password === default_pwd){
          return {
            id: 1,
            name: 'test',
            email: 'test@a.com'
          }
        }
        return null
      }
    })
  ],
  secret: 'cat',
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin"
      return token
    },
  },
})
