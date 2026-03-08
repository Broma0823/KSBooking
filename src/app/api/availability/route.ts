import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  const year = yearParam ? Number(yearParam) : new Date().getFullYear();
  const month = monthParam ? Number(monthParam) - 1 : new Date().getMonth();

  if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) {
    return NextResponse.json(
      { error: "Invalid year or month." },
      { status: 400 },
    );
  }

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  let bookings;
  try {
    bookings = await prisma.booking.findMany({
      where: {
        eventDate: {
          gte: start,
          lte: end,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        eventDate: true,
        startTime: true,
        durationMinutes: true,
        eventType: true,
      },
      orderBy: { eventDate: "asc" },
    });
  } catch (err) {
    console.error("Availability API DB error:", err);
    return NextResponse.json({
      year,
      month: month + 1,
      byDate: {},
    });
  }

  const byDate: Record<
    string,
    { startTime: string; durationMinutes: number; eventType: string }[]
  > = {};

  for (const b of bookings) {
    const dateStr = new Date(b.eventDate).toISOString().slice(0, 10);
    if (!byDate[dateStr]) {
      byDate[dateStr] = [];
    }
    byDate[dateStr].push({
      startTime: b.startTime,
      durationMinutes: b.durationMinutes,
      eventType: b.eventType,
    });
  }

  return NextResponse.json({
    year,
    month: month + 1,
    byDate,
  });
}
