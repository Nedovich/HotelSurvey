import { NextResponse } from "next/server";

import {
  getGuestProfileFromVerificationToken,
  submitSurveyResponse,
} from "@/lib/api/guest";
import { hasDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    let localResponseId: string | null = null;

    if (hasDatabaseUrl) {
      const form = await prisma.surveyForm.findUnique({
        where: {
          id: payload.formId,
        },
        select: {
          hotelId: true,
        },
      });

      if (form) {
        const verifiedGuest =
          !payload.respondentName ||
          !payload.roomNumber ||
          !payload.respondentSurname ||
          !payload.respondentBirthDate ||
          !payload.stayStart ||
          !payload.stayEnd ||
          !payload.respondentCountry
            ? getGuestProfileFromVerificationToken(payload.verificationToken)
            : null;

        const createdResponse = await prisma.surveyResponse.create({
          data: {
            formId: payload.formId,
            publicationId: payload.publicationId,
            hotelId: form.hotelId,
            source: payload.portalToken ? "captive_portal" : "direct_link",
            status: "completed",
            respondentName:
              payload.respondentName ??
              verifiedGuest?.guestFirstName ??
              verifiedGuest?.guestDisplayName ??
              null,
            respondentSurname:
              payload.respondentSurname ??
              verifiedGuest?.guestLastName ??
              null,
            respondentBirthDate: payload.respondentBirthDate
              ? new Date(payload.respondentBirthDate)
              : verifiedGuest?.birthDate
                ? new Date(verifiedGuest.birthDate)
                : null,
            respondentCountry:
              payload.respondentCountry ?? verifiedGuest?.country ?? null,
            roomNumber:
              payload.roomNumber ?? verifiedGuest?.roomNumber ?? null,
            stayStart: payload.stayStart
              ? new Date(payload.stayStart)
              : verifiedGuest?.checkInDate
                ? new Date(verifiedGuest.checkInDate)
                : null,
            stayEnd: payload.stayEnd
              ? new Date(payload.stayEnd)
              : verifiedGuest?.checkOutDate
                ? new Date(verifiedGuest.checkOutDate)
                : null,
            externalReference:
              payload.externalReference ?? verifiedGuest?.externalReference ?? null,
            answers: payload.answers,
            scoreSummary: payload.scoreSummary,
            submittedAt: new Date(),
          },
        });

        localResponseId = createdResponse.id;
      }
    }

    try {
      const response = await submitSurveyResponse(payload);

      if (response.accepted || !localResponseId) {
        return NextResponse.json({
          accepted: response.accepted,
          responseId: response.responseId ?? localResponseId,
        });
      }
    } catch (error) {
      if (!localResponseId) {
        throw error;
      }
    }

    return NextResponse.json({
      accepted: true,
      responseId: localResponseId,
      synced: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        accepted: false,
        message:
          error instanceof Error
            ? [
                error.message,
                error.cause instanceof Error ? error.cause.message : null,
                typeof error.cause === "string" ? error.cause : null,
              ]
                .filter(Boolean)
                .join(" | ")
            : "Unknown error",
      },
      { status: 400 },
    );
  }
}
