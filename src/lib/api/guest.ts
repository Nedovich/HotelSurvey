import { z } from "zod";

import { env } from "@/lib/env";
import {
  createGuestSessionRequestSchema,
  createGuestSessionResponseSchema,
  guestVerificationDetailsSchema,
  submitSurveyResponseRequestSchema,
  submitSurveyResponseResponseSchema,
  verifyGuestRequestSchema,
  verifyGuestResponseSchema,
} from "@/features/public-survey/types";
import {
  buildGuestDisplayName,
  createGuestVerificationToken,
  readGuestVerificationToken,
} from "@/features/public-survey/verification-token";

const healthResponseSchema = z.object({
  status: z.string().optional(),
});

const externalVerifyGuestResponseSchema = z.discriminatedUnion("verified", [
  z.object({
    verified: z.literal(true),
  }).extend(guestVerificationDetailsSchema.shape),
  z.object({
    verified: z.literal(false),
    reason: z.enum(["not_found", "expired", "already_completed"]),
  }),
]);

const buildInternalVerificationSuccess = (
  payload: z.infer<typeof verifyGuestRequestSchema>,
  profile: z.infer<typeof guestVerificationDetailsSchema>,
) =>
  verifyGuestResponseSchema.parse({
    verified: true,
    verificationToken: createGuestVerificationToken({
      hotelId: payload.hotelId,
      publicSlug: payload.publicSlug,
      roomNumber: profile.roomNumber ?? payload.roomNumber,
      birthDate: profile.birthDate ?? payload.birthDate,
      guestFirstName: profile.guestFirstName,
      guestLastName: profile.guestLastName,
      guestDisplayName:
        profile.guestDisplayName ||
        buildGuestDisplayName(profile.guestFirstName, profile.guestLastName),
      country: profile.country,
      checkInDate: profile.checkInDate,
      checkOutDate: profile.checkOutDate,
      externalReference: profile.externalReference ?? undefined,
    }),
    ...profile,
    guestDisplayName:
      profile.guestDisplayName ||
      buildGuestDisplayName(profile.guestFirstName, profile.guestLastName),
  });

export function getGuestProfileFromVerificationToken(token?: string | null) {
  return readGuestVerificationToken(token);
}

export async function getGuestApiHealth() {
  if (env.HOTELSURVEY_API_STUB) {
    return {
      status: "stub",
    };
  }

  const response = await fetch(`${env.HOTELSURVEY_API_URL}/v1/health`, {
    cache: "no-store",
  });

  const json = await response.json();
  return healthResponseSchema.parse(json);
}

export async function verifyGuest(input: unknown) {
  const payload = verifyGuestRequestSchema.parse(input);

  if (env.HOTELSURVEY_API_STUB) {
    const room = payload.roomNumber.trim();
    const birthDate = payload.birthDate.trim();

    if (room === "412" && birthDate === "1991-02-12") {
      return verifyGuestResponseSchema.parse({
        verified: false,
        reason: "already_completed",
      });
    }

    if (room === "205" && birthDate === "1989-05-04") {
      return buildInternalVerificationSuccess(payload, {
        guestFirstName: "Mark",
        guestLastName: "Thompson",
        guestDisplayName: "Mark Thompson",
        roomNumber: "205",
        birthDate: "1989-05-04",
        checkInDate: "2026-05-24",
        checkOutDate: "2026-05-28",
        country: "Canada",
      });
    }

    if (room === "710" && birthDate === "1980-01-01") {
      return verifyGuestResponseSchema.parse({
        verified: false,
        reason: "expired",
      });
    }

    return verifyGuestResponseSchema.parse({
      verified: false,
      reason: "not_found",
    });
  }

  const verifyUrl =
    env.HOTELSURVEY_GUEST_VERIFY_URL ||
    `${env.HOTELSURVEY_API_URL}/v1/guest/verify`;

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const result = externalVerifyGuestResponseSchema.parse(await response.json());

  if (!result.verified) {
    return verifyGuestResponseSchema.parse(result);
  }

  return buildInternalVerificationSuccess(payload, result);
}

export async function createGuestSession(input: unknown) {
  const payload = createGuestSessionRequestSchema.parse(input);

  if (env.HOTELSURVEY_API_STUB) {
    return createGuestSessionResponseSchema.parse({
      ok: Boolean(payload.token),
    });
  }

  const response = await fetch(`${env.HOTELSURVEY_API_URL}/v1/guest/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return createGuestSessionResponseSchema.parse(await response.json());
}

export async function submitSurveyResponse(input: unknown) {
  const payload = submitSurveyResponseRequestSchema.parse(input);

  if (env.HOTELSURVEY_API_STUB) {
    return submitSurveyResponseResponseSchema.parse({
      accepted: true,
      responseId: `stub-response-${payload.publicationId}`,
    });
  }

  const response = await fetch(
    `${env.HOTELSURVEY_API_URL}/v1/survey-responses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  return submitSurveyResponseResponseSchema.parse(await response.json());
}
