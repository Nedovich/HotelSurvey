import { NextResponse } from "next/server";

import { verifyGuest } from "@/lib/api/guest";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const response = await verifyGuest(payload);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? [
            error.message,
            error.cause instanceof Error ? error.cause.message : null,
            typeof error.cause === "string" ? error.cause : null,
          ]
            .filter(Boolean)
            .join(" | ")
        : "Unknown error";

    return NextResponse.json(
      {
        verified: false,
        reason: "service_unavailable",
        message,
      },
      { status: 502 },
    );
  }
}
