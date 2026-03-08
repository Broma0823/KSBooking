"use client";

import { useState, useTransition } from "react";

const STATUS_OPTIONS = [
  "NEW",
  "PENDING_PAYMENT",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

type Status = (typeof STATUS_OPTIONS)[number];

export function BookingStatusControl({
  bookingId,
  initialStatus,
}: {
  bookingId: number;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Status) {
    setStatus(next);
    startTransition(async () => {
      try {
        await fetch(`/api/admin/bookings/${bookingId}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: next }),
        });
      } catch (err) {
        console.error("Failed to update booking status", err);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as Status)}
        className="rounded-full border border-zinc-300 bg-white px-2 py-1 text-[11px] text-zinc-800"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace("_", " ")}
          </option>
        ))}
      </select>
      {isPending && (
        <span className="text-[10px] text-zinc-400">Saving…</span>
      )}
    </div>
  );
}

