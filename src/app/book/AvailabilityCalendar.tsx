"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Slot = { startTime: string; durationMinutes: number; eventType: string };

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  if (h === 12) return `12:${m.toString().padStart(2, "0")} PM`;
  if (h === 0) return `12:${m.toString().padStart(2, "0")} AM`;
  if (h < 12) return `${h}:${m.toString().padStart(2, "0")} AM`;
  return `${h - 12}:${m.toString().padStart(2, "0")} PM`;
}

function endTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const totalM = h * 60 + m + durationMinutes;
  const eh = Math.floor(totalM / 60) % 24;
  const em = totalM % 60;
  return `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
}

export function AvailabilityCalendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [byDate, setByDate] = useState<Record<string, Slot[]>>({});
  const [clickedDate, setClickedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetch(
      `/api/availability?year=${year}&month=${month + 1}`,
      { signal: controller.signal },
    )
      .then((res) => res.json())
      .then((data: { byDate?: Record<string, Slot[]> }) => {
        setByDate(data.byDate ?? {});
      })
      .catch(() => setByDate({}))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [year, month]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  function handleDayClick(d: number) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    setClickedDate(dateStr);
    onSelectDate(dateStr);
  }

  const slots = clickedDate ? byDate[clickedDate] ?? [] : [];

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
        Choir availability
      </p>
      <p className="text-[11px] text-zinc-600">
        Click a day to see when the choir is already booked. Choose a free slot
        for your event.
      </p>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            if (month === 0) {
              setMonth(11);
              setYear((y) => y - 1);
            } else {
              setMonth((m) => m - 1);
            }
          }}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white"
        >
          ← Prev
        </button>
        <span className="text-sm font-semibold text-zinc-900">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => {
            if (month === 11) {
              setMonth(0);
              setYear((y) => y + 1);
            } else {
              setMonth((m) => m + 1);
            }
          }}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white"
        >
          Next →
        </button>
      </div>

      {loading ? (
        <p className="py-4 text-center text-xs text-zinc-500">
          Loading…
        </p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-zinc-600">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
            {days.map((d, i) => {
              if (d === null) {
                return <div key={`empty-${i}`} className="min-h-[32px]" />;
              }
              const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
              const hasBooking = Array.isArray(byDate[dateStr]) && byDate[dateStr].length > 0;
              const isSelected = selectedDate === dateStr || clickedDate === dateStr;
              const thisDay = new Date(year, month, d);
              const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isPast = thisDay < todayStart;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => !isPast && handleDayClick(d)}
                  disabled={isPast}
                  className={`min-h-[32px] rounded-md text-xs font-medium ${
                    isPast
                      ? "cursor-not-allowed text-zinc-300"
                      : isSelected
                        ? "bg-zinc-900 text-white"
                        : hasBooking
                          ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                          : "bg-white text-zinc-800 hover:bg-zinc-100"
                  }`}
                >
                  {d}
                  {hasBooking && !isSelected && (
                    <span className="block text-[8px] leading-tight">booked</span>
                  )}
                </button>
              );
            })}
          </div>

          {clickedDate && (
            <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3 text-xs">
              <p className="mb-2 font-semibold text-zinc-900">
                {new Date(clickedDate + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {slots.length === 0 ? (
                <p className="text-emerald-700">
                  No bookings yet – choir is available this day.
                </p>
              ) : (
                <ul className="space-y-1.5 text-zinc-700">
                  <p className="text-[11px] font-medium text-zinc-500">
                    Already booked:
                  </p>
                  {slots.map((s, i) => (
                    <li key={i}>
                      {formatTime(s.startTime)} –{" "}
                      {formatTime(endTime(s.startTime, s.durationMinutes))}{" "}
                      <span className="text-zinc-500">({s.eventType})</span>
                    </li>
                  ))}
                  <p className="pt-1 text-[11px] text-zinc-500">
                    Choose a different time for your event.
                  </p>
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
