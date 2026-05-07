"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export function PushToggle({ initialOptIn }: { initialOptIn: boolean }) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setOptIn(initialOptIn);
  }, [initialOptIn]);

  const onChange = async (next: boolean) => {
    setOptIn(next);
    setPending(true);
    try {
      // Persist the preference on the user row.
      const res = await fetch("/api/push/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: next }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);

      // If turning OFF, also clear device tokens server-side. Re-enabling
      // will re-register on next dashboard visit.
      if (!next) {
        await fetch("/api/push/register", { method: "DELETE" }).catch(() => {});
        toast.success("Push notifications turned off");
      } else {
        toast.success("Push notifications turned on — reopen the app to register your device");
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't update preference");
      setOptIn(!next); // revert
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="push-toggle" className="text-base font-semibold cursor-pointer">
                Push notifications
              </Label>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Get a notification when each week's MAFS card is ready. Available in the iOS app.
              </p>
            </div>
          </div>
          <Switch
            id="push-toggle"
            checked={optIn}
            onCheckedChange={onChange}
            disabled={pending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
