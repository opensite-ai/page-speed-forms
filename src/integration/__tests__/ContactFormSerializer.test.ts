import { describe, it, expect } from "vitest";
import {
  serializeForRails,
  deserializeErrors,
  type RailsApiConfig,
  type FormValues,
  type RailsErrorResponse,
} from "../ContactFormSerializer";

describe("ContactFormSerializer", () => {
  describe("serializeForRails", () => {
    const baseConfig: RailsApiConfig = {
      apiKey: "test_api_key_123",
    };

    it("should serialize standard fields with camelCase to snake_case conversion", () => {
      const values: FormValues = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "555-1234",
      };

      const result = serializeForRails(values, baseConfig);

      expect(result).toEqual({
        api_key: "test_api_key_123",
        contact: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "555-1234",
        },
      });
    });

    it("should separate custom fields from standard fields", () => {
      const values: FormValues = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        companySize: "50-100",
        industry: "Technology",
      };

      const result = serializeForRails(values, baseConfig);

      expect(result.contact).toHaveProperty("first_name", "John");
      expect(result.contact).toHaveProperty("last_name", "Doe");
      expect(result.contact).toHaveProperty("email", "john@example.com");
      expect(result.contact.custom_fields).toEqual({
        company_size: "50-100",
        industry: "Technology",
      });
    });

    it("should extract and include upload tokens", () => {
      const values: FormValues = {
        firstName: "John",
        email: "john@example.com",
        resumeToken: "upload_abc123",
      };

      const result = serializeForRails(values, baseConfig);

      expect(result.contact.contact_form_upload_tokens).toEqual([
        "upload_abc123",
      ]);
      expect(result.contact).not.toHaveProperty("resume_token");
    });

    it("should handle multiple upload tokens from array", () => {
      const values: FormValues = {
        firstName: "John",
        email: "john@example.com",
        documents: ["upload_doc1", "upload_doc2", "upload_doc3"],
      };

      const result = serializeForRails(values, baseConfig);

      expect(result.contact.contact_form_upload_tokens).toEqual([
        "upload_doc1",
        "upload_doc2",
        "upload_doc3",
      ]);
    });

    it("should include optional config parameters at top level", () => {
      const values: FormValues = {
        firstName: "John",
        email: "john@example.com",
      };

      const config: RailsApiConfig = {
        apiKey: "test_key",
        contactCategoryToken: "cat_support",
        locationId: "loc_123",
      };

      const result = serializeForRails(values, config);

      expect(result.api_key).toBe("test_key");
      expect(result.contact_category_token).toBe("cat_support");
      expect(result.location_id).toBe("loc_123");
    });

    it("should include websiteId and websiteFormAssignmentId in contact object", () => {
      const values: FormValues = {
        firstName: "John",
        email: "john@example.com",
      };

      const config: RailsApiConfig = {
        apiKey: "test_key",
        websiteId: "web_456",
        websiteFormAssignmentId: "form_789",
      };

      const result = serializeForRails(values, config);

      expect(result.contact.website_id).toBe("web_456");
      expect(result.contact.website_form_assignment_id).toBe("form_789");
    });

    it("should include visitorIpAddress if provided", () => {
      const values: FormValues = {
        firstName: "John",
        email: "john@example.com",
      };

      const config: RailsApiConfig = {
        apiKey: "test_key",
        visitorIpAddress: "192.168.1.1",
      };

      const result = serializeForRails(values, config);

      expect(result.contact.visitor_ip_address).toBe("192.168.1.1");
    });

    it("should format birthday as ISO 8601 date", () => {
      const birthday = new Date("1990-05-15");
      const values: FormValues = {
        firstName: "John",
        email: "john@example.com",
        birthday,
      };

      const result = serializeForRails(values, baseConfig);

      expect(result.contact.birthday).toBe(birthday.toISOString());
    });

    it("should handle birthday as string and convert to ISO 8601", () => {
      const values: FormValues = {
        firstName: "John",
        email: "john@example.com",
        birthday: "1990-05-15",
      };

      const result = serializeForRails(values, baseConfig);

      expect(result.contact.birthday).toBe(new Date("1990-05-15").toISOString());
    });

    it("should handle all standard fields", () => {
      const values: FormValues = {
        content: "Message content",
        email: "test@example.com",
        firstName: "Jane",
        lastName: "Smith",
        phone: "555-9999",
        subject: "Contact Request",
        birthday: "1985-03-20",
        city: "San Francisco",
        state: "CA",
        acceptsSmsMarketing: true,
        acceptsEmailMarketing: false,
      };

      const result = serializeForRails(values, baseConfig);

      expect(result.contact).toEqual({
        content: "Message content",
        email: "test@example.com",
        first_name: "Jane",
        last_name: "Smith",
        phone: "555-9999",
        subject: "Contact Request",
        birthday: new Date("1985-03-20").toISOString(),
        city: "San Francisco",
        state: "CA",
        accepts_sms_marketing: true,
        accepts_email_marketing: false,
      });
    });

    it("should not include custom_fields key if no custom fields", () => {
      const values: FormValues = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      };

      const result = serializeForRails(values, baseConfig);

      expect(result.contact).not.toHaveProperty("custom_fields");
    });

    it("should not include contact_form_upload_tokens if no uploads", () => {
      const values: FormValues = {
        firstName: "John",
        email: "john@example.com",
      };

      const result = serializeForRails(values, baseConfig);

      expect(result.contact).not.toHaveProperty("contact_form_upload_tokens");
    });

    it("should handle empty form values", () => {
      const values: FormValues = {};

      const result = serializeForRails(values, baseConfig);

      expect(result).toEqual({
        api_key: "test_api_key_123",
        contact: {},
      });
    });

    it("should handle complex scenario with all features", () => {
      const values: FormValues = {
        // Standard fields
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        phone: "555-0123",
        subject: "Partnership Inquiry",
        content: "I would like to discuss a partnership opportunity.",
        city: "New York",
        state: "NY",
        birthday: "1992-08-10",
        acceptsSmsMarketing: true,
        acceptsEmailMarketing: true,
        // Custom fields
        companyName: "Acme Corp",
        companySize: "100-500",
        industry: "Software",
        // Upload tokens
        resumeToken: "upload_resume_xyz",
        documents: ["upload_doc1", "upload_doc2"],
      };

      const config: RailsApiConfig = {
        apiKey: "prod_key_abc",
        contactCategoryToken: "cat_partnership",
        locationId: "loc_ny_001",
        websiteId: "web_main",
        websiteFormAssignmentId: "form_partnership_v2",
        visitorIpAddress: "203.0.113.45",
      };

      const result = serializeForRails(values, config);

      expect(result).toEqual({
        api_key: "prod_key_abc",
        contact_category_token: "cat_partnership",
        location_id: "loc_ny_001",
        contact: {
          first_name: "Alice",
          last_name: "Johnson",
          email: "alice@example.com",
          phone: "555-0123",
          subject: "Partnership Inquiry",
          content: "I would like to discuss a partnership opportunity.",
          city: "New York",
          state: "NY",
          birthday: new Date("1992-08-10").toISOString(),
          accepts_sms_marketing: true,
          accepts_email_marketing: true,
          website_id: "web_main",
          website_form_assignment_id: "form_partnership_v2",
          visitor_ip_address: "203.0.113.45",
          custom_fields: {
            company_name: "Acme Corp",
            company_size: "100-500",
            industry: "Software",
          },
          contact_form_upload_tokens: [
            "upload_resume_xyz",
            "upload_doc1",
            "upload_doc2",
          ],
        },
      });
    });
  });

  describe("deserializeErrors", () => {
    it("should convert Rails errors to form error format", () => {
      const railsErrors: RailsErrorResponse = {
        errors: {
          first_name: ["can't be blank"],
          email: ["is invalid"],
        },
        status: 422,
      };

      const result = deserializeErrors(railsErrors);

      expect(result).toEqual({
        firstName: "can't be blank",
        email: "is invalid",
      });
    });

    it("should take first error message from array", () => {
      const railsErrors: RailsErrorResponse = {
        errors: {
          first_name: ["can't be blank", "is too short"],
          email: ["is invalid", "has already been taken"],
        },
        status: 422,
      };

      const result = deserializeErrors(railsErrors);

      expect(result).toEqual({
        firstName: "can't be blank",
        email: "is invalid",
      });
    });

    it("should handle custom_fields errors", () => {
      const railsErrors: RailsErrorResponse = {
        errors: {
          email: ["is required"],
          custom_fields: {
            company_size: ["can't be blank"],
            industry: ["is not included in the list"],
          },
        },
        status: 422,
      };

      const result = deserializeErrors(railsErrors);

      expect(result).toEqual({
        email: "is required",
        companySize: "can't be blank",
        industry: "is not included in the list",
      });
    });

    it("should handle base errors as form-level errors", () => {
      const railsErrors: RailsErrorResponse = {
        errors: {
          base: ["Something went wrong"],
          email: ["is invalid"],
        },
        status: 422,
      };

      const result = deserializeErrors(railsErrors);

      expect(result).toEqual({
        _form: "Something went wrong",
        email: "is invalid",
      });
    });

    it("should convert snake_case field names to camelCase", () => {
      const railsErrors: RailsErrorResponse = {
        errors: {
          first_name: ["is required"],
          last_name: ["is required"],
          accepts_sms_marketing: ["must be true or false"],
          website_form_assignment_id: ["is invalid"],
        },
        status: 422,
      };

      const result = deserializeErrors(railsErrors);

      expect(result).toEqual({
        firstName: "is required",
        lastName: "is required",
        acceptsSmsMarketing: "must be true or false",
        websiteFormAssignmentId: "is invalid",
      });
    });

    it("should handle empty errors object", () => {
      const railsErrors: RailsErrorResponse = {
        errors: {},
        status: 422,
      };

      const result = deserializeErrors(railsErrors);

      expect(result).toEqual({});
    });

    it("should handle complex error scenario with all error types", () => {
      const railsErrors: RailsErrorResponse = {
        errors: {
          base: ["Form submission failed"],
          first_name: ["can't be blank", "is too short"],
          email: ["is invalid"],
          phone: ["is not a valid phone number"],
          custom_fields: {
            company_name: ["is required"],
            company_size: ["must be selected"],
            preferred_contact_time: ["is not a valid time"],
          },
        },
        status: 422,
      };

      const result = deserializeErrors(railsErrors);

      expect(result).toEqual({
        _form: "Form submission failed",
        firstName: "can't be blank",
        email: "is invalid",
        phone: "is not a valid phone number",
        companyName: "is required",
        companySize: "must be selected",
        preferredContactTime: "is not a valid time",
      });
    });

    it("should handle single error message string (not array)", () => {
      const railsErrors: RailsErrorResponse = {
        errors: {
          email: "is invalid" as any, // Rails sometimes returns string
        },
        status: 422,
      };

      const result = deserializeErrors(railsErrors);

      expect(result).toEqual({
        email: "is invalid",
      });
    });
  });
});
