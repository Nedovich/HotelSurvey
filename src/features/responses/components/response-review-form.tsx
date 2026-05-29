"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ResponseReviewPriority } from "@/generated/prisma";

const reviewPriorityOptions: Array<{
  value: ResponseReviewPriority;
  label: string;
  activeClassName: string;
  inactiveClassName: string;
}> = [
  {
    value: "low",
    label: "Low",
    activeClassName: "border-[#2e7d32] bg-[#e0f2e3] text-[#2e7d32]",
    inactiveClassName: "border-[#d8ead9] bg-[#ecf8ee] text-[#2e7d32]",
  },
  {
    value: "medium",
    label: "Medium",
    activeClassName: "border-[#a85a08] bg-[#ffead7] text-[#a85a08]",
    inactiveClassName: "border-[#f3dec8] bg-[#fff1e4] text-[#a85a08]",
  },
  {
    value: "high",
    label: "High",
    activeClassName: "border-[#ba1a1a] bg-[#ffe2de] text-[#ba1a1a]",
    inactiveClassName: "border-[#f5d0cb] bg-[#fff0ee] text-[#ba1a1a]",
  },
];

export function ResponseReviewForm({
  action,
  initialNote,
  initialPriority,
  responseId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initialNote: string;
  initialPriority: ResponseReviewPriority;
  responseId: string;
}) {
  const [selectedPriority, setSelectedPriority] =
    useState<ResponseReviewPriority>(initialPriority);

  return (
    <form action={action} className="space-y-4 px-4 py-4">
      <input name="responseId" type="hidden" value={responseId} />
      <input name="reviewPriority" type="hidden" value={selectedPriority} />

      <div>
        <p className="text-xs font-medium text-[#584235]">Review Priority</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {reviewPriorityOptions.map((option) => {
            const isActive = selectedPriority === option.value;

            return (
              <button
                className={`rounded-full border px-3 py-2 text-center text-xs font-semibold transition-colors ${
                  isActive ? option.activeClassName : option.inactiveClassName
                }`}
                key={option.value}
                onClick={() => setSelectedPriority(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-[#584235]">Internal Notes</p>
        <textarea
          className="mt-2 h-24 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-3 py-3 text-[14px] leading-5 text-[#251912] outline-none placeholder:text-[#584235]/80"
          defaultValue={initialNote}
          name="internalNote"
          placeholder="Add a note about this response..."
        />
      </div>

      <Button
        className="h-8 w-full rounded-lg bg-[#974800] text-[14px] font-bold text-white hover:bg-[#7d3c00]"
        type="submit"
      >
        Save Changes
      </Button>
    </form>
  );
}
