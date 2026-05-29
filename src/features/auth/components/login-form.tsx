"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@hospita.com");
  const [password, setPassword] = useState("Hospita1234!");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (result.error) {
      setError(result.error.message ?? "Unable to sign in with these credentials.");
      setIsPending(false);
      return;
    }

    startTransition(() => {
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3">
        <label
          className="text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#251912]"
          htmlFor="email"
        >
          Hotel Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-[16px] -translate-y-1/2 text-[#584235]" />
          <Input
            className="h-[38px] rounded-lg border-[#f5ded2] bg-[#fff8f5] px-3 pl-10 text-[14px] text-[#251912] placeholder:text-[#6b7280] focus-visible:border-[#d6b7a3] focus-visible:ring-[#d6b7a3]/30"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@hotel.com"
            type="email"
            value={email}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label
          className="text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#251912]"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-[#584235]" />
          <Input
            className="h-[38px] rounded-lg border-[#f5ded2] bg-[#fff8f5] px-3 pl-10 text-[14px] text-[#251912] placeholder:text-[#6b7280] focus-visible:border-[#d6b7a3] focus-visible:ring-[#d6b7a3]/30"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            type="password"
            value={password}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 text-[14px] leading-5 text-[#584235]">
          <input
            checked={rememberMe}
            className="size-4 rounded-[4px] border border-[#f5ded2] bg-[#fff8f5] text-[#974800] accent-[#974800]"
            onChange={(event) => setRememberMe(event.target.checked)}
            type="checkbox"
          />
          Remember me
        </label>
        <Link
          className="text-[12px] font-medium leading-4 text-[#974800] hover:underline"
          href="/forgot-password"
        >
          Forgot Password?
        </Link>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        className="h-[42px] rounded-lg bg-[#974800] text-[14px] font-semibold tracking-[0.14px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#7d3c00]"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}
