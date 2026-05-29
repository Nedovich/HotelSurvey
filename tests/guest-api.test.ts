import { describe, expect, it } from "vitest";

import { submitSurveyResponse, verifyGuest } from "@/lib/api/guest";

describe("guest api stub", () => {
  it("verifies a known guest", async () => {
    const result = await verifyGuest({
      hotelId: "mock-hotel",
      publicSlug: "check-out-feedback",
      roomNumber: "205",
      surname: "Thompson",
    });

    expect(result.verified).toBe(true);
    if (result.verified) {
      expect(result.verificationToken).toContain("stub");
    }
  });

  it("rejects an unknown guest", async () => {
    const result = await verifyGuest({
      hotelId: "mock-hotel",
      publicSlug: "check-out-feedback",
      roomNumber: "999",
      surname: "Nobody",
    });

    expect(result).toEqual({
      verified: false,
      reason: "not_found",
    });
  });

  it("accepts a stubbed survey response submission", async () => {
    const result = await submitSurveyResponse({
      verificationToken: "stub-verification-token-205",
      formId: "form-checkout",
      publicationId: "pub-checkout",
      answers: {
        overall_experience: 4,
      },
      scoreSummary: 4,
    });

    expect(result.accepted).toBe(true);
    expect(result.responseId).toContain("stub-response");
  });
});
