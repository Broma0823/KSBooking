"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { TimeSlotGrid } from "./TimeSlotGrid";

type Step = 1 | 2 | 3 | 4;

type EventDetails = {
  eventDate: string;
  startTime: string;
  durationMinutes: number;
  eventType: string;
  venueName: string;
  venueAddress: string;
  guestCount: number;
};

type PackageKey = "silver" | "gold" | "platinum";

type ClientDetails = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
};

type PaymentMode = "online" | "offline";

const initialEventDetails: EventDetails = {
  eventDate: "",
  startTime: "",
  durationMinutes: 60,
  eventType: "",
  venueName: "",
  venueAddress: "",
  guestCount: 80,
};

const initialClientDetails: ClientDetails = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  notes: "",
};

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [eventDetails, setEventDetails] =
    useState<EventDetails>(initialEventDetails);
  const [packageKey, setPackageKey] = useState<PackageKey>("silver");
  const [clientDetails, setClientDetails] =
    useState<ClientDetails>(initialClientDetails);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("online");

  const canGoNextFromStep1 =
    !!eventDetails.eventDate &&
    !!eventDetails.startTime &&
    !!eventDetails.eventType &&
    !!eventDetails.venueName &&
    !!eventDetails.venueAddress;

  const canGoNextFromStep3 =
    !!clientDetails.clientName &&
    !!clientDetails.clientEmail &&
    !!clientDetails.clientPhone;

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      if (paymentMode === "online") {
        const response = await fetch("/api/paymongo/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...eventDetails,
            packageKey,
            ...clientDetails,
            durationMinutes: Number(eventDetails.durationMinutes) || 60,
            guestCount: Number(eventDetails.guestCount) || 0,
          }),
          signal: controller.signal,
        });

        let data: { error?: string; url?: string } = {};
        try {
          data = (await response.json()) as { error?: string; url?: string };
        } catch {
          data = {};
        }

        clearTimeout(timeout);

        if (!response.ok) {
          setError(data.error ?? "Something went wrong.");
          setIsSubmitting(false);
          return;
        }

        if (data.url) {
          window.location.href = data.url as string;
          return;
        }

        setError("Could not start payment. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Offline / pay-later: just create a booking and show confirmation.
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventDetails,
          packageKey,
          ...clientDetails,
          durationMinutes: Number(eventDetails.durationMinutes) || 60,
          guestCount: Number(eventDetails.guestCount) || 0,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let data: { error?: string; booking?: { id: number } } = {};
      try {
        data = (await response.json()) as {
          error?: string;
          booking?: { id: number };
        };
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        setIsSubmitting(false);
        return;
      }

      if (data.booking?.id) {
        router.push(
          `/book/success?bookingId=${data.booking.id.toString()}&mode=offline`,
        );
        return;
      }

      setError("Could not create your booking. Please try again.");
      setIsSubmitting(false);
    } catch (err) {
      clearTimeout(timeout);
      console.error(err);
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. The database may be unreachable. Try again later or deploy the app (e.g. Vercel) where the database is reachable.");
      } else {
        setError("Something went wrong submitting your request. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Booking request
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Tell us about your event and we&apos;ll confirm availability.
        </h1>
        <p className="max-w-2xl text-sm text-zinc-700">
          This short form gathers the details we need to hold your date,
          recommend the right ensemble, and prepare a quote. No payment is
          taken at this stage.
        </p>
      </header>

      <div className="flex gap-4 text-xs font-medium text-zinc-600">
        <StepIndicator label="Event details" number={1} active={step === 1} />
        <StepIndicator label="Package" number={2} active={step === 2} />
        <StepIndicator label="Your details" number={3} active={step === 3} />
        <StepIndicator label="Confirmation" number={4} active={step === 4} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        {step === 1 && (
          <StepEventDetails
            value={eventDetails}
            onChange={setEventDetails}
            onNext={() => canGoNextFromStep1 && setStep(2)}
            canNext={canGoNextFromStep1}
          />
        )}
        {step === 2 && (
          <StepPackage
            value={packageKey}
            onChange={setPackageKey}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepClientDetails
            value={clientDetails}
            onChange={setClientDetails}
            onBack={() => setStep(2)}
            onNext={() => canGoNextFromStep3 && setStep(4)}
            canNext={canGoNextFromStep3}
          />
        )}
        {step === 4 && (
          <StepReview
            eventDetails={eventDetails}
            packageKey={packageKey}
            clientDetails={clientDetails}
            paymentMode={paymentMode}
            onPaymentModeChange={setPaymentMode}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}
      </div>
    </section>
  );
}

function StepIndicator({
  label,
  number,
  active,
}: {
  label: string;
  number: number;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
          active
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-zinc-300 bg-white text-zinc-500"
        }`}
      >
        {number}
      </div>
      <span className={active ? "text-zinc-900" : "text-zinc-500"}>
        {label}
      </span>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
      {children}
    </label>
  );
}

function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    fullWidth?: boolean;
  },
) {
  const { fullWidth, className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`h-10 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 ${fullWidth ? "w-full" : "w-full"} ${className ?? ""}`}
    />
  );
}

function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    fullWidth?: boolean;
  },
) {
  const { fullWidth, className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`min-h-[80px] rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 ${fullWidth ? "w-full" : "w-full"} ${className ?? ""}`}
    />
  );
}

function StepEventDetails({
  value,
  onChange,
  onNext,
  canNext,
}: {
  value: EventDetails;
  onChange: (value: EventDetails) => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-zinc-900">
        Step 1 – Event details
      </h2>

      <AvailabilityCalendar
        selectedDate={value.eventDate}
        onSelectDate={(dateStr) => onChange({ ...value, eventDate: dateStr })}
      />

      {value.eventDate && (
        <TimeSlotGrid
          selectedDate={value.eventDate}
          startTime={value.startTime}
          durationMinutes={value.durationMinutes}
          onSelect={(startTime, durationMinutes) =>
            onChange({ ...value, startTime, durationMinutes })
          }
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <FieldLabel>Event date</FieldLabel>
          <TextInput
            type="date"
            value={value.eventDate}
            onChange={(e) =>
              onChange({ ...value, eventDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <FieldLabel>Start time</FieldLabel>
          <TextInput
            type="time"
            value={value.startTime}
            onChange={(e) =>
              onChange({ ...value, startTime: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <FieldLabel>Event type</FieldLabel>
          <TextInput
            placeholder="e.g. Wedding ceremony, Corporate gala, Funeral"
            value={value.eventType}
            onChange={(e) =>
              onChange({ ...value, eventType: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <FieldLabel>Approximate duration (minutes)</FieldLabel>
          <TextInput
            type="number"
            min={15}
            max={240}
            value={value.durationMinutes}
            onChange={(e) =>
              onChange({
                ...value,
                durationMinutes: Number(e.target.value) || 60,
              })
            }
          />
        </div>
        <div className="space-y-1">
          <FieldLabel>Venue name</FieldLabel>
          <TextInput
            placeholder="Venue or church name"
            value={value.venueName}
            onChange={(e) =>
              onChange({ ...value, venueName: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <FieldLabel>Venue address</FieldLabel>
          <TextInput
            placeholder="Street, suburb, city"
            value={value.venueAddress}
            onChange={(e) =>
              onChange({ ...value, venueAddress: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <FieldLabel>Estimated guest count</FieldLabel>
          <TextInput
            type="number"
            min={0}
            max={1000}
            value={value.guestCount}
            onChange={(e) =>
              onChange({
                ...value,
                guestCount: Number(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Next: Choose package
        </button>
      </div>
    </div>
  );
}

function StepPackage({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: PackageKey;
  onChange: (pkg: PackageKey) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-zinc-900">
        Step 2 – Choose a package
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <PackageCard
          title="Silver Ceremony"
          subtitle="Small ensemble"
          description="Up to 3 songs for your ceremony (processional, signing, recessional)."
          priceHint="From approx. £XXX"
          selected={value === "silver"}
          onClick={() => onChange("silver")}
        />
        <PackageCard
          title="Gold Ceremony +"
          subtitle="Ceremony + short set"
          description="Ceremony music plus a short set during drinks or photos."
          priceHint="From approx. £XXX"
          selected={value === "gold"}
          onClick={() => onChange("gold")}
        />
        <PackageCard
          title="Platinum Event"
          subtitle="Full experience"
          description="Extended performance, bespoke arrangements, and musical direction."
          priceHint="From approx. £XXX"
          selected={value === "platinum"}
          onClick={() => onChange("platinum")}
        />
      </div>
      <p className="text-xs text-zinc-500">
        Package names and price hints here are placeholders – update to match
        your real offerings and currency.
      </p>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-zinc-400 hover:bg-white"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
        >
          Next: Your details
        </button>
      </div>
    </div>
  );
}

function PackageCard({
  title,
  subtitle,
  description,
  priceHint,
  selected,
  onClick,
}: {
  title: string;
  subtitle: string;
  description: string;
  priceHint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full flex-col rounded-2xl border p-4 text-left text-sm transition-colors ${
        selected
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">
        {subtitle}
      </p>
      <p className="mt-1 text-base font-semibold">{title}</p>
      <p
        className={`mt-2 text-xs ${selected ? "text-zinc-200" : "text-zinc-600"}`}
      >
        {description}
      </p>
      <p
        className={`mt-auto pt-3 text-xs font-medium ${
          selected ? "text-zinc-100" : "text-zinc-700"
        }`}
      >
        {priceHint}
      </p>
    </button>
  );
}

function StepClientDetails({
  value,
  onChange,
  onBack,
  onNext,
  canNext,
}: {
  value: ClientDetails;
  onChange: (value: ClientDetails) => void;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-zinc-900">
        Step 3 – Your details
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <FieldLabel>Your name</FieldLabel>
          <TextInput
            value={value.clientName}
            onChange={(e) =>
              onChange({ ...value, clientName: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <FieldLabel>Email</FieldLabel>
          <TextInput
            type="email"
            value={value.clientEmail}
            onChange={(e) =>
              onChange({ ...value, clientEmail: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <FieldLabel>Phone number</FieldLabel>
          <TextInput
            value={value.clientPhone}
            onChange={(e) =>
              onChange({ ...value, clientPhone: e.target.value })
            }
          />
        </div>
      </div>
      <div className="space-y-1">
        <FieldLabel>Anything else we should know?</FieldLabel>
        <TextArea
          placeholder="Tell us about specific songs, parts of the ceremony, or anything important to your event."
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
        />
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-zinc-400 hover:bg-white"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Next: Review
        </button>
      </div>
    </div>
  );
}

function StepReview({
  eventDetails,
  packageKey,
  clientDetails,
  paymentMode,
  onPaymentModeChange,
  onBack,
  onSubmit,
  isSubmitting,
  error,
}: {
  eventDetails: EventDetails;
  packageKey: PackageKey;
  clientDetails: ClientDetails;
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const packageNameMap: Record<PackageKey, string> = {
    silver: "Silver Ceremony",
    gold: "Gold Ceremony +",
    platinum: "Platinum Event",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-zinc-900">
        Step 4 – Review & send request
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 text-sm text-zinc-700">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Event
          </h3>
          <p>
            <span className="font-medium text-zinc-900">Date:</span>{" "}
            {eventDetails.eventDate || "Not set"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Time:</span>{" "}
            {eventDetails.startTime || "Not set"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Type:</span>{" "}
            {eventDetails.eventType || "Not set"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Venue:</span>{" "}
            {eventDetails.venueName || "Not set"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Address:</span>{" "}
            {eventDetails.venueAddress || "Not set"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Guests:</span>{" "}
            {eventDetails.guestCount || 0}
          </p>
        </div>
        <div className="space-y-3 text-sm text-zinc-700">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Package & contact
          </h3>
          <p>
            <span className="font-medium text-zinc-900">Package:</span>{" "}
            {packageNameMap[packageKey]}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Name:</span>{" "}
            {clientDetails.clientName || "Not set"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Email:</span>{" "}
            {clientDetails.clientEmail || "Not set"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Phone:</span>{" "}
            {clientDetails.clientPhone || "Not set"}
          </p>
          {clientDetails.notes && (
            <p>
              <span className="font-medium text-zinc-900">Notes:</span>{" "}
              {clientDetails.notes}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">
        <p className="font-semibold text-zinc-900">How would you like to pay?</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onPaymentModeChange("online")}
            className={`flex-1 rounded-lg border px-4 py-3 text-left ${paymentMode === "online" ? "border-zinc-900 bg-white" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"}`}
          >
            <p className="text-xs font-semibold text-zinc-900">
              Pay now (GCash / online)
            </p>
            <p className="mt-1 text-[11px] text-zinc-600">
              Go to a secure PayMongo checkout page to pay your deposit using
              GCash or other supported methods.
            </p>
          </button>
          <button
            type="button"
            onClick={() => onPaymentModeChange("offline")}
            className={`flex-1 rounded-lg border px-4 py-3 text-left ${paymentMode === "offline" ? "border-zinc-900 bg-white" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"}`}
          >
            <p className="text-xs font-semibold text-zinc-900">
              Pay later (manual)
            </p>
            <p className="mt-1 text-[11px] text-zinc-600">
              Send your booking request without paying now. We&apos;ll reply
              with payment instructions and confirm your date manually.
            </p>
          </button>
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        If you choose{" "}
        <span className="font-medium">Pay now (GCash / online)</span>, you&apos;ll
        be taken to a secure PayMongo checkout page to pay your deposit. If you
        choose <span className="font-medium">Pay later (manual)</span>, we&apos;ll
        email you your booking reference and payment instructions.
      </p>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-zinc-400 hover:bg-white"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isSubmitting ? "Sending request..." : "Send booking request"}
        </button>
      </div>
    </div>
  );
}

