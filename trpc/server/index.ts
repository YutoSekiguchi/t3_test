import { router } from "./trpc";
import { authRouter } from "@/trpc/server/routes/auth";
import { userRouter } from "@/trpc/server/routes/user";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter