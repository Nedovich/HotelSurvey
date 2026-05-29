"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { deleteFormAction } from "@/features/forms/actions";

type DeleteFormButtonProps = {
  formId: string;
  formName: string;
};

export function DeleteFormButton({
  formId,
  formName,
}: DeleteFormButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-[#ba1a1a] transition-colors hover:text-[#8f1111] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isPending}
      onClick={() => {
        const confirmed = window.confirm(
          `Delete "${formName}"? This action cannot be undone.`,
        );

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const formData = new FormData();
          formData.set("formId", formId);
          await deleteFormAction(formData);
        });
      }}
      type="button"
    >
      <Trash2 className="size-3.5" />
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
