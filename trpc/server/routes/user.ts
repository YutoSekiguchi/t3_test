import { publicProcedure, privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import prisma from "@/lib/prisma";
import { createCloudImage, deleteCloudImage } from "@/actions/cloudImage";
import { extractPublicId } from "cloudinary-build-url";

export const userRouter = router({
  // ユーザ情報の更新
  updateUser: privateProcedure
    .input(
      z.object({
        name: z.string(),
        introduction: z.string().optional(),
        base64Image: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { name, introduction, base64Image } = input;
        const userId = ctx.user.id;
        let imageUrl;

        if (base64Image) {
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

          // 古い画像の削除
          if (user.image) {
            const publicId = extractPublicId(user.image);
            await deleteCloudImage(publicId);
          }

          imageUrl = await createCloudImage(base64Image);
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            name,
            introduction,
            ...(imageUrl && { image: imageUrl }),
          }
        })
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
    getUserByIdPost: publicProcedure.input(
      z.object({
        userId: z.string().optional(),
      })
    ).query(async ({ input }) => {
        try {
          const { userId } = input;

          if (!userId) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              id: userId,
            },
            include: {
              posts: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          });

          if(!user) {
            return null
          }
          
          return user
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
});
