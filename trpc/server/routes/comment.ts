import { publicProcedure, privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import prisma from "@/lib/prisma";

export const commentRouter = router({
  createComment: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { postId, content } = input;
        const userId = ctx.user.id;

        const comment = await prisma.comment.create({
          data: {
            userId,
            postId,
            content,
          },
        });

        return comment;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "コメントの作成に失敗しました",
        });
      }
    }),
});
