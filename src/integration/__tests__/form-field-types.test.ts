import { describe, expect, it } from "vitest";
import {
  generateInitialValues,
  generateValidationSchema,
  getColumnSpanClass,
  type FormFieldConfig,
} from "../form-field-types";

describe("form-field-types", () => {
  it("generates initial values for field types", () => {
    const fields: FormFieldConfig[] = [
      { name: "firstName", type: "text", label: "First Name" },
      { name: "consent", type: "checkbox", label: "Consent" },
      { name: "topics", type: "checkbox-group", label: "Topics" },
      { name: "tags", type: "multi-select", label: "Tags" },
      { name: "files", type: "file", label: "Files" },
      { name: "range", type: "date-range", label: "Range" },
    ];

    expect(generateInitialValues(fields)).toEqual({
      firstName: "",
      consent: false,
      topics: [],
      tags: [],
      files: [],
      range: { start: null, end: null },
    });
  });

  it("builds basic required and email validation", () => {
    const fields: FormFieldConfig[] = [
      {
        name: "email",
        type: "email",
        label: "Email",
        required: true,
      },
    ];

    const schema = generateValidationSchema(fields);
    expect(schema.email("", {})).toBe("Email is required");
    expect(schema.email("nope", {})).toBe("Please enter a valid email address");
    expect(schema.email("ok@example.com", {})).toBeUndefined();
  });

  it("returns deterministic column span classes", () => {
    expect(getColumnSpanClass()).toBe("col-span-12");
    expect(getColumnSpanClass(12)).toBe("col-span-12");
    expect(getColumnSpanClass(6)).toBe("col-span-12 md:col-span-6");
    expect(getColumnSpanClass(50)).toBe("col-span-12");
  });
});
