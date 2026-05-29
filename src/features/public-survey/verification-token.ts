import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { env } from "@/lib/env";

const guestVerificationTokenPayloadSchema = z.object({
  version: z.literal(1),
  exp: z.number().int(),
  hotelId: z.string(),
  publicSlug: z.string(),
  roomNumber: z.string(),
  birthDate: z.string(),
  guestFirstName: z.string().optional(),
  guestLastName: z.string().optional(),
  guestDisplayName: z.string().optional(),
  country: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  externalReference: z.string().optional(),
});

export type GuestVerificationTokenPayload = z.infer<
  typeof guestVerificationTokenPayloadSchema
>;

const TOKEN_TTL_SECONDS = 60 * 60 * 8;

const sign = (encodedPayload: string) =>
  createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");

export const buildGuestDisplayName = (
  firstName?: string | null,
  lastName?: string | null,
) => [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");

export const createGuestVerificationToken = (
  payload: Omit<GuestVerificationTokenPayload, "version" | "exp">,
) => {
  const tokenPayload = guestVerificationTokenPayloadSchema.parse({
    version: 1,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    ...payload,
    guestDisplayName:
      payload.guestDisplayName ||
      buildGuestDisplayName(payload.guestFirstName, payload.guestLastName),
  });

  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString(
    "base64url",
  );
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

export const readGuestVerificationToken = (token?: string | null) => {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  try {
    const payload = guestVerificationTokenPayloadSchema.parse(
      JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")),
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
