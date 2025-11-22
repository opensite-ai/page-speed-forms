/**
 * @page-speed/forms - Validation Utilities Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  debounce,
  asyncValidator,
  crossFieldValidator,
  when,
  withRaceConditionPrevention,
  setErrorMessages,
  getErrorMessage,
  resetErrorMessages,
  defaultMessages,
  messageRegistry,
} from "../utils";
import type { FieldValidator } from "../../core/types";

describe("Validation Utilities", () => {
  describe("debounce", () => {
    it("should debounce validator calls", async () => {
      let callCount = 0;
      const validator: FieldValidator = async (value) => {
        callCount++;
        return value ? undefined : "Required";
      };

      const debouncedValidator = debounce(validator, { delay: 50 });

      // Make multiple rapid calls
      debouncedValidator("test1", {});
      debouncedValidator("test2", {});
      const result = await debouncedValidator("test3", {});

      // Wait for debounce to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should only call once due to debouncing
      expect(callCount).toBe(1);
      expect(result).toBeUndefined();
    });

    it("should support leading edge calls", async () => {
      let callCount = 0;
      const validator: FieldValidator = async (value) => {
        callCount++;
        return value ? undefined : "Required";
      };

      const debouncedValidator = debounce(validator, {
        delay: 50,
        leading: true,
      });

      // First call should execute immediately with leading edge
      const result = await debouncedValidator("test", {});

      expect(callCount).toBe(1);
      expect(result).toBeUndefined();
    });

    it("should handle empty values correctly", async () => {
      const validator: FieldValidator = async (value) => {
        return value ? undefined : "Required";
      };

      const debouncedValidator = debounce(validator, { delay: 50 });

      const result = await debouncedValidator("", {});

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result).toBe("Required");
    });
  });

  describe("withRaceConditionPrevention", () => {
    it("should only return result from latest call", async () => {
      let resolveFirst: any;
      let resolveSecond: any;

      const validator: FieldValidator = async (value) => {
        if (value === "first") {
          // This will resolve later
          await new Promise((resolve) => {
            resolveFirst = resolve;
          });
          return "first result";
        } else {
          // This will resolve immediately
          await new Promise((resolve) => {
            resolveSecond = resolve;
            resolve(undefined);
          });
          return "second result";
        }
      };

      const safeValidator = withRaceConditionPrevention(validator);

      // Make first call (will resolve later)
      const firstPromise = safeValidator("first", {});

      // Make second call (will resolve immediately)
      const secondPromise = safeValidator("second", {});

      // Resolve second first (it should win)
      await secondPromise;

      // Now resolve first (should be ignored)
      resolveFirst?.(undefined);
      const firstResult = await firstPromise;

      // Second call should return its result
      const secondResult = await safeValidator("second", {});
      expect(secondResult).toBe("second result");

      // First result should be undefined (ignored)
      expect(firstResult).toBeUndefined();
    });

    it("should handle errors correctly", async () => {
      const validator: FieldValidator = async (value) => {
        if (value === "throw") {
          throw new Error("Validation error");
        }
        return undefined;
      };

      const safeValidator = withRaceConditionPrevention(validator);

      await expect(safeValidator("throw", {})).rejects.toThrow(
        "Validation error"
      );
    });
  });

  describe("asyncValidator", () => {
    it("should combine debounce and race condition prevention", async () => {
      let callCount = 0;
      const validator: FieldValidator = async (value) => {
        callCount++;
        return value ? undefined : "Required";
      };

      const asyncVal = asyncValidator(validator, { delay: 50 });

      // Make multiple calls
      asyncVal("test1", {});
      await asyncVal("test2", {});

      // Wait for debounce to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should only call once due to debouncing
      expect(callCount).toBe(1);
    });
  });

  describe("crossFieldValidator", () => {
    it("should validate across multiple fields", async () => {
      const validator = crossFieldValidator(
        ["password", "confirmPassword"],
        (values) => {
          if (values.password !== values.confirmPassword) {
            return "Passwords must match";
          }
          return undefined;
        }
      );

      const allValues = {
        password: "secret123",
        confirmPassword: "secret456",
      };

      const result = await validator("secret456", allValues);
      expect(result).toBe("Passwords must match");
    });

    it("should pass when fields match", async () => {
      const validator = crossFieldValidator(
        ["password", "confirmPassword"],
        (values) => {
          if (values.password !== values.confirmPassword) {
            return "Passwords must match";
          }
          return undefined;
        }
      );

      const allValues = {
        password: "secret123",
        confirmPassword: "secret123",
      };

      const result = await validator("secret123", allValues);
      expect(result).toBeUndefined();
    });

    it("should support async validation logic", async () => {
      const validator = crossFieldValidator(
        ["email", "confirmEmail"],
        async (values) => {
          // Simulate async check with microtask
          await Promise.resolve();

          if (values.email !== values.confirmEmail) {
            return "Emails must match";
          }
          return undefined;
        }
      );

      const allValues = {
        email: "test@example.com",
        confirmEmail: "different@example.com",
      };

      const result = await validator("different@example.com", allValues);
      expect(result).toBe("Emails must match");
    });
  });

  describe("when", () => {
    it("should only validate when condition is true", async () => {
      const validator = when(
        (values) => values.requiresZip === true,
        (value) => (value ? undefined : "ZIP code required")
      );

      const allValues = { requiresZip: true };
      const result = await validator("", allValues);
      expect(result).toBe("ZIP code required");
    });

    it("should skip validation when condition is false", async () => {
      const validator = when(
        (values) => values.requiresZip === true,
        (value) => (value ? undefined : "ZIP code required")
      );

      const allValues = { requiresZip: false };
      const result = await validator("", allValues);
      expect(result).toBeUndefined();
    });

    it("should support complex conditions", async () => {
      const validator = when(
        (values) => values.country === "US" && values.requiresAddress === true,
        (value) => (value ? undefined : "Address required for US")
      );

      // Should validate for US with requiresAddress
      let result = await validator("", {
        country: "US",
        requiresAddress: true,
      });
      expect(result).toBe("Address required for US");

      // Should skip for non-US
      result = await validator("", { country: "CA", requiresAddress: true });
      expect(result).toBeUndefined();

      // Should skip when requiresAddress is false
      result = await validator("", { country: "US", requiresAddress: false });
      expect(result).toBeUndefined();
    });
  });

  describe("Message Registry", () => {
    afterEach(() => {
      resetErrorMessages();
    });

    it("should return default messages", () => {
      const message = getErrorMessage("required");
      expect(message).toBe("This field is required");
    });

    it("should handle template messages with parameters", () => {
      const message = getErrorMessage("minLength", { min: 5 });
      expect(message).toBe("Must be at least 5 characters");
    });

    it("should support custom messages", () => {
      setErrorMessages({
        required: "Este campo es obligatorio",
        email: "Por favor ingrese un email válido",
      });

      expect(getErrorMessage("required")).toBe("Este campo es obligatorio");
      expect(getErrorMessage("email")).toBe(
        "Por favor ingrese un email válido"
      );
    });

    it("should support custom template functions", () => {
      setErrorMessages({
        minLength: (params: { min: number }) =>
          `Debe tener al menos ${params.min} caracteres`,
      });

      const message = getErrorMessage("minLength", { min: 10 });
      expect(message).toBe("Debe tener al menos 10 caracteres");
    });

    it("should reset to defaults", () => {
      setErrorMessages({
        required: "Custom message",
      });

      expect(getErrorMessage("required")).toBe("Custom message");

      resetErrorMessages();

      expect(getErrorMessage("required")).toBe("This field is required");
    });

    it("should handle unknown keys", () => {
      const message = getErrorMessage("unknownKey");
      expect(message).toBe("Validation error: unknownKey");
    });

    it("should preserve default messages when setting new ones", () => {
      setErrorMessages({
        required: "Custom required",
      });

      // Custom message should work
      expect(getErrorMessage("required")).toBe("Custom required");

      // Default messages should still work
      expect(getErrorMessage("email")).toBe(
        "Please enter a valid email address"
      );
    });
  });

  describe("defaultMessages", () => {
    it("should contain all expected message keys", () => {
      expect(defaultMessages).toHaveProperty("required");
      expect(defaultMessages).toHaveProperty("email");
      expect(defaultMessages).toHaveProperty("url");
      expect(defaultMessages).toHaveProperty("phone");
      expect(defaultMessages).toHaveProperty("minLength");
      expect(defaultMessages).toHaveProperty("maxLength");
      expect(defaultMessages).toHaveProperty("min");
      expect(defaultMessages).toHaveProperty("max");
      expect(defaultMessages).toHaveProperty("pattern");
      expect(defaultMessages).toHaveProperty("matches");
      expect(defaultMessages).toHaveProperty("oneOf");
      expect(defaultMessages).toHaveProperty("creditCard");
      expect(defaultMessages).toHaveProperty("postalCode");
      expect(defaultMessages).toHaveProperty("alpha");
      expect(defaultMessages).toHaveProperty("alphanumeric");
      expect(defaultMessages).toHaveProperty("numeric");
      expect(defaultMessages).toHaveProperty("integer");
    });

    it("should have correct message formats", () => {
      expect(typeof defaultMessages.required).toBe("string");
      expect(typeof defaultMessages.email).toBe("string");
      expect(typeof defaultMessages.minLength).toBe("function");
      expect(typeof defaultMessages.matches).toBe("function");
    });
  });

  describe("messageRegistry", () => {
    afterEach(() => {
      messageRegistry.reset();
    });

    it("should be a singleton instance", () => {
      messageRegistry.setMessages({ required: "Test message" });
      expect(getErrorMessage("required")).toBe("Test message");
    });

    it("should handle direct access", () => {
      messageRegistry.setMessages({ custom: "Custom error" });
      expect(messageRegistry.getMessage("custom")).toBe("Custom error");
    });

    it("should handle template functions", () => {
      messageRegistry.setMessages({
        custom: (params: { value: string }) => `Value is ${params.value}`,
      });

      expect(messageRegistry.getMessage("custom", { value: "test" })).toBe(
        "Value is test"
      );
    });
  });
});
