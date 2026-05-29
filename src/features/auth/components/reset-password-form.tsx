"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-16">
      <div className="w-full rounded-[2rem] border border-[#ead7ca] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#7b3f05]">Create new password</h1>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await authClient.resetPassword({
              newPassword: password,
              token: searchParams.get("token") ?? "",
            });
            setMessage("Password updated. You can now sign in.");
          }}
        >
          <Input
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
            type="password"
            value={password}
          />
          {message ? <p className="text-sm text-[#7b3f05]">{message}</p> : null}
          <Button
            className="rounded-2xl bg-[#a85a08] text-white hover:bg-[#8f4d06]"
            type="submit"
          >
            Save password
          </Button>
        </form>
      </div>
    </div>
  );
}
