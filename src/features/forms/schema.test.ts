import { describe, expect, it } from "vitest";

import { parseSurveySchemaString } from "@/features/forms/schema";

describe("parseSurveySchemaString", () => {
  it("accepts a valid survey object", () => {
    const result = parseSurveySchemaString(
      JSON.stringify({
        title: "Guest Feedback",
        pages: [],
      }),
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Guest Feedback");
    }
  });

  it("rejects invalid JSON", () => {
    const result = parseSurveySchemaString("{invalid-json");

    expect(result).toEqual({
      success: false,
      error: "Survey schema must be valid JSON.",
    });
  });

  it("rejects non-object JSON values", () => {
    const result = parseSurveySchemaString(JSON.stringify(["not", "an", "object"]));

    expect(result).toEqual({
      success: false,
      error: "Survey schema must be a JSON object.",
    });
  });
});
