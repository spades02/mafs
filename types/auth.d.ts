declare module "better-auth/types" {
    interface User {
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      subscriptionStatus: string | null;
      isPro: boolean;
      analysisCount: number;
    }
  }