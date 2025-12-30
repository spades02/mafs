"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

interface PaymentCardProps {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    isPro: boolean;
    analysisCount: number;
    createdAt: Date;
    updatedAt: Date;
    
    // Use '?' for fields that might be missing from the object
    name?: string | null;
    image?: string | null;
    passwordHash?: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: string | null;
  } | null | undefined; // Added undefined here to match the component's input
}

function PaymentCard({ user }: PaymentCardProps) {
 // assume this returns DB user with isPro & analysisCount
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/subscribe", { method: "POST" });
      
      // Check if response is ok
      if (!res.ok) {
        console.error("Response status:", res.status);
        const text = await res.text();
        console.error("Response text:", text);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Check if response has content
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Response is not JSON");
      }
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL in response:", data);
      }
    } catch (err) {
      console.error("Upgrade error:", err);
    }
    finally{
    setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent>
        {!user ? (
          <p>Loading...</p>
        ) : user.isPro ? (
          <>
            <p className="mb-4">You are a Pro user. Unlimited fight analyses!</p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleManageSubscription}
              disabled={loading}
            >
              {loading ? "Loading..." : "Manage Subscription"}
            </Button>
          </>
        ) : (
          <>
            <p className="mb-2">
              Free user. {3 - user.analysisCount} free analyses left.
            </p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? "Loading..." : "Upgrade to Pro"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentCard;
