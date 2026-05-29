"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type FormFlowNavProps = {
  activeStep: "settings" | "builder" | "publish";
  formId: string;
  onStepChange?: (step: "settings" | "builder") => void;
};

const items = [
  { key: "settings", label: "Form Settings" },
  { key: "builder", label: "Build Survey" },
  { key: "publish", label: "Publish" },
] as const;

export function FormFlowNav({
  activeStep,
  formId,
  onStepChange,
}: FormFlowNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToEditorStep(step: "settings" | "builder") {
    onStepChange?.(step);

    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Form flow">
      {items.map((item, index) => {
        const isActive = item.key === activeStep;

        return (
          <div className="flex items-center gap-2" key={item.key}>
            {item.key === "publish" ? (
              <Link
                className={cn(
                  "border-b-2 pb-1 font-medium transition-colors",
                  isActive
                    ? "border-[#974800] text-[#974800]"
                    : "border-transparent text-[#584235] hover:text-[#974800]",
                )}
                href={`/forms/${formId}/publish`}
              >
                {item.label}
              </Link>
            ) : onStepChange ? (
              <button
                className={cn(
                  "border-b-2 pb-1 font-medium transition-colors",
                  isActive
                    ? "border-[#974800] text-[#974800]"
                    : "border-transparent text-[#584235] hover:text-[#974800]",
                )}
                onClick={() => goToEditorStep(item.key)}
                type="button"
              >
                {item.label}
              </button>
            ) : (
              <Link
                className={cn(
                  "border-b-2 pb-1 font-medium transition-colors",
                  isActive
                    ? "border-[#974800] text-[#974800]"
                    : "border-transparent text-[#584235] hover:text-[#974800]",
                )}
                href={`/forms/${formId}/settings?step=${item.key}`}
              >
                {item.label}
              </Link>
            )}
            {index < items.length - 1 ? (
              <ChevronRight className="size-3.5 text-[#8b7263]" />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
