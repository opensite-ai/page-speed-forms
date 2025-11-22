import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TextArea } from "../TextArea";

describe("TextArea Component", () => {
  // ============================================================================
  // Basic Rendering
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should render textarea element", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should apply name attribute", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveAttribute("name", "bio");
    });

    it("should display value", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
          value="This is my bio text"
          onChange={onChange}
        />
      );

      expect(screen.getByRole("textbox")).toHaveValue("This is my bio text");
    });

    it("should handle null or undefined value", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value={null as any} onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("should render with default 3 rows", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "3");
    });
  });

  // ============================================================================
  // TextArea Specific Attributes
  // ============================================================================

  describe("TextArea Specific Attributes", () => {
    it("should support custom rows", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} rows={10} />);

      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "10");
    });

    it("should support cols attribute", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} cols={50} />);

      expect(screen.getByRole("textbox")).toHaveAttribute("cols", "50");
    });

    it("should support maxLength attribute", () => {
      const onChange = vi.fn();
      render(
        <TextArea name="bio" value="" onChange={onChange} maxLength={500} />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "500");
    });

    it("should support minLength attribute", () => {
      const onChange = vi.fn();
      render(
        <TextArea name="bio" value="" onChange={onChange} minLength={10} />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute("minLength", "10");
    });

    it("should support wrap attribute with default soft", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveAttribute("wrap", "soft");
    });

    it("should support wrap=hard", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} wrap="hard" />);

      expect(screen.getByRole("textbox")).toHaveAttribute("wrap", "hard");
    });

    it("should support wrap=off", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} wrap="off" />);

      expect(screen.getByRole("textbox")).toHaveAttribute("wrap", "off");
    });
  });

  // ============================================================================
  // User Interaction
  // ============================================================================

  describe("User Interaction", () => {
    it("should call onChange when user types", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<TextArea name="bio" value="" onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "H");

      expect(onChange).toHaveBeenCalledWith("H");
    });

    it("should handle multi-line input", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<TextArea name="bio" value="" onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Line 1{Enter}Line 2");

      // Should be called for each character including Enter (newline)
      expect(onChange).toHaveBeenCalledTimes(13); // 6 chars + Enter + 6 chars

      // Verify textarea supports multi-line values by checking one of the calls includes newline
      const calls = onChange.mock.calls.map(call => call[0]);
      const hasNewline = calls.some(value => typeof value === 'string' && value.includes('\n'));
      expect(hasNewline).toBe(true);
    });

    it("should call onBlur when textarea loses focus", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBlur = vi.fn();

      render(
        <TextArea name="bio" value="" onChange={onChange} onBlur={onBlur} />
      );

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.tab();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it("should not call onBlur if not provided", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<TextArea name="bio" value="" onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.tab();

      // Should not throw error
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should handle rapid typing", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<TextArea name="bio" value="" onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Hello");

      expect(onChange).toHaveBeenCalledTimes(5); // Once per character
    });

    it("should support controlled input pattern", async () => {
      const user = userEvent.setup();
      let value = "";
      const onChange = vi.fn((newValue: string) => {
        value = newValue;
      });

      const { rerender } = render(
        <TextArea name="bio" value={value} onChange={onChange} />
      );

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "H");

      // Update with typed value
      value = "H";

      // Rerender with updated value
      rerender(<TextArea name="bio" value={value} onChange={onChange} />);

      expect(textarea).toHaveValue("H");
    });
  });

  // ============================================================================
  // Attributes and States
  // ============================================================================

  describe("Attributes and States", () => {
    it("should support placeholder", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
          value=""
          onChange={onChange}
          placeholder="Tell us about yourself"
        />
      );

      expect(
        screen.getByPlaceholderText("Tell us about yourself")
      ).toBeInTheDocument();
    });

    it("should support disabled state", () => {
      const onChange = vi.fn();
      render(
        <TextArea name="bio" value="" onChange={onChange} disabled={true} />
      );

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should be enabled by default", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).not.toBeDisabled();
    });

    it("should support required attribute", () => {
      const onChange = vi.fn();
      render(
        <TextArea name="bio" value="" onChange={onChange} required={true} />
      );

      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("should not be required by default", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).not.toBeRequired();
    });

    it("should forward additional HTML attributes", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
          value=""
          onChange={onChange}
          data-testid="custom-textarea"
          id="bio-textarea"
          autoComplete="off"
        />
      );

      const textarea = screen.getByTestId("custom-textarea");
      expect(textarea).toHaveAttribute("id", "bio-textarea");
      expect(textarea).toHaveAttribute("autocomplete", "off");
    });
  });

  // ============================================================================
  // Error State
  // ============================================================================

  describe("Error State", () => {
    it("should apply error class when error is true", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} error={true} />);

      expect(screen.getByRole("textbox")).toHaveClass("textarea--error");
    });

    it("should not apply error class when error is false", () => {
      const onChange = vi.fn();
      render(
        <TextArea name="bio" value="" onChange={onChange} error={false} />
      );

      expect(screen.getByRole("textbox")).not.toHaveClass("textarea--error");
    });

    it("should set aria-invalid when error is true", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} error={true} />);

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });

    it("should allow overriding aria-invalid via props", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
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
      render(<TextArea name="bio" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveClass("textarea");
    });

    it("should support custom className", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
          value=""
          onChange={onChange}
          className="custom-class"
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("textarea");
      expect(textarea).toHaveClass("custom-class");
    });

    it("should combine base, error, and custom classes", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
          value=""
          onChange={onChange}
          error={true}
          className="custom-class"
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("textarea");
      expect(textarea).toHaveClass("textarea--error");
      expect(textarea).toHaveClass("custom-class");
    });

    it("should trim className properly", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
          value=""
          onChange={onChange}
          className="  custom-class  "
        />
      );

      const textarea = screen.getByRole("textbox");
      const className = textarea.className;
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
        <TextArea
          name="bio"
          value=""
          onChange={onChange}
          error={true}
          aria-describedby="bio-error"
        />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "bio-error"
      );
    });

    it("should support aria-required", () => {
      const onChange = vi.fn();
      render(
        <TextArea name="bio" value="" onChange={onChange} required={true} />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-required",
        "true"
      );
    });

    it("should allow overriding aria-required via props", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
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
        <TextArea
          name="bio"
          value=""
          onChange={onChange}
          aria-label="Biography"
        />
      );

      expect(screen.getByLabelText("Biography")).toBeInTheDocument();
    });

    it("should support aria-labelledby", () => {
      const onChange = vi.fn();
      render(
        <TextArea
          name="bio"
          value=""
          onChange={onChange}
          aria-labelledby="bio-label"
        />
      );

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-labelledby",
        "bio-label"
      );
    });
  });

  // ============================================================================
  // Integration with Form
  // ============================================================================

  describe("Integration with Form", () => {
    it("should work with form getFieldProps", () => {
      const fieldProps = {
        name: "bio",
        value: "My bio text",
        onChange: vi.fn(),
        onBlur: vi.fn(),
      };

      render(<TextArea {...fieldProps} />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.name).toBe("bio");
      expect(textarea.value).toBe("My bio text");
    });

    it("should handle empty string value from form", () => {
      const onChange = vi.fn();
      render(<TextArea name="bio" value="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("should update when controlled value changes", () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TextArea name="bio" value="initial" onChange={onChange} />
      );

      expect(screen.getByRole("textbox")).toHaveValue("initial");

      rerender(<TextArea name="bio" value="updated" onChange={onChange} />);

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
        <TextArea name="bio" value="" onChange={onChange} className="" />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea.className).toBe("textarea");
    });

    it("should handle very long values", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const longValue = "a".repeat(1000);

      render(<TextArea name="bio" value="" onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, longValue);

      expect(onChange).toHaveBeenCalledTimes(1000);
    });

    it("should handle special characters in value", () => {
      const onChange = vi.fn();
      const specialChars = "Test!@#$%^&*()[]{}|\\:;\"'<>?,./";

      render(<TextArea name="bio" value={specialChars} onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue(specialChars);
    });

    it("should handle Unicode characters", () => {
      const onChange = vi.fn();
      const unicode = "你好世界";

      render(<TextArea name="bio" value={unicode} onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue(unicode);
    });

    it("should handle emoji in value", () => {
      const onChange = vi.fn();
      const emoji = "Hello 👋 World 🌍";

      render(<TextArea name="bio" value={emoji} onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue(emoji);
    });

    it("should handle newlines in initial value", () => {
      const onChange = vi.fn();
      const multilineValue = "Line 1\nLine 2\nLine 3";

      render(
        <TextArea name="bio" value={multilineValue} onChange={onChange} />
      );

      expect(screen.getByRole("textbox")).toHaveValue(multilineValue);
    });

    it("should handle tabs in value", () => {
      const onChange = vi.fn();
      const valueWithTabs = "Column1\tColumn2\tColumn3";

      render(
        <TextArea name="bio" value={valueWithTabs} onChange={onChange} />
      );

      expect(screen.getByRole("textbox")).toHaveValue(valueWithTabs);
    });
  });

  // ============================================================================
  // Display Name
  // ============================================================================

  describe("Component Meta", () => {
    it("should have displayName set", () => {
      expect(TextArea.displayName).toBe("TextArea");
    });
  });
});
