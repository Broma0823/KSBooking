import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { BookingStatus } from "@/generated/prisma/enums";

export async function POST(
  request: Request,
  context: { params: { id: string } },
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = (await request.json()) as { status?: keyof typeof BookingStatus };

  if (!status || !(status in BookingStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const bookingId = Number(context.params.id);

  if (Number.isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
    },
  });

  return NextResponse.json({ booking }, { status: 200 });
}

