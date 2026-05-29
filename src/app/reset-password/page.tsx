import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-16">
          <div className="w-full rounded-[2rem] border border-[#ead7ca] bg-white p-8 shadow-sm">
            <p className="text-sm text-muted-foreground">Loading reset form...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
