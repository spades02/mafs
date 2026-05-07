declare module "better-auth/types" {
    interface User {
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      subscriptionStatus: string | null;
      isPro: boolean;
      isElite: boolean;
      subscriptionTier: "free" | "pro" | "elite";
      analysisCount: number;
    }
  }