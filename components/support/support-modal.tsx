"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageSquare } from "lucide-react";

type SupportType = "support" | "bug" | "feature_request" | "feedback";

const TYPE_LABELS: Record<SupportType, string> = {
  support: "Contact Support",
  bug: "Bug Report",
  feature_request: "Feature Request",
  feedback: "General Feedback",
};

export function SupportModal({
  defaultType = "support",
  triggerLabel,
  triggerIcon = true,
  triggerVariant = "outline",
  className,
}: {
  defaultType?: SupportType;
  triggerLabel?: string;
  triggerIcon?: boolean;
  triggerVariant?: "default" | "outline" | "ghost";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<SupportType>(defaultType);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setType(defaultType);
    setSubject("");
    setBody("");
    setError(null);
    setSuccess(false);
    setSubmitting(false);
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject, body }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Failed (${res.status})`);
      }
      setSuccess(true);
      setSubject("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={className}>
          {triggerIcon ? <MessageSquare className="h-4 w-4 mr-2" /> : null}
          {triggerLabel ?? TYPE_LABELS[defaultType]}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{success ? "Thanks — we got it." : TYPE_LABELS[type]}</DialogTitle>
          <DialogDescription>
            {success
              ? "Your message was sent to the MAFS team. We'll reply via email."
              : "Tell us what's going on. We read every message."}
          </DialogDescription>
        </DialogHeader>

        {!success && (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="support-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as SupportType)}>
                <SelectTrigger id="support-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Contact Support</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="feedback">General Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                placeholder="Short summary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="support-body">Message</Label>
              <textarea
                id="support-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="Details, steps to reproduce, screenshots links, anything that helps."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground/60">{body.length} / 5000</p>
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {success ? (
            <Button onClick={() => setOpen(false)}>Close</Button>
          ) : (
            <Button
              onClick={submit}
              disabled={submitting || !subject.trim() || !body.trim()}
            >
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Send
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
