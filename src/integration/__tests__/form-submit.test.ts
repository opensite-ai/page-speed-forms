import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  PageSpeedFormSubmissionError,
  submitPageSpeedForm,
} from "../form-submit";

describe("form-submit", () => {
  it("validates email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
  });

  it("returns null when endpoint is missing", async () => {
    await expect(submitPageSpeedForm({ email: "a@b.com" })).resolves.toBeNull();
  });

  it("captures optional error metadata", () => {
    const error = new PageSpeedFormSubmissionError("Failed", {
      formErrors: { email: "Invalid" },
      status: 422,
    });

    expect(error.formErrors).toEqual({ email: "Invalid" });
    expect(error.status).toBe(422);
  });
});
