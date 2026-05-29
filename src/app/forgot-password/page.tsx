"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("admin@hospita.com");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-16">
      <div className="w-full rounded-[2rem] border border-[#ead7ca] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#7b3f05]">Reset password</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We will generate a password reset link using Better Auth.
        </p>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await authClient.requestPasswordReset({
              email,
              redirectTo: `${window.location.origin}/reset-password`,
            });
            setMessage("Reset link generated. Check your server logs in development.");
          }}
        >
          <Input
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
          {message ? <p className="text-sm text-[#7b3f05]">{message}</p> : null}
          <Button
            className="rounded-2xl bg-[#a85a08] text-white hover:bg-[#8f4d06]"
            type="submit"
          >
            Send reset link
          </Button>
        </form>
      </div>
    </div>
  );
}
