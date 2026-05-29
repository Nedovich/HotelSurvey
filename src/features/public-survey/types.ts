import { z } from "zod";

export const responseStatusSchema = z.enum([
  "completed",
  "abandoned",
  "rejected",
  "expired",
]);

export const responseSourceSchema = z.enum(["captive_portal", "direct_link"]);

export type ResponseStatus = z.infer<typeof responseStatusSchema>;
export type ResponseSource = z.infer<typeof responseSourceSchema>;

export const verifyGuestRequestSchema = z.object({
  hotelId: z.string(),
  publicSlug: z.string(),
  roomNumber: z.string().min(1),
  birthDate: z.string().min(1),
});

export const guestVerificationDetailsSchema = z.object({
  guestDisplayName: z.string().optional(),
  guestFirstName: z.string().optional(),
  guestLastName: z.string().optional(),
  roomNumber: z.string().optional(),
  birthDate: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  country: z.string().optional(),
  externalReference: z.string().nullable().optional(),
});

export const verifyGuestResponseSchema = z.discriminatedUnion("verified", [
  z.object({
    verified: z.literal(true),
    verificationToken: z.string(),
  }).extend(guestVerificationDetailsSchema.shape),
  z.object({
    verified: z.literal(false),
    reason: z.enum([
      "not_found",
      "expired",
      "already_completed",
      "service_unavailable",
    ]),
    message: z.string().optional(),
  }),
]);

export const createGuestSessionRequestSchema = z.object({
  publicSlug: z.string(),
  token: z.string(),
});

export const createGuestSessionResponseSchema = z.object({
  ok: z.boolean(),
});

export const submitSurveyResponseRequestSchema = z.object({
  verificationToken: z.string().optional(),
  portalToken: z.string().optional(),
  formId: z.string(),
  publicationId: z.string(),
  respondentName: z.string().optional(),
  respondentSurname: z.string().optional(),
  respondentBirthDate: z.string().optional(),
  respondentCountry: z.string().optional(),
  roomNumber: z.string().optional(),
  stayStart: z.string().optional(),
  stayEnd: z.string().optional(),
  externalReference: z.string().optional(),
  answers: z.record(z.string(), z.unknown()),
  scoreSummary: z.number().nullable().optional(),
});

export const submitSurveyResponseResponseSchema = z.object({
  accepted: z.boolean(),
  responseId: z.string(),
});

export type VerifyGuestRequest = z.infer<typeof verifyGuestRequestSchema>;
export type VerifyGuestResponse = z.infer<typeof verifyGuestResponseSchema>;
export type SubmitSurveyResponseRequest = z.infer<
  typeof submitSurveyResponseRequestSchema
>;
