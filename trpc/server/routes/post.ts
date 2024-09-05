import { publicProcedure, privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createCloudImage, deleteCloudImage } from "@/actions/cloudImage";
import { extractPublicId } from "cloudinary-build-url";
import prisma from "@/lib/prisma";

export const postRouter = router({
  createPost: privateProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        base64Image: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { title, content, base64Image } = input;
        const userId = ctx.user.id;
        let iamge_url;

        if (base64Image) {
          iamge_url = await createCloudImage(base64Image);
        }

        const post = await prisma.post.create({
          data: {
            userId,
            title,
            content,
            image: iamge_url,
          },
        });

        return post;
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
            message: "投稿に失敗しました",
          });
        }
      }
    }),
    getPosts: publicProcedure.query(async () => {
      try {
        // 投稿一覧取得
        const posts = await prisma.post.findMany({
          orderBy: {
            updatedAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        })
  
        return posts
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "投稿一覧取得に失敗しました",
        })
      }
    }),
});
