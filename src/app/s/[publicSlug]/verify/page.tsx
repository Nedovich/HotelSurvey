import { Building2 } from "lucide-react";
import { redirect } from "next/navigation";

import { guestEntryCopy } from "@/features/public-survey/guest-entry-copy";
import { VerifyForm } from "@/features/public-survey/components/verify-form";
import { normalizeSurveyLocale } from "@/features/surveys/locales";
import { env } from "@/lib/env";
import { getPublicationBySlug } from "@/server/data";

function buildSearchParams(values: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) {
      params.set(key, value);
    }
  }

  return params.toString();
}

export default async function VerifySurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicSlug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { publicSlug } = await params;
  const { lang } = await searchParams;
  const publication = await getPublicationBySlug(publicSlug);
  const locale = normalizeSurveyLocale(lang, "en");
  const copy = guestEntryCopy[locale];

  if (!publication) {
    redirect(`/s/${publicSlug}/invalid?reason=not_found`);
  }

  if (publication.publicSlug !== publicSlug) {
    const params = buildSearchParams({ lang });
    redirect(
      params
        ? `/s/${publication.publicSlug}/verify?${params}`
        : `/s/${publication.publicSlug}/verify`,
    );
  }

  if (!publication.isActive) {
    redirect(`/s/${publicSlug}/invalid?reason=not_found`);
  }

  if (publication.hasExpired) {
    redirect(`/s/${publicSlug}/invalid?reason=expired`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff8f5_0%,#fffdfa_100%)]">
      <div className="absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(circle_at_20%_20%,rgba(214,159,108,0.28),transparent_28%),radial-gradient(circle_at_75%_24%,rgba(255,255,255,0.95),transparent_15%),radial-gradient(circle_at_86%_22%,rgba(255,255,255,0.9),transparent_12%),radial-gradient(circle_at_50%_6%,rgba(255,248,245,0.95),transparent_10%),linear-gradient(180deg,rgba(239,214,192,0.88)_0%,rgba(255,248,245,0.75)_52%,rgba(255,248,245,1)_100%)] opacity-90" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col px-4 py-12 sm:px-6">
        <div className="flex flex-1 flex-col">
          <div className="pb-12 pt-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[#f5ded2] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <Building2 className="size-8 text-[#974800]" />
            </div>
            <h1 className="mt-6 font-heading text-[24px] font-bold leading-8 tracking-[-0.6px] text-[#251912]">
              {copy.title}
            </h1>
            <p className="mx-auto mt-3 max-w-[262px] text-base leading-6 text-[#584235]">
              {copy.description}
            </p>
          </div>

          <div className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_10px_15px_-3px_rgba(30,41,59,0.08)]">
            {env.HOTELSURVEY_API_STUB ? (
              <div className="mb-5 rounded-xl border border-[#f1d8cb] bg-[#fff8f5] px-4 py-3 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a28572]">
                  Dev Test Access
                </p>
                <p className="mt-2 text-sm leading-5 text-[#7b3f05]">
                  Oda <span className="font-semibold">205</span> ve dogum tarihi{" "}
                  <span className="font-semibold">1989-05-04</span> ile testi acabilirsin.
                </p>
              </div>
            ) : null}

            <VerifyForm
              hotelId={publication.form.hotelId}
              initialLocale={locale}
              publicSlug={publicSlug}
            />
          </div>

          <div className="flex-1" />

          <div className="pb-4 pt-10 text-center text-xs leading-5 text-[#8b7263]">
            {publication.form.name}
            {" "}
            {copy.footer}
          </div>
        </div>
      </div>
    </div>
  );
}
