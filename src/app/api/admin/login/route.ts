import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const admin = await authenticateAdmin(email, password);

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message: "Signed in successfully.",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "Unable to connect to the database. Please try again later." },
      { status: 503 },
    );
  }
}

