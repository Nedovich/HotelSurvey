import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

const reasonMessages: Record<string, string> = {
  not_found: "Bilgileriniz bulunamadi, ankete giris yapamazsiniz.",
  expired: "Bu anket linkinin suresi doldu.",
  already_completed: "Bu anket daha once doldurulmus.",
};

export default async function InvalidSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-16">
      <div className="w-full rounded-[2.25rem] border border-[#f1d8cb] bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#a28572]">Survey access</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#7b3f05]">Unable to continue</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {reasonMessages[reason ?? "not_found"] ?? reasonMessages.not_found}
        </p>
        <Link
          className={buttonVariants({
            className:
              "mt-6 rounded-2xl bg-[#a85a08] text-white hover:bg-[#8f4d06]",
          })}
          href="/"
        >
          Return
        </Link>
      </div>
    </div>
  );
}
