import prisma from "@/lib/prisma";
import Stripe from "stripe";

const DAY_IN_MS = 86_400_000;

export const getSubscription = async ({ userId }: { userId: string | undefined }) => {
  try {
    if(!userId) {
      return {
        subscription: null,
        isSubscribed: false,
      }
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    });

    if(!subscription) {
      return {
        subscription: null,
        isSubscribed: false,
      }
    }

    const isSubscribed = subscription.status === "active" && subscription.currentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return {
      subscription,
      isSubscribed,
    }

  } catch (error) {
    console.error(error)
    return {
      subscription: null,
      isSubscribed: false,
    }
  }
}