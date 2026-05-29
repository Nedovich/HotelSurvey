import { env } from "@/lib/env";

const legacyFallbackSlugs = new Set(["check-out-feedback", "post-stay-124a"]);

function slugify(value: string) {
  return value
    .toLocaleLowerCase("en-US")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildDefaultPublicSlug(formName: string, formId: string) {
  const baseSlug = slugify(formName) || "survey";
  return `${baseSlug}-${formId.slice(-6).toLocaleLowerCase("en-US")}`;
}

export function resolvePublicSlug(
  formName: string,
  formId: string,
  currentSlug?: string | null,
) {
  if (!currentSlug) {
    return buildDefaultPublicSlug(formName, formId);
  }

  const normalizedFormSlug = slugify(formName);

  if (
    legacyFallbackSlugs.has(currentSlug) &&
    currentSlug !== normalizedFormSlug
  ) {
    return buildDefaultPublicSlug(formName, formId);
  }

  return currentSlug;
}

export function buildPublicSurveyUrl(publicSlug: string) {
  const baseUrl = env.BETTER_AUTH_URL.replace(/\/$/, "");
  return `${baseUrl}/s/${publicSlug}`;
}

export function buildHotelDefaultSurveyUrl(hotelSlug: string) {
  const baseUrl = env.BETTER_AUTH_URL.replace(/\/$/, "");
  return `${baseUrl}/s/${hotelSlug}`;
}
