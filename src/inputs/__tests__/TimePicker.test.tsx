import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimePicker } from "../TimePicker";

function getTimeInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="time"]');
  if (!input) {
    throw new Error("Expected time input to be rendered");
  }
  return input as HTMLInputElement;
}

describe("TimePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      const { container } = render(
        <TimePicker name="appointment" value="" onChange={() => {}} />,
      );

      const input = getTimeInput(container);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Select time...");
    });

    it("should render with custom placeholder", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          placeholder="Pick a time"
        />,
      );

      expect(getTimeInput(container)).toHaveAttribute(
        "placeholder",
        "Pick a time",
      );
    });

    it("should normalize 12-hour value into native input value", () => {
      const { container } = render(
        <TimePicker name="appointment" value="2:30 PM" onChange={() => {}} />,
      );

      expect(getTimeInput(container)).toHaveValue("14:30");
    });

    it("should normalize 24-hour value into padded native value", () => {
      const { container } = render(
        <TimePicker name="appointment" value="4:05" onChange={() => {}} />,
      );

      expect(getTimeInput(container)).toHaveValue("04:05");
    });

    it("should render empty value when provided value is invalid", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value="not-a-time"
          onChange={() => {}}
        />,
      );

      expect(getTimeInput(container)).toHaveValue("");
    });

    it("should render clock icon when showIcon is true", () => {
      const { container } = render(
        <TimePicker name="appointment" value="" onChange={() => {}} showIcon />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should not render clock icon when showIcon is false", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          showIcon={false}
        />,
      );

      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });

    it("should render clear button when value is present and clearable is true", () => {
      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
          clearable
        />,
      );

      expect(
        screen.getByRole("button", { name: "Clear time" }),
      ).toBeInTheDocument();
    });

    it("should not render clear button when value is empty", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          clearable
        />,
      );

      expect(
        screen.queryByRole("button", { name: "Clear time" }),
      ).not.toBeInTheDocument();
    });

    it("should not render clear button when disabled", () => {
      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
          clearable
          disabled
        />,
      );

      expect(
        screen.queryByRole("button", { name: "Clear time" }),
      ).not.toBeInTheDocument();
    });

    it("should render hidden input for form submission", () => {
      const { container } = render(
        <TimePicker name="appointment" value="2:30 PM" onChange={() => {}} />,
      );

      const hiddenInput = container.querySelector(
        'input[type="hidden"]',
      ) as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute("name", "appointment");
      expect(hiddenInput.value).toBe("2:30 PM");
    });
  });

  describe("User Interaction", () => {
    it("should call onChange with 12-hour formatted value by default", () => {
      const onChange = vi.fn();
      const { container } = render(
        <TimePicker name="appointment" value="" onChange={onChange} />,
      );

      fireEvent.change(getTimeInput(container), { target: { value: "14:30" } });
      expect(onChange).toHaveBeenCalledWith("2:30 PM");
    });

    it("should call onChange with 24-hour formatted value when use24Hour is true", () => {
      const onChange = vi.fn();
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={onChange}
          use24Hour
        />,
      );

      fireEvent.change(getTimeInput(container), { target: { value: "14:30" } });
      expect(onChange).toHaveBeenCalledWith("14:30");
    });

    it("should clear value when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <TimePicker name="appointment" value="2:30 PM" onChange={onChange} />,
      );

      const input = getTimeInput(container);
      await user.click(screen.getByRole("button", { name: "Clear time" }));

      expect(onChange).toHaveBeenCalledWith("");
      expect(input).toHaveFocus();
    });

    it("should call onBlur when input loses focus", async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      const { container } = render(
        <div>
          <TimePicker
            name="appointment"
            value=""
            onChange={() => {}}
            onBlur={onBlur}
          />
          <button type="button">Outside</button>
        </div>,
      );

      await user.click(getTimeInput(container));
      await user.click(screen.getByRole("button", { name: "Outside" }));

      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe("Attributes and Styling", () => {
    it("should apply minuteStep as step in seconds", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          minuteStep={15}
        />,
      );

      expect(getTimeInput(container)).toHaveAttribute("step", "900");
    });

    it("should clamp step to at least 1 second", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          minuteStep={0}
        />,
      );

      expect(getTimeInput(container)).toHaveAttribute("step", "1");
    });

    it("should support disabled and required attributes", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          disabled
          required
        />,
      );

      const input = getTimeInput(container);
      expect(input).toBeDisabled();
      expect(input).toBeRequired();
    });

    it("should apply ring style when a value is present", () => {
      const { container } = render(
        <TimePicker name="appointment" value="2:30 PM" onChange={() => {}} />,
      );

      expect(getTimeInput(container)).toHaveClass("ring-2", "ring-primary");
    });

    it("should not apply ring style when no value is present", () => {
      const { container } = render(
        <TimePicker name="appointment" value="" onChange={() => {}} />,
      );

      expect(getTimeInput(container)).not.toHaveClass("ring-2");
    });

    it("should apply error classes when error is true", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
          error
        />,
      );

      expect(getTimeInput(container)).toHaveClass("ring-2", "ring-destructive");
    });

    it("should support custom wrapper className", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          className="custom-wrapper"
        />,
      );

      expect(container.firstElementChild).toHaveClass("custom-wrapper");
    });

    it("should expose invalid aria state when error is true", () => {
      const { container } = render(
        <TimePicker name="appointment" value="" onChange={() => {}} error />,
      );

      expect(getTimeInput(container)).toHaveAttribute("aria-invalid", "true");
    });
  });
});
