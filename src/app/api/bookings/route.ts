import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma/enums";

type BookingPayload = {
  eventDate: string;
  startTime: string;
  durationMinutes: number;
  eventType: string;
  venueName: string;
  venueAddress: string;
  guestCount: number;
  packageKey: "silver" | "gold" | "platinum";
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
};

const defaultPackages = [
  {
    key: "silver",
    name: "Silver Ceremony",
    description: "Small ensemble, up to 3 songs for your ceremony.",
    basePrice: 1_000,
    defaultDepositAmount: 300,
  },
  {
    key: "gold",
    name: "Gold Ceremony +",
    description:
      "Ceremony music plus a short set during drinks or photos, with additional song choices.",
    basePrice: 1_600,
    defaultDepositAmount: 500,
  },
  {
    key: "platinum",
    name: "Platinum Event",
    description:
      "Extended performance time, bespoke arrangements, and on-site musical direction.",
    basePrice: 2_500,
    defaultDepositAmount: 800,
  },
] as const;

async function ensureDefaultPackages() {
  const existingCount = await prisma.package.count();
  if (existingCount > 0) {
    return;
  }

  await prisma.package.createMany({
    data: defaultPackages.map((pkg) => ({
      name: pkg.name,
      description: pkg.description,
      basePrice: pkg.basePrice,
      defaultDepositAmount: pkg.defaultDepositAmount,
      isActive: true,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingPayload;

    if (!body.eventDate || !body.clientEmail || !body.clientName) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    const eventDate = new Date(body.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(eventDate.getTime()) || eventDate < today) {
      return NextResponse.json(
        { error: "Please choose a future event date." },
        { status: 400 },
      );
    }

    await ensureDefaultPackages();

    const packageConfig = defaultPackages.find(
      (p) => p.key === body.packageKey,
    );

    if (!packageConfig) {
      return NextResponse.json(
        { error: "Invalid package selection." },
        { status: 400 },
      );
    }

    const packageRecord = await prisma.package.findFirst({
      where: { name: packageConfig.name, isActive: true },
    });

    if (!packageRecord) {
      return NextResponse.json(
        { error: "Package configuration not available." },
        { status: 500 },
      );
    }

    const booking = await prisma.booking.create({
      data: {
        status: BookingStatus.NEW,
        eventDate,
        startTime: body.startTime,
        durationMinutes: body.durationMinutes,
        eventType: body.eventType,
        venueName: body.venueName,
        venueAddress: body.venueAddress,
        guestCount: body.guestCount,
        packageId: packageRecord.id,
        basePrice: packageConfig.basePrice,
        depositAmount: packageConfig.defaultDepositAmount,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone,
        notes: body.notes,
      },
      select: {
        id: true,
        status: true,
        eventDate: true,
        clientName: true,
        clientEmail: true,
      },
    });

    return NextResponse.json(
      {
        booking,
        message:
          "Your booking request has been received. We will review availability and follow up shortly.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating booking", error);
    return NextResponse.json(
      { error: "Something went wrong while creating your booking." },
      { status: 500 },
    );
  }
}

