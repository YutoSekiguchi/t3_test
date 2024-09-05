import { publicProcedure, privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendForgotPassword } from "@/actions/sendForgotPassword";
import { sendResetPassword } from "@/actions/sendResetPassword";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

export const authRouter = router({
  // サインアップ
  signUp: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { name, email, password } = input;

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "すでに登録されているメールアドレスです",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.create({
          data: {
            name,
            email,
            hashPassword: hashedPassword,
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error",
          });
        }
      }
    }),

  // パスワードの変更
  updatePassword: privateProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { currentPassword, password } = input;
        const userId = ctx.user.id;

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザが見つかりません",
          });
        }

        if (!user.hashPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "パスワードが設定されていません",
          });
        }

        const isCorrectPasswordValid = await bcrypt.compare(
          currentPassword,
          user.hashPassword
        );

        if (!isCorrectPasswordValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "現在のパスワードが一致しません",
          });
        }

        const isSamePassword = await bcrypt.compare(
          password,
          user.hashPassword
        );

        if (isSamePassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "新しいパスワードが現在のパスワードと同じです",
          });
        }

        const newHashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            hashPassword: newHashedPassword,
          },
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error",
          });
        }
      }
    }),
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { email } = input;

        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザが見つかりません",
          });
        }

        // トークンの検索
        const existingToken = await prisma.passwordResetToken.findFirst({
          where: {
            userId: user.id,
            expiry: {
              gt: new Date(),
            },
            createdAt: {
              gt: new Date(Date.now() - ONE_HOUR),
            },
          },
        });

        if (existingToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "すでにリセットトークンが発行されています。1時間後に再度お試しください",
          });
        }

        const token = crypto.randomBytes(18).toString("hex");
        await prisma.passwordResetToken.create({
          data: {
            token,
            userId: user.id,
            expiry: new Date(Date.now() + ONE_DAY),
          },
        });

        // メールの送信
        await sendForgotPassword({
          userId: user.id,
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error",
          });
        }
      }
    }),
  getResetTokenValidity: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { token } = input;

        const foundToken = await prisma.passwordResetToken.findFirst({
          where: {
            token,
          },
          select: {
            id: true,
            expiry: true,
          },
        });

        return !!foundToken && foundToken.expiry > new Date();
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal Server Error",
        });
      }
    }),

  // パスワード再設定
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { token, password } = input

        // トークンの検索
        const foundToken = await prisma.passwordResetToken.findFirst({
          where: {
            token,
          },
          include: {
            User: true,
          },
        })

        if (!foundToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "無効なトークンです。再度パスワード再設定を行ってください",
          })
        }

        // 現在の日時
        const now = new Date()

        // トークンの期限が切れている場合
        if (now > foundToken.expiry) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "トークンの期限が切れています。再度パスワード再設定を行ってください",
          })
        }

        // 新しいパスワードと現在のパスワードを比較
        const isSamePassword = await bcrypt.compare(
          password,
          foundToken.User.hashPassword || ""
        )

        if (isSamePassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "現在のパスワードと同じパスワードは使用できません",
          })
        }

        // パスワードのハッシュ化
        const hashPassword = await bcrypt.hash(password, 12)

        await prisma.$transaction([
          // パスワードの更新
          prisma.user.update({
            where: {
              id: foundToken.userId,
            },
            data: {
              hashPassword,
            },
          }),
          // トークンの削除
          prisma.passwordResetToken.deleteMany({
            where: {
              userId: foundToken.userId,
            },
          }),
        ])

        // メールの送信
        await sendResetPassword({ userId: foundToken.userId })
      } catch (error) {
        console.log(error)

        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          })
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "エラーが発生しました",
          })
        }
      }
    }),
});
