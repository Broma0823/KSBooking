import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { BookingStatusControl } from "./BookingStatusControl";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { eventDate: "asc" },
    include: {
      package: true,
    },
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
            Admin dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Bookings overview
          </h1>
          <p className="text-sm text-zinc-700">
            Signed in as <span className="font-medium">{admin.email}</span>.
          </p>
        </div>
        <form
          action="/api/admin/logout"
          method="post"
          className="flex justify-end"
        >
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-800 hover:border-zinc-400 hover:bg-white"
          >
            Sign out
          </button>
        </form>
      </header>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Package
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-xs text-zinc-500"
                >
                  No bookings yet. Once clients submit the booking form, they
                  will appear here.
                </td>
              </tr>
            )}
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-800">
                  {new Date(booking.eventDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-800">
                  <div className="font-medium text-zinc-900">
                    {booking.clientName}
                  </div>
                  <div className="text-zinc-500">{booking.clientEmail}</div>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-800">
                  <div>{booking.eventType}</div>
                  <div className="text-zinc-500">
                    {booking.venueName} · {booking.venueAddress}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-800">
                  {booking.package?.name ?? "N/A"}
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={booking.status} />
                    <BookingStatusControl
                      bookingId={booking.id}
                      initialStatus={booking.status}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    NEW: "bg-zinc-100 text-zinc-700",
    PENDING_PAYMENT: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const labelMap: Record<string, string> = {
    NEW: "New",
    PENDING_PAYMENT: "Pending payment",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const color = colorMap[status] ?? "bg-zinc-100 text-zinc-700";
  const label = labelMap[status] ?? status;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${color}`}
    >
      {label}
    </span>
  );
}

