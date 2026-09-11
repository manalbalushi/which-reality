"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Form";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="secondary" size="sm" onClick={() => startTransition(() => markAllNotificationsRead())} disabled={pending}>
      {pending ? "Marking…" : "Mark all as read"}
    </Button>
  );
}
