import { sendEmail } from "@/actions/sendEmail";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

interface SendForgotPasswordOptions {
  userId: string;
}

export const sendForgotPassword = async ({ userId }: SendForgotPasswordOptions) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      PasswordResetToken: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        }
      }
  });

  if (!user || !user.email) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "ユーザが見つかりません",
    });
  }

  const token = user.PasswordResetToken[0]?.token;

  const resetPasswordLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  const subject = "パスワード再設定のご案内";

  const body = `
    <div>
    <p>
      ご利用いただきありがとうございます。<br>
      パスワード再設定のためのリンクをお送りします。
    </p>

    <p><a href="${resetPasswordLink}">パスワード再設定</a></p>

    <p>このリンクの有効期限は1日です。</p>
    <p>もし心当たりがない場合は、このメールを破棄してください。</p>
    </div>
  `;

  await sendEmail(
    subject,
    body,
    user.email,
  );
}