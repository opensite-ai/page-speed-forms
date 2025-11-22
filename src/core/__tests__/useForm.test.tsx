import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { useForm } from "../useForm";
import type { UseFormOptions } from "../types";

describe("useForm", () => {
  // Clean up after each test to prevent memory leaks and hook unmounting issues
  afterEach(async () => {
    cleanup();
    vi.clearAllMocks();
    // Small delay to allow async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe("Initialization", () => {
    it("should initialize with provided initial values", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "test@example.com", password: "password123" },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.values).toEqual({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should initialize with empty errors", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.errors).toEqual({});
    });

    it("should initialize with empty touched state", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.touched).toEqual({});
    });

    it("should initialize with idle status", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.status).toBe("idle");
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.isDirty).toBe(false);
    });

    it("should accept validation schema", () => {
      const validationSchema = {
        email: (value: string) => (!value ? "Required" : undefined),
      };

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validationSchema,
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.values.email).toBe("");
    });

    it("should accept validateOn and revalidateOn options", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validateOn: "onChange",
          revalidateOn: "onBlur",
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.values.email).toBe("");
    });
  });

  // ============================================================================
  // Field Value Updates
  // ============================================================================

  describe("Field Value Updates", () => {
    it("should update field value with setFieldValue", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue("email", "new@example.com");
      });

      expect(result.current.values.email).toBe("new@example.com");
    });

    it("should update multiple field values", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "", password: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue("email", "test@example.com");
        result.current.setFieldValue("password", "secret123");
      });

      expect(result.current.values).toEqual({
        email: "test@example.com",
        password: "secret123",
      });
    });

    it("should update all values with setValues", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "", password: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setValues({
          email: "test@example.com",
          password: "secret123",
        });
      });

      expect(result.current.values).toEqual({
        email: "test@example.com",
        password: "secret123",
      });
    });

    it("should update values with function updater", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { count: 0 },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setValues((prev) => ({ count: prev.count + 1 }));
      });

      expect(result.current.values.count).toBe(1);
    });

    it("should mark form as dirty when values change", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.setFieldValue("email", "test@example.com");
      });

      await waitFor(() => {
        expect(result.current.isDirty).toBe(true);
      });
    });
  });

  // ============================================================================
  // Touched State Management
  // ============================================================================

  describe("Touched State", () => {
    it("should mark field as touched with setFieldTouched", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldTouched("email", true);
      });

      expect(result.current.touched.email).toBe(true);
    });

    it("should unmark field as touched", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldTouched("email", true);
      });

      expect(result.current.touched.email).toBe(true);

      act(() => {
        result.current.setFieldTouched("email", false);
      });

      expect(result.current.touched.email).toBe(false);
    });

    it("should update all touched fields with setTouched", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "", password: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setTouched({ email: true, password: true });
      });

      expect(result.current.touched).toEqual({
        email: true,
        password: true,
      });
    });
  });

  // ============================================================================
  // Synchronous Validation
  // ============================================================================

  describe("Synchronous Validation", () => {
    it("should validate field on blur when validateOn is 'onBlur'", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validateOn: "onBlur",
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
          },
          onSubmit: vi.fn(),
        })
      );

      // Mark field as touched (triggers validation on blur)
      await act(async () => {
        result.current.setFieldTouched("email", true);
      });

      await waitFor(() => {
        expect(result.current.errors.email).toBe("Email is required");
      });
    });

    it("should not validate field on blur when validateOn is 'onChange'", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validateOn: "onChange",
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
          },
          onSubmit: vi.fn(),
        })
      );

      // Mark field as touched (should not trigger validation)
      await act(async () => {
        result.current.setFieldTouched("email", true);
      });

      expect(result.current.errors.email).toBeUndefined();
    });

    it("should run multiple validators on a single field", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { password: "short" },
          validationSchema: {
            password: [
              (value) => (!value ? "Password is required" : undefined),
              (value) =>
                value.length < 8 ? "Password must be at least 8 characters" : undefined,
              (value) => (!/[A-Z]/.test(value) ? "Must contain uppercase" : undefined),
            ],
          },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.validateField("password");
      });

      expect(result.current.errors.password).toBe(
        "Password must be at least 8 characters"
      );
    });

    it("should stop validation on first error", async () => {
      const validator1 = vi.fn(() => "Error 1");
      const validator2 = vi.fn(() => "Error 2");

      const { result } = renderHook(() =>
        useForm({
          initialValues: { field: "value" },
          validationSchema: {
            field: [validator1, validator2],
          },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.validateField("field");
      });

      expect(validator1).toHaveBeenCalled();
      expect(validator2).not.toHaveBeenCalled();
      expect(result.current.errors.field).toBe("Error 1");
    });

    it("should clear errors when validation passes", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
          },
          onSubmit: vi.fn(),
        })
      );

      // First validation fails
      await act(async () => {
        await result.current.validateField("email");
      });

      expect(result.current.errors.email).toBe("Email is required");

      // Update value and validate again
      await act(async () => {
        result.current.setFieldValue("email", "test@example.com");
        await result.current.validateField("email");
      });

      expect(result.current.errors.email).toBeUndefined();
    });

    it("should validate entire form with validateForm", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "", password: "" },
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
            password: (value) => (!value ? "Password is required" : undefined),
          },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.validateForm();
      });

      expect(result.current.errors).toEqual({
        email: "Email is required",
        password: "Password is required",
      });
    });

    it("should update isValid based on errors", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
          },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.isValid).toBe(true);

      await act(async () => {
        await result.current.validateField("email");
      });

      expect(result.current.isValid).toBe(false);
    });

    it("should validate with access to all form values", async () => {
      const validator = vi.fn((value, allValues) => {
        return allValues.password !== allValues.confirmPassword
          ? "Passwords must match"
          : undefined;
      });

      const { result } = renderHook(() =>
        useForm({
          initialValues: { password: "secret", confirmPassword: "different" },
          validationSchema: {
            confirmPassword: validator,
          },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.validateField("confirmPassword");
      });

      expect(validator).toHaveBeenCalledWith(
        "different",
        expect.objectContaining({
          password: "secret",
          confirmPassword: "different",
        })
      );
      expect(result.current.errors.confirmPassword).toBe("Passwords must match");
    });
  });

  // ============================================================================
  // Asynchronous Validation
  // ============================================================================

  describe("Asynchronous Validation", () => {
    it("should support async validators", async () => {
      const asyncValidator = vi.fn(async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return !value ? "Email is required" : undefined;
      });

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validationSchema: {
            email: asyncValidator,
          },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.validateField("email");
      });

      expect(asyncValidator).toHaveBeenCalled();
      expect(result.current.errors.email).toBe("Email is required");
    });

    it("should handle async validation errors", async () => {
      const asyncValidator = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error("Network error");
      };

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "test@example.com" },
          validationSchema: {
            email: asyncValidator,
          },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.validateField("email");
      });

      expect(result.current.errors.email).toBe("Network error");
    });
  });

  // ============================================================================
  // Validation Modes
  // ============================================================================

  describe("Validation Modes", () => {
    it("should revalidate on change when revalidateOn is 'onChange'", async () => {
      const validator = vi.fn((value) =>
        !value ? "Email is required" : undefined
      );

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validateOn: "onBlur",
          revalidateOn: "onChange",
          validationSchema: {
            email: validator,
          },
          onSubmit: vi.fn(),
        })
      );

      // First blur triggers validation
      await act(async () => {
        result.current.setFieldTouched("email", true);
      });

      expect(validator).toHaveBeenCalledTimes(1);

      // Subsequent changes should trigger revalidation
      await act(async () => {
        result.current.setFieldValue("email", "t");
      });

      await waitFor(() => {
        expect(validator).toHaveBeenCalledTimes(2);
      });
    });

    it("should not revalidate on change when revalidateOn is 'onBlur'", async () => {
      const validator = vi.fn((value) =>
        !value ? "Email is required" : undefined
      );

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validateOn: "onBlur",
          revalidateOn: "onBlur",
          validationSchema: {
            email: validator,
          },
          onSubmit: vi.fn(),
        })
      );

      // First blur triggers validation
      await act(async () => {
        result.current.setFieldTouched("email", true);
      });

      expect(validator).toHaveBeenCalledTimes(1);

      // Change should not trigger revalidation
      await act(async () => {
        result.current.setFieldValue("email", "t");
      });

      // Wait a bit to ensure no revalidation
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(validator).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Form Submission
  // ============================================================================

  describe("Form Submission", () => {
    it("should call onSubmit with form values", async () => {
      const onSubmit = vi.fn();

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "test@example.com" },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith(
        { email: "test@example.com" },
        expect.any(Object)
      );
    });

    it("should provide form helpers to onSubmit", async () => {
      const onSubmit = vi.fn();

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          setValues: expect.any(Function),
          setFieldValue: expect.any(Function),
          setErrors: expect.any(Function),
          setFieldError: expect.any(Function),
          setTouched: expect.any(Function),
          setFieldTouched: expect.any(Function),
          setSubmitting: expect.any(Function),
          resetForm: expect.any(Function),
        })
      );
    });

    it("should set isSubmitting during submission", async () => {
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      const onSubmit = vi.fn(() => submitPromise);

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit,
        })
      );

      // Start submission
      const handleSubmitPromise = await act(async () => {
        result.current.handleSubmit();
      });

      // Wait for isSubmitting to be true
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      // Resolve submit
      resolveSubmit!();

      await act(async () => {
        await handleSubmitPromise;
      });

      // Check isSubmitting is false after submission
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it("should update status during submission", async () => {
      const onSubmit = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 10))
      );

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit,
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe("idle");
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.status).toBe("success");
      });
    });

    it("should validate before submitting", async () => {
      const onSubmit = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
          },
          onSubmit,
          onError,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith({ email: "Email is required" });
    });

    it("should not submit if validation fails", async () => {
      const onSubmit = vi.fn();

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
          },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.status).toBe("error");
    });

    it("should handle submission errors", async () => {
      const onSubmit = vi.fn(() => {
        throw new Error("Submission failed");
      });

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "test@example.com" },
          onSubmit,
        })
      );

      // Manually catch the error to ensure state updates before checking
      let caughtError: Error | null = null;

      await act(async () => {
        try {
          await result.current.handleSubmit();
        } catch (error) {
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeTruthy();
      expect(caughtError?.message).toBe("Submission failed");
      expect(result.current.status).toBe("error");
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should prevent default on form events", async () => {
      const onSubmit = vi.fn();
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Form Reset
  // ============================================================================

  describe("Form Reset", () => {
    it("should reset form to initial values", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue("email", "test@example.com");
      });

      expect(result.current.values.email).toBe("test@example.com");

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values.email).toBe("");
    });

    it("should clear errors on reset", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
          },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.validateField("email");
      });

      expect(result.current.errors.email).toBe("Email is required");

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.errors).toEqual({});
    });

    it("should clear touched state on reset", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldTouched("email", true);
      });

      expect(result.current.touched.email).toBe(true);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.touched).toEqual({});
    });

    it("should reset status to idle", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.status).toBe("success");

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.status).toBe("idle");
    });
  });

  // ============================================================================
  // Field Props and Meta
  // ============================================================================

  describe("getFieldProps", () => {
    it("should return field props for binding to inputs", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "test@example.com" },
          onSubmit: vi.fn(),
        })
      );

      const fieldProps = result.current.getFieldProps("email");

      expect(fieldProps).toEqual({
        name: "email",
        value: "test@example.com",
        onChange: expect.any(Function),
        onBlur: expect.any(Function),
      });
    });

    it("should update value when onChange is called", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      const fieldProps = result.current.getFieldProps("email");

      act(() => {
        fieldProps.onChange("new@example.com");
      });

      expect(result.current.values.email).toBe("new@example.com");
    });

    it("should mark field as touched when onBlur is called", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      const fieldProps = result.current.getFieldProps("email");

      act(() => {
        fieldProps.onBlur();
      });

      expect(result.current.touched.email).toBe(true);
    });
  });

  describe("getFieldMeta", () => {
    it("should return field meta information", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          validationSchema: {
            email: (value) => (!value ? "Email is required" : undefined),
          },
          onSubmit: vi.fn(),
        })
      );

      await act(async () => {
        result.current.setFieldTouched("email", true);
        await result.current.validateField("email");
      });

      const meta = result.current.getFieldMeta("email");

      expect(meta).toEqual({
        error: "Email is required",
        touched: true,
        isDirty: false,
        isValidating: false,
      });
    });

    it("should report isDirty when field value changes", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      const metaBefore = result.current.getFieldMeta("email");
      expect(metaBefore.isDirty).toBe(false);

      act(() => {
        result.current.setFieldValue("email", "test@example.com");
      });

      const metaAfter = result.current.getFieldMeta("email");
      expect(metaAfter.isDirty).toBe(true);
    });
  });

  // ============================================================================
  // Error Management
  // ============================================================================

  describe("Error Management", () => {
    it("should set field error with setFieldError", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldError("email", "Custom error");
      });

      expect(result.current.errors.email).toBe("Custom error");
    });

    it("should set all errors with setErrors", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "", password: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setErrors({
          email: "Email error",
          password: "Password error",
        });
      });

      expect(result.current.errors).toEqual({
        email: "Email error",
        password: "Password error",
      });
    });

    it("should clear field error by setting undefined", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldError("email", "Error");
      });

      expect(result.current.errors.email).toBe("Error");

      act(() => {
        result.current.setFieldError("email", undefined);
      });

      expect(result.current.errors.email).toBeUndefined();
    });
  });

  // ============================================================================
  // Debug Mode
  // ============================================================================

  describe("Debug Mode", () => {
    it("should accept debug option", () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
          debug: true,
        })
      );

      expect(result.current.values.email).toBe("");
    });

    it("should log to console when debug is enabled", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
          debug: true,
        })
      );

      act(() => {
        result.current.setFieldValue("email", "test@example.com");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "[useForm] setFieldValue:",
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // Form Helpers in onSubmit
  // ============================================================================

  describe("Form Helpers", () => {
    it("should allow setting field value from onSubmit", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "old@example.com" },
          onSubmit: async (values, helpers) => {
            helpers.setFieldValue("email", "new@example.com");
          },
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.values.email).toBe("new@example.com");
    });

    it("should allow setting field error from onSubmit", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "test@example.com" },
          onSubmit: async (values, helpers) => {
            helpers.setFieldError("email", "Server error");
          },
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.email).toBe("Server error");
    });

    it("should allow resetting form from onSubmit", async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "" },
          onSubmit: async (values, helpers) => {
            helpers.resetForm();
          },
        })
      );

      act(() => {
        result.current.setFieldValue("email", "test@example.com");
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.values.email).toBe("");
    });
  });
});
