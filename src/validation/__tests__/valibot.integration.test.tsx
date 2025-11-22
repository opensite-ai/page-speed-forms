/**
 * Valibot Integration Tests
 *
 * NOTE: These tests are currently skipped due to memory leak issues in
 * @legendapp/state v3.0.0-beta.42. The validation logic triggers an infinite
 * loop in ObjectGetOwnPropertyDescriptor causing heap overflow after ~80 seconds.
 *
 * The tests are well-written and should pass once @legendapp/state releases
 * a stable v3.0.0 with proper type definitions and memory management fixes.
 *
 * See useForm.ts lines 62-73 for more details about beta compatibility issues.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as v from "valibot";
import { createValibotSchema, createFieldValidator } from "../valibot";
import { useForm } from "../../core/useForm";
import { Form } from "../../core/Form";
import { Field } from "../../core/Field";

// Test component wrapper
function TestFormWithValibot({
  schema,
  initialValues = {},
  onSubmit = vi.fn(),
}: {
  schema: any;
  initialValues?: Record<string, any>;
  onSubmit?: any;
}) {
  const form = useForm({
    initialValues,
    validationSchema: createValibotSchema(schema),
    onSubmit,
  });

  return (
    <Form form={form}>
      <Field name="email">
        {({ field, meta }) => (
          <>
            <input data-testid="email-input" {...field} />
            {meta.error && meta.touched && (
              <span data-testid="email-error">{meta.error}</span>
            )}
          </>
        )}
      </Field>

      {initialValues.password !== undefined && (
        <Field name="password">
          {({ field, meta }) => (
            <>
              <input
                type="password"
                data-testid="password-input"
                {...field}
              />
              {meta.error && meta.touched && (
                <span data-testid="password-error">{meta.error}</span>
              )}
            </>
          )}
        </Field>
      )}

      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </Form>
  );
}

describe.skip("Valibot Integration", () => {
  // ============================================================================
  // createValibotSchema - Basic Validation
  // ============================================================================

  describe("createValibotSchema - Basic Validation", () => {
    it("should validate required email field", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(v.string(), v.email("Invalid email address")),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      // Touch the field without entering value
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toBeInTheDocument();
      });
    });

    it("should show email format validation error", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(v.string(), v.email("Invalid email address")),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      // Enter invalid email
      await user.type(input, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Invalid email address"
        );
      });
    });

    it("should clear error when validation passes", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(v.string(), v.email("Invalid email address")),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      // Trigger error
      await user.type(input, "invalid");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toBeInTheDocument();
      });

      // Clear and enter valid email
      await user.clear(input);
      await user.type(input, "test@example.com");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // createValibotSchema - Multi-Field Validation
  // ============================================================================

  describe("createValibotSchema - Multi-Field Validation", () => {
    it("should validate multiple fields independently", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(v.string(), v.email("Invalid email")),
        password: v.pipe(
          v.string(),
          v.minLength(8, "Password must be at least 8 characters")
        ),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "", password: "" }}
        />
      );

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");

      // Trigger email error
      await user.type(emailInput, "invalid");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toBeInTheDocument();
      });

      // Trigger password error
      await user.type(passwordInput, "short");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("password-error")).toHaveTextContent(
          "Password must be at least 8 characters"
        );
      });
    });

    it("should allow submission when all fields are valid", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      const schema = v.object({
        email: v.pipe(v.string(), v.email("Invalid email")),
        password: v.pipe(v.string(), v.minLength(8, "Too short")),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "", password: "" }}
          onSubmit={onSubmit}
        />
      );

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      // Fill form with valid values
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "test@example.com",
            password: "password123",
          }),
          expect.any(Object)
        );
      });
    });
  });

  // ============================================================================
  // createValibotSchema - String Validations
  // ============================================================================

  describe("createValibotSchema - String Validations", () => {
    it("should validate minLength", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(
          v.string(),
          v.minLength(5, "Must be at least 5 characters")
        ),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      await user.type(input, "abc");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Must be at least 5 characters"
        );
      });
    });

    it("should validate maxLength", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(
          v.string(),
          v.maxLength(10, "Must be at most 10 characters")
        ),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      await user.type(input, "this-is-way-too-long");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Must be at most 10 characters"
        );
      });
    });

    it("should validate regex pattern", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(
          v.string(),
          v.regex(/^[A-Z]+$/, "Must be uppercase letters only")
        ),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      await user.type(input, "lowercase");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Must be uppercase letters only"
        );
      });
    });
  });

  // ============================================================================
  // createFieldValidator - Single Field Validation
  // ============================================================================

  describe("createFieldValidator - Single Field Validation", () => {
    it("should validate single field with custom validator", async () => {
      const user = userEvent.setup();

      const emailSchema = v.pipe(v.string(), v.email("Invalid email format"));
      const emailValidator = createFieldValidator(emailSchema);

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        });

        return (
          <Form form={form}>
            <Field name="email" validate={emailValidator}>
              {({ field, meta }) => (
                <>
                  <input data-testid="email-input" {...field} />
                  {meta.error && meta.touched && (
                    <span data-testid="email-error">{meta.error}</span>
                  )}
                </>
              )}
            </Field>
          </Form>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId("email-input");

      await user.type(input, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Invalid email format"
        );
      });
    });

    it("should work with minLength validation", async () => {
      const user = userEvent.setup();

      const schema = v.pipe(
        v.string(),
        v.minLength(8, "Must be at least 8 characters")
      );
      const validator = createFieldValidator(schema);

      function TestComponent() {
        const form = useForm({
          initialValues: { password: "" },
          onSubmit: vi.fn(),
        });

        return (
          <Form form={form}>
            <Field name="password" validate={validator}>
              {({ field, meta }) => (
                <>
                  <input
                    type="password"
                    data-testid="password-input"
                    {...field}
                  />
                  {meta.error && meta.touched && (
                    <span data-testid="password-error">{meta.error}</span>
                  )}
                </>
              )}
            </Field>
          </Form>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId("password-input");

      await user.type(input, "short");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("password-error")).toHaveTextContent(
          "Must be at least 8 characters"
        );
      });
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle empty values", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(
          v.string(),
          v.minLength(1, "Email is required"),
          v.email("Invalid email")
        ),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toBeInTheDocument();
      });
    });

    it("should handle optional fields", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.optional(v.pipe(v.string(), v.email("Invalid email"))),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      // Empty value should be valid (optional)
      await user.click(input);
      await user.tab();

      // Should not show error for empty value
      await waitFor(
        () => {
          expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should handle complex nested validation", async () => {
      const user = userEvent.setup();

      const schema = v.object({
        email: v.pipe(
          v.string(),
          v.minLength(1, "Required"),
          v.email("Invalid format"),
          v.endsWith("@example.com", "Must be example.com domain")
        ),
      });

      render(
        <TestFormWithValibot
          schema={schema}
          initialValues={{ email: "" }}
        />
      );

      const input = screen.getByTestId("email-input");

      // Test first validation (required)
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Required"
        );
      });

      // Test second validation (email format)
      await user.type(input, "invalid");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Invalid format"
        );
      });

      // Test third validation (domain)
      await user.clear(input);
      await user.type(input, "test@other.com");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Must be example.com domain"
        );
      });
    });
  });

  // ============================================================================
  // Type Safety
  // ============================================================================

  describe("Type Safety", () => {
    it("should maintain type inference from schema", () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
        age: v.pipe(v.number(), v.minValue(18)),
      });

      const validationSchema = createValibotSchema(schema);

      // Type check: validationSchema should have email and age validators
      expect(validationSchema).toBeDefined();
      expect(typeof validationSchema.email).toBe("function");
      expect(typeof validationSchema.age).toBe("function");
    });
  });
});
