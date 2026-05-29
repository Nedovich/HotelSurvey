import { redirect } from "next/navigation";

import { SurveyRuntime } from "@/features/public-survey/components/survey-runtime";
import { normalizeSurveyLocale } from "@/features/surveys/locales";
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

export default async function StartSurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicSlug: string }>;
  searchParams: Promise<{
    token?: string;
    portalToken?: string;
    guestName?: string;
    lastName?: string;
    roomNumber?: string;
    birthDate?: string;
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
      token: query.token,
      portalToken: query.portalToken,
      guestName: query.guestName,
      lastName: query.lastName,
      roomNumber: query.roomNumber,
      birthDate: query.birthDate,
      country: query.country,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      externalReference: query.externalReference,
      lang: query.lang,
    });

    redirect(
      params
        ? `/s/${publication.publicSlug}/start?${params}`
        : `/s/${publication.publicSlug}/start`,
    );
  }

  if (!publication.isActive) {
    redirect(`/s/${publicSlug}/invalid?reason=not_found`);
  }

  if (publication.hasExpired) {
    redirect(`/s/${publicSlug}/invalid?reason=expired`);
  }

  if (publication.mode === "direct_link" && !query.token) {
    const params = buildSearchParams({ lang: query.lang });
    redirect(
      params
        ? `/s/${publicSlug}/verify?${params}`
        : `/s/${publicSlug}/verify`,
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6">
      <SurveyRuntime
        defaultLocale={normalizeSurveyLocale(publication.form.defaultLocale, "en")}
        formId={publication.form.id}
        externalReference={query.externalReference}
        guestName={query.guestName}
        portalToken={query.portalToken}
        publicationId={publication.id}
        publicSlug={publicSlug}
        respondentBirthDate={query.birthDate}
        respondentCountry={query.country}
        respondentSurname={query.lastName}
        roomNumber={query.roomNumber}
        requestedLocale={query.lang}
        stayEnd={query.checkOut}
        stayStart={query.checkIn}
        surveyJson={publication.form.surveySchema as object}
        verificationToken={query.token}
      />
    </div>
  );
}
