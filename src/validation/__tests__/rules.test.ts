/**
 * @page-speed/forms - Validation Rules Tests
 */

import { describe, it, expect } from "vitest";
import {
  required,
  email,
  url,
  phone,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  matches,
  oneOf,
  creditCard,
  postalCode,
  alpha,
  alphanumeric,
  numeric,
  integer,
  compose,
} from "../rules";

describe("Validation Rules", () => {
  describe("required", () => {
    it("should return error for empty string", () => {
      const validator = required();
      expect(validator("", {})).toBe("This field is required");
    });

    it("should return error for null", () => {
      const validator = required();
      expect(validator(null as any, {})).toBe("This field is required");
    });

    it("should return error for undefined", () => {
      const validator = required();
      expect(validator(undefined as any, {})).toBe("This field is required");
    });

    it("should return error for empty array", () => {
      const validator = required();
      expect(validator([], {})).toBe("This field is required");
    });

    it("should return error for empty object", () => {
      const validator = required();
      expect(validator({}, {})).toBe("This field is required");
    });

    it("should pass for non-empty string", () => {
      const validator = required();
      expect(validator("test", {})).toBeUndefined();
    });

    it("should pass for non-empty array", () => {
      const validator = required();
      expect(validator([1, 2], {})).toBeUndefined();
    });

    it("should support custom message", () => {
      const validator = required({ message: "Custom required message" });
      expect(validator("", {})).toBe("Custom required message");
    });
  });

  describe("email", () => {
    it("should validate correct email", () => {
      const validator = email();
      expect(validator("test@example.com", {})).toBeUndefined();
      expect(validator("user+tag@domain.co.uk", {})).toBeUndefined();
    });

    it("should reject invalid emails", () => {
      const validator = email();
      expect(validator("invalid", {})).toBe("Please enter a valid email address");
      expect(validator("@example.com", {})).toBe("Please enter a valid email address");
      expect(validator("user@", {})).toBe("Please enter a valid email address");
    });

    it("should pass for empty value", () => {
      const validator = email();
      expect(validator("", {})).toBeUndefined();
    });

    it("should support custom message", () => {
      const validator = email({ message: "Invalid email format" });
      expect(validator("invalid", {})).toBe("Invalid email format");
    });
  });

  describe("url", () => {
    it("should validate correct URLs", () => {
      const validator = url();
      expect(validator("https://example.com", {})).toBeUndefined();
      expect(validator("http://localhost:3000", {})).toBeUndefined();
      expect(validator("ftp://files.example.com", {})).toBeUndefined();
    });

    it("should reject invalid URLs", () => {
      const validator = url();
      expect(validator("not-a-url", {})).toBe("Please enter a valid URL");
      expect(validator("example.com", {})).toBe("Please enter a valid URL");
    });

    it("should pass for empty value", () => {
      const validator = url();
      expect(validator("", {})).toBeUndefined();
    });
  });

  describe("phone", () => {
    it("should validate US phone numbers", () => {
      const validator = phone();
      expect(validator("1234567890", {})).toBeUndefined();
      expect(validator("123-456-7890", {})).toBeUndefined();
      expect(validator("(123) 456-7890", {})).toBeUndefined();
      expect(validator("+1 123 456 7890", {})).toBeUndefined();
    });

    it("should reject invalid phone numbers", () => {
      const validator = phone();
      expect(validator("123", {})).toBe("Please enter a valid phone number");
      expect(validator("abcdefghij", {})).toBe("Please enter a valid phone number");
    });

    it("should pass for empty value", () => {
      const validator = phone();
      expect(validator("", {})).toBeUndefined();
    });
  });

  describe("minLength", () => {
    it("should validate minimum length", () => {
      const validator = minLength(5);
      expect(validator("test", {})).toBe("Must be at least 5 characters");
      expect(validator("testing", {})).toBeUndefined();
    });

    it("should work with arrays", () => {
      const validator = minLength(3);
      expect(validator([1, 2], {})).toBe("Must be at least 3 characters");
      expect(validator([1, 2, 3], {})).toBeUndefined();
    });

    it("should pass for empty value", () => {
      const validator = minLength(5);
      expect(validator("", {})).toBeUndefined();
    });
  });

  describe("maxLength", () => {
    it("should validate maximum length", () => {
      const validator = maxLength(5);
      expect(validator("testing", {})).toBe("Must be no more than 5 characters");
      expect(validator("test", {})).toBeUndefined();
    });

    it("should work with arrays", () => {
      const validator = maxLength(2);
      expect(validator([1, 2, 3], {})).toBe("Must be no more than 2 characters");
      expect(validator([1, 2], {})).toBeUndefined();
    });
  });

  describe("min", () => {
    it("should validate minimum value", () => {
      const validator = min(10);
      expect(validator(5, {})).toBe("Must be at least 10");
      expect(validator(10, {})).toBeUndefined();
      expect(validator(15, {})).toBeUndefined();
    });

    it("should work with string numbers", () => {
      const validator = min(10);
      expect(validator("5", {})).toBe("Must be at least 10");
      expect(validator("15", {})).toBeUndefined();
    });
  });

  describe("max", () => {
    it("should validate maximum value", () => {
      const validator = max(10);
      expect(validator(15, {})).toBe("Must be no more than 10");
      expect(validator(10, {})).toBeUndefined();
      expect(validator(5, {})).toBeUndefined();
    });
  });

  describe("pattern", () => {
    it("should validate against regex", () => {
      const validator = pattern(/^[A-Z]+$/);
      expect(validator("ABC", {})).toBeUndefined();
      expect(validator("abc", {})).toBe("Invalid format");
      expect(validator("123", {})).toBe("Invalid format");
    });
  });

  describe("matches", () => {
    it("should validate field matches another field", () => {
      const validator = matches("password");
      expect(
        validator("secret123", { password: "secret123" })
      ).toBeUndefined();
      expect(validator("wrong", { password: "secret123" })).toBe(
        "Must match password"
      );
    });

    it("should support custom message", () => {
      const validator = matches("password", {
        message: "Passwords must be identical",
      });
      expect(validator("wrong", { password: "secret123" })).toBe(
        "Passwords must be identical"
      );
    });
  });

  describe("oneOf", () => {
    it("should validate value is one of allowed values", () => {
      const validator = oneOf(["red", "green", "blue"]);
      expect(validator("red", {})).toBeUndefined();
      expect(validator("yellow", {})).toBe("Invalid value");
    });

    it("should work with numbers", () => {
      const validator = oneOf([1, 2, 3]);
      expect(validator(2, {})).toBeUndefined();
      expect(validator(5, {})).toBe("Invalid value");
    });
  });

  describe("creditCard", () => {
    it("should validate credit card numbers", () => {
      const validator = creditCard();
      // Valid Visa test number
      expect(validator("4111111111111111", {})).toBeUndefined();
      // With spaces
      expect(validator("4111 1111 1111 1111", {})).toBeUndefined();
      // With dashes
      expect(validator("4111-1111-1111-1111", {})).toBeUndefined();
    });

    it("should reject invalid credit cards", () => {
      const validator = creditCard();
      expect(validator("1234567890123456", {})).toBe(
        "Please enter a valid credit card number"
      );
      expect(validator("abcd", {})).toBe(
        "Please enter a valid credit card number"
      );
    });
  });

  describe("postalCode", () => {
    it("should validate US ZIP codes", () => {
      const validator = postalCode();
      expect(validator("12345", {})).toBeUndefined();
      expect(validator("12345-6789", {})).toBeUndefined();
    });

    it("should reject invalid ZIP codes", () => {
      const validator = postalCode();
      expect(validator("123", {})).toBe("Please enter a valid ZIP code");
      expect(validator("abcde", {})).toBe("Please enter a valid ZIP code");
    });
  });

  describe("alpha", () => {
    it("should validate alphabetic characters only", () => {
      const validator = alpha();
      expect(validator("abc", {})).toBeUndefined();
      expect(validator("ABC", {})).toBeUndefined();
      expect(validator("abc123", {})).toBe("Must contain only letters");
      expect(validator("abc def", {})).toBe("Must contain only letters");
    });
  });

  describe("alphanumeric", () => {
    it("should validate letters and numbers only", () => {
      const validator = alphanumeric();
      expect(validator("abc123", {})).toBeUndefined();
      expect(validator("ABC123", {})).toBeUndefined();
      expect(validator("abc-123", {})).toBe(
        "Must contain only letters and numbers"
      );
      expect(validator("abc 123", {})).toBe(
        "Must contain only letters and numbers"
      );
    });
  });

  describe("numeric", () => {
    it("should validate numbers", () => {
      const validator = numeric();
      expect(validator(123, {})).toBeUndefined();
      expect(validator("123", {})).toBeUndefined();
      expect(validator("123.45", {})).toBeUndefined();
      expect(validator("abc", {})).toBe("Must be a valid number");
    });
  });

  describe("integer", () => {
    it("should validate integers", () => {
      const validator = integer();
      expect(validator(123, {})).toBeUndefined();
      expect(validator("123", {})).toBeUndefined();
      expect(validator(123.45, {})).toBe("Must be a whole number");
      expect(validator("123.45", {})).toBe("Must be a whole number");
    });
  });

  describe("compose", () => {
    it("should run multiple validators in sequence", async () => {
      const validator = compose(required(), minLength(5), pattern(/^[A-Z]/));

      expect(await validator("", {})).toBe("This field is required");
      expect(await validator("abc", {})).toBe("Must be at least 5 characters");
      expect(await validator("abcde", {})).toBe("Invalid format");
      expect(await validator("Abcde", {})).toBeUndefined();
    });

    it("should stop at first error", async () => {
      let callCount = 0;
      const validator1 = () => {
        callCount++;
        return "Error 1";
      };
      const validator2 = () => {
        callCount++;
        return "Error 2";
      };

      const composed = compose(validator1, validator2);
      await composed("test", {});

      expect(callCount).toBe(1); // Only first validator was called
    });
  });
});
