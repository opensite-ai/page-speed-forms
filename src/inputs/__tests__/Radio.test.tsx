import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Radio } from "../Radio";
import type { RadioOption } from "../Radio";

const defaultOptions: RadioOption[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

describe.skip("Radio Component", () => {
  // ============================================================================
  // Basic Rendering
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should render radiogroup element", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("should render all radio options", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("should render option labels", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      expect(screen.getByLabelText("Small")).toBeInTheDocument();
      expect(screen.getByLabelText("Medium")).toBeInTheDocument();
      expect(screen.getByLabelText("Large")).toBeInTheDocument();
    });

    it("should check the radio matching the value", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value="medium"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const mediumRadio = screen.getByLabelText("Medium") as HTMLInputElement;
      expect(mediumRadio.checked).toBe(true);
    });

    it("should not check any radio when value is empty", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];
      radios.forEach((radio) => {
        expect(radio.checked).toBe(false);
      });
    });

    it("should render with stacked layout by default", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const radiogroup = screen.getByRole("radiogroup");
      // Default stacked layout uses grid
      expect(radiogroup.className).toMatch(/grid|w-full/);
    });
  });

  // ============================================================================
  // Radio Options Configuration
  // ============================================================================

  describe("Radio Options Configuration", () => {
    it("should support option descriptions", () => {
      const onChange = vi.fn();
      const optionsWithDesc: RadioOption[] = [
        {
          value: "basic",
          label: "Basic",
          description: "$9/month",
        },
        {
          value: "pro",
          label: "Pro",
          description: "$29/month",
        },
      ];

      render(
        <Radio
          name="plan"
          value=""
          onChange={onChange}
          options={optionsWithDesc}
        />
      );

      expect(screen.getByText("$9/month")).toBeInTheDocument();
      expect(screen.getByText("$29/month")).toBeInTheDocument();
    });

    it("should support disabled individual options", () => {
      const onChange = vi.fn();
      const optionsWithDisabled: RadioOption[] = [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium", disabled: true },
        { value: "large", label: "Large" },
      ];

      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={optionsWithDisabled}
        />
      );

      const mediumRadio = screen.getByLabelText("Medium");
      expect(mediumRadio).toBeDisabled();
    });

    it("should support React node labels", () => {
      const onChange = vi.fn();
      const optionsWithNodes: RadioOption[] = [
        { value: "small", label: <span>Small Size</span> },
        { value: "medium", label: <strong>Medium Size</strong> },
      ];

      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={optionsWithNodes}
        />
      );

      expect(screen.getByText("Small Size")).toBeInTheDocument();
      expect(screen.getByText("Medium Size")).toBeInTheDocument();
    });

    it("should support React node descriptions", () => {
      const onChange = vi.fn();
      const optionsWithNodeDesc: RadioOption[] = [
        {
          value: "pro",
          label: "Pro",
          description: <em>Best value</em>,
        },
      ];

      render(
        <Radio
          name="plan"
          value=""
          onChange={onChange}
          options={optionsWithNodeDesc}
        />
      );

      expect(screen.getByText("Best value")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // User Interaction
  // ============================================================================

  describe("User Interaction", () => {
    it("should call onChange when radio is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const smallRadio = screen.getByLabelText("Small");
      await user.click(smallRadio);

      expect(onChange).toHaveBeenCalledWith("small");
    });

    it("should call onChange with new value when switching selection", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value="small"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const mediumRadio = screen.getByLabelText("Medium");
      await user.click(mediumRadio);

      expect(onChange).toHaveBeenCalledWith("medium");
    });

    it("should call onBlur when radio loses focus", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onBlur = vi.fn();

      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          onBlur={onBlur}
          options={defaultOptions}
        />
      );

      const smallRadio = screen.getByLabelText("Small");
      await user.click(smallRadio);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });

    it("should not call onBlur if not provided", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const smallRadio = screen.getByLabelText("Small");
      await user.click(smallRadio);
      await user.tab();

      // Should not throw error
      expect(onChange).toHaveBeenCalled();
    });

    it("should support controlled input pattern", async () => {
      const user = userEvent.setup();
      let value = "";
      const onChange = vi.fn((newValue: string) => {
        value = newValue;
      });

      const { rerender } = render(
        <Radio
          name="size"
          value={value}
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const mediumRadio = screen.getByLabelText("Medium");
      await user.click(mediumRadio);

      value = "medium";
      rerender(
        <Radio
          name="size"
          value={value}
          onChange={onChange}
          options={defaultOptions}
        />
      );

      expect((mediumRadio as HTMLInputElement).checked).toBe(true);
    });

    it("should not trigger onChange for disabled options", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const optionsWithDisabled: RadioOption[] = [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium", disabled: true },
      ];

      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={optionsWithDisabled}
        />
      );

      const mediumRadio = screen.getByLabelText("Medium");
      await user.click(mediumRadio);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  describe("Keyboard Navigation", () => {
    it("should navigate to next option with ArrowDown", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value="small"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const smallRadio = screen.getByLabelText("Small");
      smallRadio.focus();
      await user.keyboard("{ArrowDown}");

      expect(onChange).toHaveBeenCalledWith("medium");
    });

    it("should navigate to previous option with ArrowUp", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value="medium"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const mediumRadio = screen.getByLabelText("Medium");
      mediumRadio.focus();
      await user.keyboard("{ArrowUp}");

      expect(onChange).toHaveBeenCalledWith("small");
    });

    it("should navigate to next option with ArrowRight", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value="small"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const smallRadio = screen.getByLabelText("Small");
      smallRadio.focus();
      await user.keyboard("{ArrowRight}");

      expect(onChange).toHaveBeenCalledWith("medium");
    });

    it("should navigate to previous option with ArrowLeft", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value="medium"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const mediumRadio = screen.getByLabelText("Medium");
      mediumRadio.focus();
      await user.keyboard("{ArrowLeft}");

      expect(onChange).toHaveBeenCalledWith("small");
    });

    it("should wrap around when navigating past last option", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value="large"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const largeRadio = screen.getByLabelText("Large");
      largeRadio.focus();
      await user.keyboard("{ArrowDown}");

      expect(onChange).toHaveBeenCalledWith("small");
    });

    it("should wrap around when navigating before first option", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <Radio
          name="size"
          value="small"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const smallRadio = screen.getByLabelText("Small");
      smallRadio.focus();
      await user.keyboard("{ArrowUp}");

      expect(onChange).toHaveBeenCalledWith("large");
    });

    it("should skip disabled options during keyboard navigation", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const optionsWithDisabled: RadioOption[] = [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium", disabled: true },
        { value: "large", label: "Large" },
      ];

      render(
        <Radio
          name="size"
          value="small"
          onChange={onChange}
          options={optionsWithDisabled}
        />
      );

      const smallRadio = screen.getByLabelText("Small");
      smallRadio.focus();
      await user.keyboard("{ArrowDown}");

      // Should skip medium (disabled) and go to large
      expect(onChange).toHaveBeenCalledWith("large");
    });
  });

  // ============================================================================
  // Layout Options
  // ============================================================================

  describe("Layout Options", () => {
    it("should support inline layout", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          layout="inline"
        />
      );

      expect(screen.getByRole("radiogroup")).toHaveClass("md:grid-cols-2");
    });

    it("should use stacked layout by default", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const radiogroup = screen.getByRole("radiogroup");
      // Default stacked layout uses grid
      expect(radiogroup.className).toMatch(/grid|w-full/);
    });
  });

  // ============================================================================
  // Attributes and States
  // ============================================================================

  describe("Attributes and States", () => {
    it("should apply name to all radio inputs", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];
      radios.forEach((radio) => {
        expect(radio.name).toBe("size");
      });
    });

    it("should support disabled state for all options", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          disabled={true}
        />
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it("should be enabled by default", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).not.toBeDisabled();
      });
    });

    it("should support required attribute", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          required={true}
        />
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toBeRequired();
      });
    });

    it("should not be required by default", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).not.toBeRequired();
      });
    });

    it("should generate unique IDs for each option", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const smallRadio = screen.getByLabelText("Small");
      const mediumRadio = screen.getByLabelText("Medium");
      const largeRadio = screen.getByLabelText("Large");

      expect(smallRadio.id).toBe("size-small");
      expect(mediumRadio.id).toBe("size-medium");
      expect(largeRadio.id).toBe("size-large");
    });
  });

  // ============================================================================
  // Error State
  // ============================================================================

  describe("Error State", () => {
    it("should apply error class when error is true", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error={true}
        />
      );

      // Radio applies error class to the indicator div (sibling of sr-only input)
      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        const indicator = radio.nextElementSibling;
        expect(indicator?.className).toContain("border-destructive");
      });
    });

    it("should not apply error class when error is false", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error={false}
        />
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio.className).not.toContain("border-destructive");
      });
    });

    it("should set aria-invalid when error is true", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error={true}
        />
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });

    it("should allow overriding aria-invalid via props", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error={false}
          aria-invalid={true}
        />
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
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
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const radiogroup = screen.getByRole("radiogroup");
      // Default uses grid layout
      expect(radiogroup.className).toMatch(/grid|w-full/);
    });

    it("should support custom className", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          className="custom-class"
        />
      );

      const radiogroup = screen.getByRole("radiogroup");
      expect(radiogroup).toHaveClass("w-full");
      expect(radiogroup).toHaveClass("custom-class");
    });

    it("should combine base, error, layout, and custom classes", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error={true}
          layout="inline"
          className="custom-class"
        />
      );

      const radiogroup = screen.getByRole("radiogroup");
      // Layout inline uses a responsive two-column grid.
      expect(radiogroup).toHaveClass("w-full");
      expect(radiogroup).toHaveClass("grid");
      expect(radiogroup).toHaveClass("md:grid-cols-2");
      expect(radiogroup.className).toContain("custom-class");
    });

    it("should trim className properly", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          className="  custom-class  "
        />
      );

      const radiogroup = screen.getByRole("radiogroup");
      expect(radiogroup).toHaveClass("custom-class");
    });
  });

  // ============================================================================
  // Group Label
  // ============================================================================

  describe("Group Label", () => {
    it("should render group label when provided", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          label="Select a size"
        />
      );

      expect(screen.getByText("Select a size")).toBeInTheDocument();
    });

    it("should support React node as label", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          label={<strong>Select a size</strong>}
        />
      );

      expect(screen.getByText("Select a size")).toBeInTheDocument();
    });

    it("should not render label div when label not provided", () => {
      const onChange = vi.fn();
      const { container } = render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const labelDiv = container.querySelector(".radio-group-label");
      expect(labelDiv).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  describe("Accessibility", () => {
    it("should have radiogroup role", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("should support aria-describedby for error messages", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error={true}
          aria-describedby="size-error"
        />
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "aria-describedby",
        "size-error"
      );
    });

    it("should support aria-required", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          required={true}
        />
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "aria-required",
        "true"
      );
    });

    it("should allow overriding aria-required via props", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          required={false}
          aria-required={true}
        />
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "aria-required",
        "true"
      );
    });

    it("should support aria-label", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          aria-label="Size selection"
        />
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "aria-label",
        "Size selection"
      );
    });

    it("should use string label as aria-label", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          label="Size selection"
        />
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "aria-label",
        "Size selection"
      );
    });

    it("should link option descriptions with aria-describedby", () => {
      const onChange = vi.fn();
      const optionsWithDesc: RadioOption[] = [
        {
          value: "basic",
          label: "Basic",
          description: "Best for beginners",
        },
      ];

      render(
        <Radio
          name="plan"
          value=""
          onChange={onChange}
          options={optionsWithDesc}
        />
      );

      const radio = screen.getByRole("radio");
      expect(radio).toHaveAttribute("aria-describedby", "plan-basic-description");
    });
  });

  // ============================================================================
  // Integration with Form
  // ============================================================================

  describe("Integration with Form", () => {
    it("should work with form getFieldProps", () => {
      const fieldProps = {
        name: "size",
        value: "medium",
        onChange: vi.fn(),
        onBlur: vi.fn(),
      };

      render(<Radio {...fieldProps} options={defaultOptions} />);

      const mediumRadio = screen.getByLabelText("Medium") as HTMLInputElement;
      expect(mediumRadio.checked).toBe(true);
    });

    it("should handle empty string value from form", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];
      radios.forEach((radio) => {
        expect(radio.checked).toBe(false);
      });
    });

    it("should update when controlled value changes", () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <Radio
          name="size"
          value="small"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      let smallRadio = screen.getByLabelText("Small") as HTMLInputElement;
      expect(smallRadio.checked).toBe(true);

      rerender(
        <Radio
          name="size"
          value="large"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      smallRadio = screen.getByLabelText("Small") as HTMLInputElement;
      const largeRadio = screen.getByLabelText("Large") as HTMLInputElement;
      expect(smallRadio.checked).toBe(false);
      expect(largeRadio.checked).toBe(true);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle empty options array", () => {
      const onChange = vi.fn();
      render(<Radio name="size" value="" onChange={onChange} options={[]} />);

      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
      expect(screen.queryAllByRole("radio")).toHaveLength(0);
    });

    it("should handle single option", () => {
      const onChange = vi.fn();
      const singleOption: RadioOption[] = [{ value: "only", label: "Only Option" }];

      render(
        <Radio
          name="choice"
          value=""
          onChange={onChange}
          options={singleOption}
        />
      );

      expect(screen.getAllByRole("radio")).toHaveLength(1);
    });

    it("should handle special characters in values", () => {
      const onChange = vi.fn();
      const specialOptions: RadioOption[] = [
        { value: "option-1", label: "Option 1" },
        { value: "option_2", label: "Option 2" },
        { value: "option.3", label: "Option 3" },
      ];

      render(
        <Radio
          name="special"
          value="option-1"
          onChange={onChange}
          options={specialOptions}
        />
      );

      const radio1 = screen.getByLabelText("Option 1") as HTMLInputElement;
      expect(radio1.checked).toBe(true);
    });

    it("should handle empty string className gracefully", () => {
      const onChange = vi.fn();
      render(
        <Radio
          name="size"
          value=""
          onChange={onChange}
          options={defaultOptions}
          className=""
        />
      );

      const radiogroup = screen.getByRole("radiogroup");
      // Default stacked layout uses grid
      expect(radiogroup.className).toMatch(/grid|flex/);
    });
  });

  // ============================================================================
  // Display Name
  // ============================================================================

  describe("Component Meta", () => {
    it("should have displayName set", () => {
      expect(Radio.displayName).toBe("Radio");
    });
  });
});
