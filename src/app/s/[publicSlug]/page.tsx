import { redirect } from "next/navigation";

import { verifyGuest } from "@/lib/api/guest";
import { getPublicationBySlug } from "@/server/data";

function buildSearchParams(
  values: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) {
      params.set(key, value);
    }
  }

  return params.toString();
}

export default async function SurveyEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicSlug: string }>;
  searchParams: Promise<{
    portalToken?: string;
    roomNumber?: string;
    birthDate?: string;
    token?: string;
    guestName?: string;
    lastName?: string;
    country?: string;
    checkIn?: string;
    checkOut?: string;
    externalReference?: string;
    lang?: string;
  }>;
}) {
  const { publicSlug } = await params;
  const query = await searchParams;
  const publication = await getPublicationBySlug(publicSlug);

  if (!publication) {
    redirect(`/s/${publicSlug}/invalid?reason=not_found`);
  }

  if (publication.publicSlug !== publicSlug) {
    const params = buildSearchParams({
      portalToken: query.portalToken,
      roomNumber: query.roomNumber,
      birthDate: query.birthDate,
      token: query.token,
      guestName: query.guestName,
      lastName: query.lastName,
      country: query.country,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      externalReference: query.externalReference,
      lang: query.lang,
    });

    redirect(
      params
        ? `/s/${publication.publicSlug}?${params}`
        : `/s/${publication.publicSlug}`,
    );
  }

  if (!publication.isActive) {
    redirect(`/s/${publicSlug}/invalid?reason=not_found`);
  }

  if (publication.hasExpired) {
    redirect(`/s/${publicSlug}/invalid?reason=expired`);
  }

  if (query.token) {
    const params = new URLSearchParams({ token: query.token });

    if (query.roomNumber) params.set("roomNumber", query.roomNumber);
    if (query.birthDate) params.set("birthDate", query.birthDate);
    if (query.guestName) params.set("guestName", query.guestName);
    if (query.lastName) params.set("lastName", query.lastName);
    if (query.country) params.set("country", query.country);
    if (query.checkIn) params.set("checkIn", query.checkIn);
    if (query.checkOut) params.set("checkOut", query.checkOut);
    if (query.externalReference) {
      params.set("externalReference", query.externalReference);
    }
    if (query.lang) {
      params.set("lang", query.lang);
    }

    redirect(`/s/${publicSlug}/start?${params.toString()}`);
  }

  if (query.portalToken) {
    const params = new URLSearchParams({ portalToken: query.portalToken });

    if (query.roomNumber) params.set("roomNumber", query.roomNumber);
    if (query.birthDate) params.set("birthDate", query.birthDate);
    if (query.guestName) params.set("guestName", query.guestName);
    if (query.lastName) params.set("lastName", query.lastName);
    if (query.country) params.set("country", query.country);
    if (query.checkIn) params.set("checkIn", query.checkIn);
    if (query.checkOut) params.set("checkOut", query.checkOut);
    if (query.externalReference) {
      params.set("externalReference", query.externalReference);
    }
    if (query.lang) {
      params.set("lang", query.lang);
    }

    redirect(`/s/${publicSlug}/start?${params.toString()}`);
  }

  if (query.roomNumber && query.birthDate) {
    const verification = await verifyGuest({
      hotelId: publication.form.hotelId,
      publicSlug,
      roomNumber: query.roomNumber,
      birthDate: query.birthDate,
    });

    if (verification.verified) {
      const params = new URLSearchParams({
        token: verification.verificationToken,
        roomNumber: verification.roomNumber ?? query.roomNumber,
        birthDate: verification.birthDate ?? query.birthDate,
      });

      if (verification.guestDisplayName) {
        params.set("guestName", verification.guestDisplayName);
      }
      if (verification.guestLastName) {
        params.set("lastName", verification.guestLastName);
      }
      if (verification.country) {
        params.set("country", verification.country);
      }
      if (verification.checkInDate) {
        params.set("checkIn", verification.checkInDate);
      }
      if (verification.checkOutDate) {
        params.set("checkOut", verification.checkOutDate);
      }
      if (verification.externalReference) {
        params.set("externalReference", verification.externalReference);
      }
      if (query.lang) {
        params.set("lang", query.lang);
      }

      redirect(`/s/${publicSlug}/start?${params.toString()}`);
    }

    redirect(`/s/${publicSlug}/invalid?reason=${verification.reason}`);
  }

  if (publication.mode === "captive_portal") {
    redirect(`/s/${publicSlug}/start`);
  }

  redirect(`/s/${publicSlug}/verify`);
}
