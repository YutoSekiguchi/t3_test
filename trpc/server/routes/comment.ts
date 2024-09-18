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
    getComments: publicProcedure.input(
      z.object({
        postId: z.string(),
      })
    ).query(async ({ input }) => {
      try {
        const { postId } = input;

        const comments = await prisma.comment.findMany({
          where: {
            postId,
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
          orderBy: {
            updatedAt: "desc",
          },
        });

        return { comments }
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "コメント一覧取得に失敗しました",
        });
      }
    }),
    getCommentById: publicProcedure.input(
      z.object({
        commentId: z.string(),
      })
    ).query(async ({ input }) => {
      try {
        const { commentId } = input;

        const comment = await prisma.comment.findUnique({
          where: {
            id: commentId,
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
        });

        return comment;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "コメント取得に失敗しました",
        });
      }
    }),
    updateComment: privateProcedure.input(
      z.object({
        commentId: z.string(),
        content: z.string(),
      })
    ).mutation(async ({ input, ctx }) => {
      try {
        const { commentId, content } = input;
        const userId = ctx.user.id;

        const comment = await prisma.comment.findUnique({
          where: {
            id: commentId,
          },
        });

        if (!comment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "コメントが見つかりません",
          });
        }

        if (userId !== comment.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "コメントの更新権限がありません",
          });
        }

        await prisma.comment.update({
          where: {
            id: commentId,
          },
          data: {
            content,
          },
        });

        return comment;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "コメントの更新に失敗しました",
        });
      }
    }),

    deleteComment: privateProcedure.input(
      z.object({
        commentId: z.string(),
      })
    ).mutation(async ({ input, ctx }) => {
      try {
        const { commentId } = input;
        const userId = ctx.user.id;

        const comment = await prisma.comment.findUnique({
          where: {
            id: commentId,
          },
        });

        if (!comment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "コメントが見つかりません",
          });
        }

        if (userId !== comment.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "コメントの削除権限がありません",
          });
        }

        await prisma.comment.delete({
          where: {
            id: commentId,
          },
        });
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "コメントの削除に失敗しました",
        });
      }
    }),
});
