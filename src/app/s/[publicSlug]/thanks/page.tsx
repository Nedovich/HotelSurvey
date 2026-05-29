import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { normalizeSurveyLocale } from "@/features/surveys/locales";

const thanksCopy = {
  tr: {
    eyebrow: "Geri bildirim alindi",
    title: "Tesekkur ederiz",
    description:
      "Geri bildiriminiz ekibimizle paylasildi. Bir sonraki konaklamanizi daha iyi hale getirmek icin bunu dikkatle inceleyecegiz.",
    cta: "Ana sayfaya don",
  },
  en: {
    eyebrow: "Feedback received",
    title: "Thank you",
    description:
      "Your feedback has been shared with the team. We will review it carefully to improve your next stay.",
    cta: "Back to homepage",
  },
  de: {
    eyebrow: "Feedback erhalten",
    title: "Vielen Dank",
    description:
      "Ihr Feedback wurde mit dem Team geteilt. Wir werden es sorgfaltig prufen, um Ihren nachsten Aufenthalt zu verbessern.",
    cta: "Zur Startseite",
  },
  ru: {
    eyebrow: "Otzyv poluchen",
    title: "Spasibo",
    description:
      "Vash otzyv peredan komande. My vnimatelno izuchim ego, chtoby uluchshit vash sleduyushchiy vizit.",
    cta: "Na glavnuyu",
  },
} as const;

export default async function SurveyThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = normalizeSurveyLocale(lang, "en");
  const copy = thanksCopy[locale];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-16">
      <div className="w-full rounded-[2.25rem] border border-[#ead7ca] bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#a28572]">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#7b3f05]">
          {copy.title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {copy.description}
        </p>
        <Link
          className={buttonVariants({
            className:
              "mt-6 rounded-2xl bg-[#a85a08] text-white hover:bg-[#8f4d06]",
          })}
          href="/"
        >
          {copy.cta}
        </Link>
      </div>
    </div>
  );
}
