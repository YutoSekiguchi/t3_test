import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getServerSession, type NextAuthOptions } from 'next-auth'
import prisma from '@/lib/prisma'
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        // メールアドレスとパスワード
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        // メールアドレスとパスワードがない場合はエラー
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールアドレスとパスワードが存在しません")
        }

        // ユーザーを取得
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        // ユーザーが存在しない場合はエラー
        if (!user || !user?.hashPassword) {
          throw new Error("ユーザーが存在しません")
        }

        // パスワードが一致しない場合はエラー
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashPassword
        )

        if (!isCorrectPassword) {
          throw new Error("パスワードが一致しません")
        }

        return user
      },
    }),
  ],
  // セッションの設定
  session: {
    strategy: "jwt",
  },
}

export const getAuthSession = async() => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return null
  }

  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: session.user.email
    }
  })

  return user

}