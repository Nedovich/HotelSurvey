"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

type CopyPublicLinkButtonProps = {
  url: string;
};

export function CopyPublicLinkButton({ url }: CopyPublicLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button
      className="h-8 rounded-md bg-[#974800] px-4 text-xs font-semibold text-white hover:bg-[#824000]"
      onClick={handleCopy}
      type="button"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy Link"}
    </Button>
  );
}
