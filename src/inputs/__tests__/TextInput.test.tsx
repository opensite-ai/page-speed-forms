import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TextInput } from "../TextInput";

describe("TextInput Component", () => {
  // ============================================================================
  // Basic Rendering
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should render input element", () => {
      const onChange = vi.fn();
      render(<TextInput name="email" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should apply name attribute", () => {
      const onChange = vi.fn();
      render(<TextInput name="email" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveAttribute("name", "email");
    });

    it("should display value", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value="test@example.com" onChange={onChange} />
      );

      expect(screen.getByRole("textbox")).toHaveValue("test@example.com");
    });

    it("should handle null or undefined value", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value={null as any} onChange={onChange} />
      );

      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("should render with default type=text", () => {
      const onChange = vi.fn();
      render(<TextInput name="username" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
    });
  });

  // ============================================================================
  // Input Types
  // ============================================================================

  describe("Input Types", () => {
    it("should support type=email", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value="" onChange={onChange} type="email" />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
    });

    it("should support type=password", () => {
      const onChange = vi.fn();
      render(<TextInput name="pwd" value="" onChange={onChange} type="password" data-testid="password-input" />);

      const input = screen.getByTestId("password-input");
      expect(input).toHaveAttribute("type", "password");
    });

    it("should support type=url", () => {
      const onChange = vi.fn();
      render(<TextInput name="website" value="" onChange={onChange} type="url" />);

      expect(screen.getByRole("textbox")).toHaveAttribute("type", "url");
    });

    it("should support type=tel", () => {
      const onChange = vi.fn();
      render(<TextInput name="phone" value="" onChange={onChange} type="tel" />);

      expect(screen.getByRole("textbox")).toHaveAttribute("type", "tel");
    });

    it("should support type=search", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="query" value="" onChange={onChange} type="search" />
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // User Interaction
  // ============================================================================

  describe("User Interaction", () => {
    it("should call onChange when user types", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<TextInput name="email" value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "t");

      // Should be called with the typed character
      expect(onChange).toHaveBeenCalledWith("t");
    });

    it("should call onBlur when input loses focus", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBlur = vi.fn();

      render(
        <TextInput name="email" value="" onChange={onChange} onBlur={onBlur} />
      );

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it("should not call onBlur if not provided", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<TextInput name="email" value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      // Should not throw error
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should handle rapid typing", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<TextInput name="email" value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test@example.com");

      expect(onChange).toHaveBeenCalledTimes(16); // Once per character
    });

    it("should support controlled input pattern", async () => {
      const user = userEvent.setup();
      let value = "";
      const onChange = vi.fn((newValue: string) => {
        value = newValue;
      });

      const { rerender } = render(
        <TextInput name="email" value={value} onChange={onChange} />
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "t");

      // Update with typed value
      value = "t";

      // Rerender with updated value
      rerender(<TextInput name="email" value={value} onChange={onChange} />);

      expect(input).toHaveValue("t");
    });
  });

  // ============================================================================
  // Attributes and States
  // ============================================================================

  describe("Attributes and States", () => {
    it("should support placeholder", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          placeholder="Enter your email"
        />
      );

      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    });

    it("should support disabled state", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value="" onChange={onChange} disabled={true} />
      );

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should be enabled by default", () => {
      const onChange = vi.fn();
      render(<TextInput name="email" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).not.toBeDisabled();
    });

    it("should support required attribute", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value="" onChange={onChange} required={true} />
      );

      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("should not be required by default", () => {
      const onChange = vi.fn();
      render(<TextInput name="email" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).not.toBeRequired();
    });

    it("should forward additional HTML attributes", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          data-testid="custom-input"
          id="email-input"
          autoComplete="email"
        />
      );

      const input = screen.getByTestId("custom-input");
      expect(input).toHaveAttribute("id", "email-input");
      expect(input).toHaveAttribute("autocomplete", "email");
    });
  });

  // ============================================================================
  // Error State
  // ============================================================================

  describe("Error State", () => {
    it("should apply error class when error is true", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value="" onChange={onChange} error={true} />
      );

      expect(screen.getByRole("textbox")).toHaveClass("text-input--error");
    });

    it("should not apply error class when error is false", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value="" onChange={onChange} error={false} />
      );

      expect(screen.getByRole("textbox")).not.toHaveClass("text-input--error");
    });

    it("should set aria-invalid when error is true", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value="" onChange={onChange} error={true} />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });

    it("should allow overriding aria-invalid via props", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          error={false}
          aria-invalid={true}
        />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });
  });

  // ============================================================================
  // CSS Classes
  // ============================================================================

  describe("CSS Classes", () => {
    it("should apply base className", () => {
      const onChange = vi.fn();
      render(<TextInput name="email" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveClass("text-input");
    });

    it("should support custom className", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          className="custom-class"
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("text-input");
      expect(input).toHaveClass("custom-class");
    });

    it("should combine base, error, and custom classes", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          error={true}
          className="custom-class"
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("text-input");
      expect(input).toHaveClass("text-input--error");
      expect(input).toHaveClass("custom-class");
    });

    it("should trim className properly", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          className="  custom-class  "
        />
      );

      const input = screen.getByRole("textbox");
      const className = input.className;
      expect(className).not.toMatch(/^\s+|\s+$/);
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  describe("Accessibility", () => {
    it("should support aria-describedby for error messages", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          error={true}
          aria-describedby="email-error"
        />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "email-error"
      );
    });

    it("should support aria-required", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          required={true}
        />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-required",
        "true"
      );
    });

    it("should allow overriding aria-required via props", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          required={false}
          aria-required={true}
        />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-required",
        "true"
      );
    });

    it("should support aria-label", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          aria-label="Email address"
        />
      );

      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    });

    it("should support aria-labelledby", () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          value=""
          onChange={onChange}
          aria-labelledby="email-label"
        />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-labelledby",
        "email-label"
      );
    });
  });

  // ============================================================================
  // Integration with Form
  // ============================================================================

  describe("Integration with Form", () => {
    it("should work with form getFieldProps", () => {
      const fieldProps = {
        name: "email",
        value: "test@example.com",
        onChange: vi.fn(),
        onBlur: vi.fn(),
      };

      render(<TextInput {...fieldProps} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.name).toBe("email");
      expect(input.value).toBe("test@example.com");
    });

    it("should handle empty string value from form", () => {
      const onChange = vi.fn();
      render(<TextInput name="email" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("should update when controlled value changes", () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TextInput name="email" value="initial" onChange={onChange} />
      );

      expect(screen.getByRole("textbox")).toHaveValue("initial");

      rerender(
        <TextInput name="email" value="updated" onChange={onChange} />
      );

      expect(screen.getByRole("textbox")).toHaveValue("updated");
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle empty string className gracefully", () => {
      const onChange = vi.fn();
      render(
        <TextInput name="email" value="" onChange={onChange} className="" />
      );

      const input = screen.getByRole("textbox");
      expect(input.className).toBe("text-input");
    });

    it("should handle very long values", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const longValue = "a".repeat(1000);

      render(<TextInput name="email" value="" onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, longValue);

      expect(onChange).toHaveBeenCalledTimes(1000);
    });

    it("should handle special characters in value", () => {
      const onChange = vi.fn();
      const specialChars = "test@example.com!#$%^&*()";

      render(
        <TextInput name="email" value={specialChars} onChange={onChange} />
      );

      expect(screen.getByRole("textbox")).toHaveValue(specialChars);
    });

    it("should handle Unicode characters", () => {
      const onChange = vi.fn();
      const unicode = "你好世界";

      render(<TextInput name="text" value={unicode} onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue(unicode);
    });

    it("should handle emoji in value", () => {
      const onChange = vi.fn();
      const emoji = "Hello 👋 World 🌍";

      render(<TextInput name="text" value={emoji} onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue(emoji);
    });
  });

  // ============================================================================
  // Display Name
  // ============================================================================

  describe("Component Meta", () => {
    it("should have displayName set", () => {
      expect(TextInput.displayName).toBe("TextInput");
    });
  });
});
