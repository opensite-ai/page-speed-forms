import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelect } from "../MultiSelect";
import type { MultiSelectOption } from "../MultiSelect";

describe("MultiSelect", () => {
  const defaultOptions: MultiSelectOption[] = [
    { value: "js", label: "JavaScript" },
    { value: "ts", label: "TypeScript" },
    { value: "py", label: "Python" },
    { value: "go", label: "Go" },
  ];

  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveTextContent("Select...");
    });

    it("should render with custom placeholder", () => {
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
          placeholder="Choose languages"
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Choose languages");
    });

    it("should render selected values as chips", () => {
      const { container } = render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      const valueList = container.querySelector(".flex.flex-wrap.gap-1");
      expect(valueList).toBeInTheDocument();
      expect(valueList?.textContent).toContain("JavaScript");
      expect(valueList?.textContent).toContain("TypeScript");
    });

    it("should render hidden native select for form submission", () => {
      const { container } = render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      const hiddenSelect = container.querySelector('select[name="languages"]');
      expect(hiddenSelect).toBeInTheDocument();
      expect(hiddenSelect).toHaveAttribute("multiple");
      // Check that the select has the correct values
      const selectedOptions = Array.from(hiddenSelect?.selectedOptions || []);
      expect(selectedOptions).toHaveLength(2);
      expect(selectedOptions.map((opt: any) => opt.value)).toEqual(expect.arrayContaining(["js", "ts"]));
    });
  });

  describe("Multi-Selection", () => {
    it("should select multiple options", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={onChange}
          options={defaultOptions}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      await user.click(options[0]); // Select JavaScript
      expect(onChange).toHaveBeenCalledWith(["js"]);

      await user.click(options[1]); // Select TypeScript
      expect(onChange).toHaveBeenCalledWith(["ts"]);
    });

    it("should deselect option when clicked again", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelect
          name="languages"
          value={["js"]}
          onChange={onChange}
          options={defaultOptions}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      await user.click(options[0]); // Deselect JavaScript
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("should show checkboxes for selected options", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      // Check that selected options show checkboxes
      expect(options[0]).toHaveTextContent("☑"); // JavaScript
      expect(options[1]).toHaveTextContent("☑"); // TypeScript
      expect(options[2]).toHaveTextContent("☐"); // Python
      expect(options[3]).toHaveTextContent("☐"); // Go
    });

    it("should keep dropdown open after selection", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      await user.click(options[0]); // Select JavaScript

      // Dropdown should still be open
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  describe("Value Chips", () => {
    it("should render remove buttons on chips", () => {
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      const removeButtons = screen.getAllByRole("button", { name: /^Remove / });
      expect(removeButtons).toHaveLength(2);
    });

    it("should remove value when chip remove button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts", "py"]}
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const removeButton = screen.getByRole("button", { name: "Remove TypeScript" });
      await user.click(removeButton);

      expect(onChange).toHaveBeenCalledWith(["js", "py"]);
    });

    it("should not open dropdown when removing chip", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      const removeButton = screen.getByRole("button", { name: "Remove JavaScript" });
      await user.click(removeButton);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("Select All/Clear All", () => {
    it("should render Select All and Clear All buttons when showSelectAll is true", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={["js"]}
          onChange={() => {}}
          options={defaultOptions}
          showSelectAll
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByText("Select All")).toBeInTheDocument();
      expect(screen.getByText("Clear All")).toBeInTheDocument();
    });

    it("should not render Select All/Clear All when showSelectAll is false", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
          showSelectAll={false}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.queryByText("Select All")).not.toBeInTheDocument();
      expect(screen.queryByText("Clear All")).not.toBeInTheDocument();
    });

    it("should select all options when Select All is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={onChange}
          options={defaultOptions}
          showSelectAll
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByText("Select All"));

      expect(onChange).toHaveBeenCalledWith(["js", "ts", "py", "go"]);
    });

    it("should clear all options when Clear All is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts", "py", "go"]}
          onChange={onChange}
          options={defaultOptions}
          showSelectAll
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByText("Clear All"));

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("should not select disabled options with Select All", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const optionsWithDisabled: MultiSelectOption[] = [
        { value: "js", label: "JavaScript" },
        { value: "ts", label: "TypeScript", disabled: true },
        { value: "py", label: "Python" },
      ];

      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={onChange}
          options={optionsWithDisabled}
          showSelectAll
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByText("Select All"));

      expect(onChange).toHaveBeenCalledWith(["js", "py"]);
    });
  });

  describe("Max Selections", () => {
    it("should enforce maxSelections limit", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={onChange}
          options={defaultOptions}
          maxSelections={2}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      await user.click(options[2]); // Try to select Python (3rd item)

      // onChange should not be called because limit is reached
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should show max selections message when limit is reached", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={() => {}}
          options={defaultOptions}
          maxSelections={2}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByText("Maximum 2 selections reached")).toBeInTheDocument();
    });

    it("should disable unselected options when max is reached", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={() => {}}
          options={defaultOptions}
          maxSelections={2}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      // Unselected options should be disabled
      expect(options[2]).toHaveClass("pointer-events-none", "opacity-50"); // Python
      expect(options[3]).toHaveClass("pointer-events-none", "opacity-50"); // Go
    });

    it("should allow deselecting when max is reached", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={onChange}
          options={defaultOptions}
          maxSelections={2}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      await user.click(options[0]); // Deselect JavaScript

      expect(onChange).toHaveBeenCalledWith(["ts"]);
    });
  });

  describe("Search Functionality", () => {
    it("should filter options based on search query", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
          searchable
        />
      );

      await user.click(screen.getByRole("combobox"));

      const searchInput = await screen.findByPlaceholderText("Search...");
      await user.type(searchInput, "type");

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        const options = within(listbox).getAllByRole("option");
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent("TypeScript");
      });
    });

    it("should show filtered options when searching", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
          searchable
        />
      );

      await user.click(screen.getByRole("combobox"));

      const searchInput = await screen.findByPlaceholderText("Search...");
      await user.type(searchInput, "script");

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        const options = within(listbox).getAllByRole("option");
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent("JavaScript");
        expect(options[1]).toHaveTextContent("TypeScript");
      });
    });
  });

  describe("Disabled Options", () => {
    it("should render disabled options", async () => {
      const user = userEvent.setup();
      const optionsWithDisabled: MultiSelectOption[] = [
        { value: "js", label: "JavaScript" },
        { value: "ts", label: "TypeScript", disabled: true },
        { value: "py", label: "Python" },
      ];

      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={optionsWithDisabled}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      expect(options[1]).toHaveClass("pointer-events-none", "opacity-50");
      expect(options[1]).toHaveAttribute("aria-disabled", "true");
    });

    it("should not select disabled options", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const optionsWithDisabled: MultiSelectOption[] = [
        { value: "js", label: "JavaScript" },
        { value: "ts", label: "TypeScript", disabled: true },
        { value: "py", label: "Python" },
      ];

      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={onChange}
          options={optionsWithDisabled}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      await user.click(options[1]); // Try to click TypeScript (disabled)

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should open dropdown with Enter key", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    it("should toggle selection with Space key", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}"); // Focus second option
      await user.keyboard(" "); // Toggle with Space

      expect(onChange).toHaveBeenCalledWith(["ts"]);
    });

    it("should close dropdown with Escape key", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls");
    });

    it("should mark selected options with aria-selected", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          name="languages"
          value={["js", "ts"]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      expect(options[0]).toHaveAttribute("aria-selected", "true"); // JavaScript
      expect(options[1]).toHaveAttribute("aria-selected", "true"); // TypeScript
      expect(options[2]).toHaveAttribute("aria-selected", "false"); // Python
    });

    it("should apply error state with aria-invalid", () => {
      render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
          error
        />
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("CSS Classes", () => {
    it("should apply base class", () => {
      const { container } = render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
        />
      );

      expect(container.querySelector(".relative.w-full")).toBeInTheDocument();
    });

    it("should apply error class when error is true", () => {
      const { container } = render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
          error
        />
      );

      const trigger = container.querySelector("[role='combobox']");
      expect(trigger).toHaveClass("border-red-500", "ring-1", "ring-red-500");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <MultiSelect
          name="languages"
          value={[]}
          onChange={() => {}}
          options={defaultOptions}
          className="custom-class"
        />
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Component Meta", () => {
    it("should have correct displayName", () => {
      expect(MultiSelect.displayName).toBe("MultiSelect");
    });
  });
});
