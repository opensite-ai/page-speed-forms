import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CheckboxGroup } from "../CheckboxGroup";
import type { CheckboxGroupOption } from "../CheckboxGroup";

const mockOptions: CheckboxGroupOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

const mockOptionsWithDescriptions: CheckboxGroupOption[] = [
  {
    value: "basic",
    label: "Basic Plan",
    description: "$9/month",
  },
  {
    value: "pro",
    label: "Pro Plan",
    description: "$29/month",
  },
  {
    value: "enterprise",
    label: "Enterprise Plan",
    description: "$99/month",
  },
];

describe("CheckboxGroup Component", () => {
  // ============================================================================
  // Basic Rendering
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should render checkbox group", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("should render all options as checkboxes", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(3);
    });

    it("should apply name attribute to all checkboxes", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute("name", "interests");
      });
    });

    it("should display option labels", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
    });

    it("should render group label when provided", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          label="Select your interests"
        />
      );

      expect(screen.getByText("Select your interests")).toBeInTheDocument();
    });

    it("should render group description when provided", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          label="Interests"
          description="Choose all that apply"
        />
      );

      expect(screen.getByText("Choose all that apply")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Multiple Selection
  // ============================================================================

  describe("Multiple Selection", () => {
    it("should display selected values as checked", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={["option1", "option3"]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });

    it("should call onChange with updated array when checkbox is checked", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxGroup
          name="interests"
          value={["option1"]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      const checkbox = screen.getByLabelText("Option 2");
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(["option1", "option2"]);
    });

    it("should call onChange with filtered array when checkbox is unchecked", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxGroup
          name="interests"
          value={["option1", "option2"]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      const checkbox = screen.getByLabelText("Option 1");
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(["option2"]);
    });

    it("should handle empty initial value", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  // ============================================================================
  // Select All Feature
  // ============================================================================

  describe("Select All Feature", () => {
    it("should render select all checkbox when showSelectAll is true", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          showSelectAll
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(4); // 3 options + 1 select all
    });

    it("should not render select all checkbox by default", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(3);
    });

    it("should use custom select all label", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          showSelectAll
          selectAllLabel="Choose all"
        />
      );

      expect(screen.getByLabelText("Choose all")).toBeInTheDocument();
    });

    it("should check select all when all options are selected", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={["option1", "option2", "option3"]}
          onChange={onChange}
          options={mockOptions}
          showSelectAll
        />
      );

      const selectAllCheckbox = screen.getByLabelText("Select all");
      expect(selectAllCheckbox).toBeChecked();
    });

    it("should set indeterminate when some options are selected", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={["option1"]}
          onChange={onChange}
          options={mockOptions}
          showSelectAll
        />
      );

      const selectAllCheckbox = screen.getByLabelText(
        "Select all"
      ) as HTMLInputElement;
      expect(selectAllCheckbox.indeterminate).toBe(true);
    });

    it("should select all options when select all is checked", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          showSelectAll
        />
      );

      const selectAllCheckbox = screen.getByLabelText("Select all");
      await user.click(selectAllCheckbox);

      expect(onChange).toHaveBeenCalledWith(["option1", "option2", "option3"]);
    });

    it("should deselect all options when select all is unchecked", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxGroup
          name="interests"
          value={["option1", "option2", "option3"]}
          onChange={onChange}
          options={mockOptions}
          showSelectAll
        />
      );

      const selectAllCheckbox = screen.getByLabelText("Select all");
      await user.click(selectAllCheckbox);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("should not include disabled options in select all", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      const optionsWithDisabled = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2", disabled: true },
        { value: "option3", label: "Option 3" },
      ];

      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={optionsWithDisabled}
          showSelectAll
        />
      );

      const selectAllCheckbox = screen.getByLabelText("Select all");
      await user.click(selectAllCheckbox);

      expect(onChange).toHaveBeenCalledWith(["option1", "option3"]);
    });
  });

  // ============================================================================
  // Min/Max Selections
  // ============================================================================

  describe("Min/Max Selections", () => {
    it("should display min selections feedback", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          minSelections={2}
        />
      );

      expect(
        screen.getByText("Select at least 2 options")
      ).toBeInTheDocument();
    });

    it("should display max selections counter", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={["option1"]}
          onChange={onChange}
          options={mockOptions}
          maxSelections={3}
        />
      );

      expect(screen.getByText("1/3 selected")).toBeInTheDocument();
    });

    it("should prevent selection when max is reached", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxGroup
          name="interests"
          value={["option1", "option2"]}
          onChange={onChange}
          options={mockOptions}
          maxSelections={2}
        />
      );

      const checkbox = screen.getByLabelText("Option 3");
      await user.click(checkbox);

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should allow deselection when max is reached", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxGroup
          name="interests"
          value={["option1", "option2"]}
          onChange={onChange}
          options={mockOptions}
          maxSelections={2}
        />
      );

      const checkbox = screen.getByLabelText("Option 1");
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(["option2"]);
    });

    it("should disable unchecked options when max is reached", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={["option1", "option2"]}
          onChange={onChange}
          options={mockOptions}
          maxSelections={2}
        />
      );

      const checkbox = screen.getByLabelText("Option 3");
      expect(checkbox).toBeDisabled();
    });
  });

  // ============================================================================
  // Option Features
  // ============================================================================

  describe("Option Features", () => {
    it("should render option descriptions", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="plan"
          value={[]}
          onChange={onChange}
          options={mockOptionsWithDescriptions}
        />
      );

      expect(screen.getByText("$9/month")).toBeInTheDocument();
      expect(screen.getByText("$29/month")).toBeInTheDocument();
      expect(screen.getByText("$99/month")).toBeInTheDocument();
    });

    it("should disable individual options", () => {
      const onChange = vi.fn();
      const optionsWithDisabled = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2", disabled: true },
        { value: "option3", label: "Option 3" },
      ];

      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={optionsWithDisabled}
        />
      );

      const checkbox = screen.getByLabelText("Option 2");
      expect(checkbox).toBeDisabled();
    });

    it("should support custom option rendering", () => {
      const onChange = vi.fn();
      const renderOption = (option: CheckboxGroupOption) => (
        <strong data-testid={`custom-${option.value}`}>{option.label}</strong>
      );

      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          renderOption={renderOption}
        />
      );

      expect(screen.getByTestId("custom-option1")).toBeInTheDocument();
      expect(screen.getByTestId("custom-option2")).toBeInTheDocument();
      expect(screen.getByTestId("custom-option3")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Layout Options
  // ============================================================================

  describe("Layout Options", () => {
    it("should apply stacked layout by default", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveClass("flex-col");
    });

    it("should apply inline layout", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          layout="inline"
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveClass("flex-row");
    });

    it("should apply grid layout", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          layout="grid"
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveClass("grid");
    });

    it("should apply grid columns style", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          layout="grid"
          gridColumns={3}
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveStyle({ gridTemplateColumns: "repeat(3, 1fr)" });
    });

    it("should use default 2 columns for grid layout", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          layout="grid"
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveStyle({ gridTemplateColumns: "repeat(2, 1fr)" });
    });
  });

  // ============================================================================
  // State Management
  // ============================================================================

  describe("State Management", () => {
    it("should apply disabled state to all checkboxes", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          disabled
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeDisabled();
      });
    });

    it("should apply error class when error is true", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          error
        />
      );

      // CheckboxGroup passes error to Checkbox, which applies border-destructive on the indicator div
      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        const indicator = checkbox.nextElementSibling;
        expect(indicator?.className).toContain("border-destructive");
      });
    });

    it("should call onBlur when checkbox loses focus", async () => {
      const onChange = vi.fn();
      const onBlur = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          onBlur={onBlur}
          options={mockOptions}
        />
      );

      const checkbox = screen.getByLabelText("Option 1");
      await user.click(checkbox);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  describe("Accessibility", () => {
    it("should apply aria-invalid when error is true", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          error
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-invalid", "true");
    });

    it("should apply aria-required when required is true", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          required
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-required", "true");
    });

    it("should apply aria-describedby", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          aria-describedby="interests-error"
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-describedby", "interests-error");
    });

    it("should apply aria-label from label prop", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          label="Select interests"
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-label", "Select interests");
    });

    it("should link option descriptions with aria-describedby", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="plan"
          value={[]}
          onChange={onChange}
          options={mockOptionsWithDescriptions}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Basic Plan/ });
      expect(checkbox).toHaveAttribute("aria-describedby", "plan-basic-description");
    });

    it("should have aria-live region for feedback", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          minSelections={2}
        />
      );

      const feedback = screen.getByText("Select at least 2 options").parentElement;
      expect(feedback).toHaveAttribute("aria-live", "polite");
    });
  });

  // ============================================================================
  // Custom Props
  // ============================================================================

  describe("Custom Props", () => {
    it("should forward custom className", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          className="custom-class"
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveClass("custom-class");
    });

    it("should preserve base classes with custom className", () => {
      const onChange = vi.fn();
      render(
        <CheckboxGroup
          name="interests"
          value={[]}
          onChange={onChange}
          options={mockOptions}
          className="custom-class"
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveClass("w-full");
      expect(group).toHaveClass("custom-class");
    });
  });
});
