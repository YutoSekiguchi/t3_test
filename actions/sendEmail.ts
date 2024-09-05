import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";

// メール送信
const transporter = nodemailer.createTransport({
  pool: true,
  service: "gmail",
  auth: {
    user: process.env.EMAIL!,
    pass: process.env.EMAIL_PASSWORD,
  },
  port: 465,
  maxConnections: 1,
})

export const sendEmail = async (
  subject: string,
  body: string,
  sendTo: string
) => {
  const mailOptions = {
    from: `YUTO SEKIGUCHI <${process.env.EMAIL}>`,
    to: sendTo,
    subject: subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "メール送信に失敗しました",
      });
    }
  })
}