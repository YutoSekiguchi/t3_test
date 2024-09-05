import { getAuthSession } from "@/lib/nextauth";
import { initTRPC, TRPCError } from "@trpc/server";

const t = initTRPC.create();

// middlewareでログインユーザの取得
export const authMiddleware = t.middleware(async ({ next }) => {
  const user = await getAuthSession();

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      user,
    }
  })

})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(authMiddleware)