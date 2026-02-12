import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Checkbox } from "../Checkbox";

describe("Checkbox Component", () => {
  // ============================================================================
  // Basic Rendering
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should render checkbox element", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should apply name attribute", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      expect(screen.getByRole("checkbox")).toHaveAttribute("name", "terms");
    });

    it("should display checked state", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={true} onChange={onChange} />);

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should display unchecked state", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should render without label by default", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.parentElement?.tagName).not.toBe("LABEL");
    });
  });

  // ============================================================================
  // Checkbox Specific Features
  // ============================================================================

  describe("Checkbox Specific Features", () => {
    it("should support label text", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label="I agree to the terms"
        />,
      );

      expect(screen.getByText("I agree to the terms")).toBeInTheDocument();
    });

    it("should wrap checkbox in label when label provided", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label="Accept terms"
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      // The checkbox is wrapped in a div, which is inside the label
      const label = checkbox.closest("label");
      expect(label?.tagName).toBe("LABEL");
    });

    it("should support indeterminate state", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="selectAll"
          value={false}
          onChange={onChange}
          indeterminate={true}
        />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it("should update indeterminate state when prop changes", () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <Checkbox
          name="selectAll"
          value={false}
          onChange={onChange}
          indeterminate={false}
        />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);

      rerender(
        <Checkbox
          name="selectAll"
          value={false}
          onChange={onChange}
          indeterminate={true}
        />,
      );

      expect(checkbox.indeterminate).toBe(true);
    });

    it("should support React node as label", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label={
            <span>
              I agree to the <strong>terms</strong>
            </span>
          }
        />,
      );

      expect(screen.getByText("terms")).toBeInTheDocument();
      expect(screen.getByText("I agree to the")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // User Interaction
  // ============================================================================

  describe("User Interaction", () => {
    it("should call onChange when checkbox clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should toggle from checked to unchecked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Checkbox name="terms" value={true} onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("should trigger onChange when clicking label", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label="Accept terms"
        />,
      );

      const label = screen.getByText("Accept terms");
      await user.click(label);

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should call onBlur when checkbox loses focus", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBlur = vi.fn();

      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          onBlur={onBlur}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      await user.tab();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it("should not call onBlur if not provided", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      await user.tab();

      // Should not throw error
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("should support controlled input pattern", async () => {
      const user = userEvent.setup();
      let value = false;
      const onChange = vi.fn((newValue: boolean) => {
        value = newValue;
      });

      const { rerender } = render(
        <Checkbox name="terms" value={value} onChange={onChange} />,
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      // Update with new value
      value = true;

      // Rerender with updated value
      rerender(<Checkbox name="terms" value={value} onChange={onChange} />);

      expect(checkbox).toBeChecked();
    });
  });

  // ============================================================================
  // Attributes and States
  // ============================================================================

  describe("Attributes and States", () => {
    it("should support disabled state", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          disabled={true}
        />,
      );

      expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("should be enabled by default", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      expect(screen.getByRole("checkbox")).not.toBeDisabled();
    });

    it("should not trigger onChange when disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          disabled={true}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should support required attribute", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          required={true}
        />,
      );

      expect(screen.getByRole("checkbox")).toBeRequired();
    });

    it("should not be required by default", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      expect(screen.getByRole("checkbox")).not.toBeRequired();
    });

    it("should forward additional HTML attributes", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          data-testid="custom-checkbox"
          id="terms-checkbox"
        />,
      );

      const checkbox = screen.getByTestId("custom-checkbox");
      expect(checkbox).toHaveAttribute("id", "terms-checkbox");
    });
  });

  // ============================================================================
  // Error State
  // ============================================================================

  describe("Error State", () => {
    it("should apply error class when error is true", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          error={true}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      const indicator = checkbox.nextElementSibling;
      expect(indicator?.className).toContain("border-destructive");
    });

    it("should not apply error class when error is false", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          error={false}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      const indicator = checkbox.nextElementSibling;
      expect(indicator?.className).not.toContain("border-destructive");
    });

    it("should set aria-invalid when error is true", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          error={true}
        />,
      );

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("should allow overriding aria-invalid via props", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          error={false}
          aria-invalid={true}
        />,
      );

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });

  // ============================================================================
  // CSS Classes
  // ============================================================================

  describe("CSS Classes", () => {
    it("should apply base indicator classes", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      const indicator = checkbox.nextElementSibling;
      expect(indicator).toHaveClass("rounded-full");
      expect(indicator).toHaveClass("border-2");
      expect(indicator).toHaveClass("size-6");
    });

    it("should support custom className on wrapper", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          className="custom-class"
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      const wrapper = checkbox.parentElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should combine error and custom classes", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          error={true}
          className="custom-class"
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      const indicator = checkbox.nextElementSibling;
      expect(indicator?.className).toContain("border-destructive");
      const wrapper = checkbox.parentElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should trim className properly", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          className="  custom-class  "
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      const wrapper = checkbox.parentElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should apply label wrapper class when label provided", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label="Accept"
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label");
      expect(label?.tagName).toBe("LABEL");
      expect(label?.className).toContain("flex");
      expect(label?.className).toContain("gap-3");
    });

    it("should apply label text class", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label="Accept terms"
        />,
      );

      const labelText = screen.getByText("Accept terms");
      expect(labelText).toHaveClass("text-sm");
      expect(labelText).toHaveClass("font-medium");
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  describe("Accessibility", () => {
    it("should support aria-describedby for error messages", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          error={true}
          aria-describedby="terms-error"
        />,
      );

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-describedby",
        "terms-error",
      );
    });

    it("should support aria-required", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          required={true}
        />,
      );

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-required",
        "true",
      );
    });

    it("should allow overriding aria-required via props", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          required={false}
          aria-required={true}
        />,
      );

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-required",
        "true",
      );
    });

    it("should support aria-label", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          aria-label="Terms and conditions"
        />,
      );

      expect(screen.getByLabelText("Terms and conditions")).toBeInTheDocument();
    });

    it("should support aria-labelledby", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          aria-labelledby="terms-label"
        />,
      );

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-labelledby",
        "terms-label",
      );
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      await user.keyboard(" "); // Space key

      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  // ============================================================================
  // Integration with Form
  // ============================================================================

  describe("Integration with Form", () => {
    it("should work with form getFieldProps", () => {
      const fieldProps = {
        name: "terms",
        value: true,
        onChange: vi.fn(),
        onBlur: vi.fn(),
      };

      render(<Checkbox {...fieldProps} />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.name).toBe("terms");
      expect(checkbox.checked).toBe(true);
    });

    it("should handle false value from form", () => {
      const onChange = vi.fn();
      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should update when controlled value changes", () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <Checkbox name="terms" value={false} onChange={onChange} />,
      );

      expect(screen.getByRole("checkbox")).not.toBeChecked();

      rerender(<Checkbox name="terms" value={true} onChange={onChange} />);

      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle empty string className gracefully", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          className=""
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      const indicator = checkbox.nextElementSibling;
      expect(indicator).toHaveClass("rounded-full");
      expect(indicator).toHaveClass("size-6");
    });

    it("should handle rapid clicking", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Checkbox name="terms" value={false} onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledTimes(3);
    });

    it("should handle indeterminate with checked state", () => {
      const onChange = vi.fn();
      render(
        <Checkbox
          name="selectAll"
          value={true}
          onChange={onChange}
          indeterminate={true}
        />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(true);
    });

    it("should handle label with special characters", () => {
      const onChange = vi.fn();
      const label = "I accept the <Terms> & Conditions!";

      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label={label}
        />,
      );

      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it("should handle label with Unicode characters", () => {
      const onChange = vi.fn();
      const label = "我同意条款";

      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label={label}
        />,
      );

      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it("should handle label with emoji", () => {
      const onChange = vi.fn();
      const label = "✅ Accept terms";

      render(
        <Checkbox
          name="terms"
          value={false}
          onChange={onChange}
          label={label}
        />,
      );

      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Component Meta
  // ============================================================================

  describe("Component Meta", () => {
    it("should have displayName set", () => {
      expect(Checkbox.displayName).toBe("Checkbox");
    });
  });
});
