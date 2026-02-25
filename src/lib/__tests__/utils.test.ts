import { describe, expect, it } from "vitest";
import { humanizeFieldName } from "../utils";

describe("humanizeFieldName", () => {
  it("converts snake_case to human-readable format", () => {
    expect(humanizeFieldName("first_name")).toBe("First name");
    expect(humanizeFieldName("last_name")).toBe("Last name");
    expect(humanizeFieldName("accepts_sms_marketing")).toBe(
      "Accepts sms marketing"
    );
  });

  it("converts camelCase to human-readable format", () => {
    expect(humanizeFieldName("firstName")).toBe("First name");
    expect(humanizeFieldName("lastName")).toBe("Last name");
    expect(humanizeFieldName("acceptsTerms")).toBe("Accepts terms");
  });

  it("handles simple single-word names", () => {
    expect(humanizeFieldName("email")).toBe("Email");
    expect(humanizeFieldName("name")).toBe("Name");
    expect(humanizeFieldName("phone")).toBe("Phone");
  });

  it("returns fallback for empty or undefined input", () => {
    expect(humanizeFieldName("")).toBe("This field");
    expect(humanizeFieldName(undefined as any)).toBe("This field");
    expect(humanizeFieldName(null as any)).toBe("This field");
  });

  it("handles mixed snake_case and camelCase", () => {
    expect(humanizeFieldName("user_firstName")).toBe("User first name");
  });
});
