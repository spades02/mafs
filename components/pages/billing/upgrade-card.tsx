"use client";

import { Button } from "@/components/ui/button";

export default function UpgradeCard({ isPro }: { isPro: boolean }) {
  const upgrade = async () => {
    const res = await fetch("/api/stripe/subscribe", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  if (isPro) {
    return (
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-semibold">MAFS Pro</h3>
        <p className="text-sm text-muted-foreground">
          Unlimited fight card analysis
        </p>
        <p className="mt-2 font-medium text-green-600">
          You’re on Pro 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
      <p className="text-sm text-muted-foreground">
        Unlock unlimited fight card analysis
      </p>
      <Button className="mt-4" onClick={upgrade}>
        Upgrade
      </Button>
    </div>
  );
}
