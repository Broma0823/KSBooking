"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const HOUR_START = 8;
const HOUR_END = 20; // 8AM to 8PM (20:00 is end of last slot)

type BookingSlot = {
  startTime: string;
  durationMinutes: number;
  eventType: string;
};

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function slotIndexToTime(index: number): string {
  const h = HOUR_START + index;
  return `${h.toString().padStart(2, "0")}:00`;
}

function formatSlotLabel(index: number): string {
  const h = HOUR_START + index;
  const next = h + 1;
  const ampm = (hour: number) =>
    hour === 0
      ? "12AM"
      : hour === 12
        ? "12PM"
        : hour < 12
          ? `${hour}AM`
          : `${hour - 12}PM`;
  return `${ampm(h)}-${ampm(next)}`;
}

function isSlotBooked(
  slotIndex: number,
  bookings: BookingSlot[],
): boolean {
  const slotStartM = (HOUR_START + slotIndex) * 60;
  const slotEndM = (HOUR_START + slotIndex + 1) * 60;

  for (const b of bookings) {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = bStart + b.durationMinutes;
    if (bStart < slotEndM && bEnd > slotStartM) return true;
  }
  return false;
}

export function TimeSlotGrid({
  selectedDate,
  startTime,
  durationMinutes,
  onSelect,
}: {
  selectedDate: string;
  startTime: string;
  durationMinutes: number;
  onSelect: (startTime: string, durationMinutes: number) => void;
}) {
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [year, month] = selectedDate.split("-").map(Number);
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedIndices(new Set());
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetch(`/api/availability?year=${year}&month=${month}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { byDate?: Record<string, BookingSlot[]> }) => {
        setBookings(data.byDate?.[selectedDate] ?? []);
      })
      .catch(() => setBookings([]))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [selectedDate, year, month]);

  const slotCount = HOUR_END - HOUR_START;
  const bookedSlots = Array.from({ length: slotCount }, (_, i) =>
    isSlotBooked(i, bookings),
  );

  const isSlotSelectedByClicks = useCallback(
    (index: number) => selectedIndices.has(index),
    [selectedIndices],
  );

  const handleSlotClick = useCallback(
    (index: number) => {
      if (bookedSlots[index]) return;
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    },
    [bookedSlots],
  );

  useEffect(() => {
    if (selectedIndices.size === 0) {
      onSelectRef.current("", 0);
      return;
    }
    const sorted = [...selectedIndices].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    onSelectRef.current(slotIndexToTime(min), (max - min + 1) * 60);
  }, [selectedIndices]);

  if (!selectedDate) return null;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
        Select time slot
      </p>
      <p className="text-[11px] text-zinc-600">
        Click a slot to select it, click again to deselect. Grey slots are
        already booked.
      </p>

      <div className="mb-2 flex flex-wrap gap-3 text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-emerald-200" />
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-emerald-600" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-zinc-300" />
          Booked
        </span>
      </div>

      {loading ? (
        <p className="py-6 text-center text-xs text-zinc-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="grid grid-cols-[80px_1fr] text-sm">
            <div className="border-b border-r border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-medium text-zinc-600">
              Time
            </div>
            <div className="border-b border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-medium text-zinc-600">
              KS Choir
            </div>
            {Array.from({ length: slotCount }, (_, i) => (
              <React.Fragment key={i}>
                <div
                  className="border-r border-zinc-100 px-2 py-2 text-xs text-zinc-600"
                >
                  {formatSlotLabel(i)}
                </div>
                <div
                  className={`px-1 py-0.5 flex min-h-[40px] items-center justify-center rounded text-xs font-medium transition-colors ${
                    bookedSlots[i]
                      ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                      : isSlotSelectedByClicks(i)
                        ? "bg-emerald-600 text-white"
                        : "cursor-pointer bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                  }`}
                  onClick={() => handleSlotClick(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSlotClick(i);
                    }
                  }}
                  aria-label={`${formatSlotLabel(i)} ${bookedSlots[i] ? "Booked" : "Open"}`}
                >
                  {bookedSlots[i]
                    ? "Booked"
                    : isSlotSelectedByClicks(i)
                      ? "Selected"
                      : "Open"}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
