import { router } from "./trpc";
import { authRouter } from "@/trpc/server/routes/auth";
import { userRouter } from "@/trpc/server/routes/user";
import { postRouter } from "@/trpc/server/routes/post";
import { commentRouter } from "@/trpc/server/routes/comment";

export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
  comment: commentRouter,
})

export type AppRouter = typeof appRouter