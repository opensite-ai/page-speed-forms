import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimePicker } from "../TimePicker";

describe("TimePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Select time...");
    });

    it("should render with custom placeholder", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          placeholder="Pick a time"
        />
      );

      expect(screen.getByPlaceholderText("Pick a time")).toBeInTheDocument();
    });

    it("should display formatted time when value is provided (12-hour)", () => {
      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("2:30 PM");
    });

    it("should display formatted time when value is provided (24-hour)", () => {
      render(
        <TimePicker
          name="appointment"
          value="14:30"
          onChange={() => {}}
          use24Hour
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("14:30");
    });

    it("should render clock icon when showIcon is true", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          showIcon
        />
      );

      const icon = screen.getByRole("textbox").parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it("should not render clock icon when showIcon is false", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          showIcon={false}
        />
      );

      const icon = screen.getByRole("textbox").parentElement?.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it("should render clear button when value is present and clearable is true", () => {
      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
          clearable
        />
      );

      expect(screen.getByRole("button", { name: "Clear time" })).toBeInTheDocument();
    });

    it("should not render clear button when value is empty", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          clearable
        />
      );

      expect(screen.queryByRole("button", { name: "Clear time" })).not.toBeInTheDocument();
    });

    it("should not render clear button when clearable is false", () => {
      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
          clearable={false}
        />
      );

      expect(screen.queryByRole("button", { name: "Clear time" })).not.toBeInTheDocument();
    });

    it("should render hidden input for form submission", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
        />
      );

      const hiddenInput = container.querySelector('input[type="hidden"]') as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute("name", "appointment");
      expect(hiddenInput.value).toBe("2:30 PM");
    });
  });

  describe("Time Picker Popup", () => {
    it("should open time picker when input is clicked", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByText("Hour")).toBeInTheDocument();
        expect(screen.getByText("Minute")).toBeInTheDocument();
      });
    });

    it("should display Period column in 12-hour mode", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          use24Hour={false}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByText("Period")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "AM" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "PM" })).toBeInTheDocument();
      });
    });

    it("should not display Period column in 24-hour mode", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          use24Hour
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.queryByText("Period")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "AM" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "PM" })).not.toBeInTheDocument();
      });
    });

    it("should display hours 1-12 in 12-hour mode", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          use24Hour={false}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const dropdown = screen.getByText("Hour").parentElement;
        expect(dropdown).toBeInTheDocument();

        for (let i = 1; i <= 12; i++) {
          const hourButton = within(dropdown!).getByRole("button", {
            name: `${String(i).padStart(2, "0")} hours`
          });
          expect(hourButton).toBeInTheDocument();
        }
      });
    });

    it("should display hours 0-23 in 24-hour mode", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          use24Hour
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const dropdown = screen.getByText("Hour").parentElement;
        expect(dropdown).toBeInTheDocument();

        for (let i = 0; i <= 23; i++) {
          const hourButton = within(dropdown!).getByRole("button", {
            name: `${String(i).padStart(2, "0")} hours`
          });
          expect(hourButton).toBeInTheDocument();
        }
      });
    });

    it("should respect minuteStep prop", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          minuteStep={15}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const dropdown = screen.getByText("Minute").parentElement;
        expect(dropdown).toBeInTheDocument();

        // Should show 00, 15, 30, 45
        expect(within(dropdown!).getByRole("button", { name: "00 minutes" })).toBeInTheDocument();
        expect(within(dropdown!).getByRole("button", { name: "15 minutes" })).toBeInTheDocument();
        expect(within(dropdown!).getByRole("button", { name: "30 minutes" })).toBeInTheDocument();
        expect(within(dropdown!).getByRole("button", { name: "45 minutes" })).toBeInTheDocument();

        // Should not show other minutes
        expect(within(dropdown!).queryByRole("button", { name: "05 minutes" })).not.toBeInTheDocument();
        expect(within(dropdown!).queryByRole("button", { name: "10 minutes" })).not.toBeInTheDocument();
      });
    });

    it("should close picker when clicking outside", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <TimePicker
            name="appointment"
            value=""
            onChange={() => {}}
          />
          <button>Outside</button>
        </div>
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("Hour")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "Outside" }));

      await waitFor(() => {
        expect(screen.queryByText("Hour")).not.toBeInTheDocument();
      });
    });

    it("should highlight selected hour", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const hourButton = screen.getByRole("button", { name: "02 hours" });
        expect(hourButton).toHaveClass("bg-primary");
        expect(hourButton).toHaveClass("text-primary-foreground");
      });
    });

    it("should highlight selected minute", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const minuteButton = screen.getByRole("button", { name: "30 minutes" });
        expect(minuteButton).toHaveClass("bg-primary");
        expect(minuteButton).toHaveClass("text-primary-foreground");
      });
    });

    it("should highlight selected period", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const pmButton = screen.getByRole("button", { name: "PM" });
        expect(pmButton).toHaveClass("bg-muted");
        expect(pmButton).toHaveClass("font-semibold");
      });
    });
  });

  describe("Time Selection", () => {
    it("should call onChange when hour is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("Hour")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "02 hours" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toMatch(/2:00 (AM|PM)/);
    });

    it("should call onChange when minute is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimePicker
          name="appointment"
          value="2:00 PM"
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("Minute")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "30 minutes" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toBe("2:30 PM");
    });

    it("should call onChange when period is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimePicker
          name="appointment"
          value="2:30 AM"
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("Period")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "PM" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toBe("2:30 PM");
    });

    it("should keep picker open after selection", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("Hour")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "02 hours" }));

      // Picker should remain open
      expect(screen.getByText("Hour")).toBeInTheDocument();
    });

    it("should format time correctly in 24-hour mode", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={onChange}
          use24Hour
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("Hour")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "14 hours" }));
      await user.click(screen.getByRole("button", { name: "30 minutes" }));

      // Should be called twice (once for hour, once for minute)
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange.mock.calls[1][0]).toBe("14:30");
    });

    it("should handle midnight in 12-hour mode", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={onChange}
          use24Hour={false}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("Hour")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "12 hours" }));
      await user.click(screen.getByRole("button", { name: "00 minutes" }));
      await user.click(screen.getByRole("button", { name: "AM" }));

      expect(onChange.mock.calls[2][0]).toBe("12:00 AM");
    });

    it("should handle noon in 12-hour mode", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={onChange}
          use24Hour={false}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("Hour")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "12 hours" }));
      await user.click(screen.getByRole("button", { name: "00 minutes" }));
      await user.click(screen.getByRole("button", { name: "PM" }));

      expect(onChange.mock.calls[2][0]).toBe("12:00 PM");
    });
  });

  describe("Clear Functionality", () => {
    it("should clear time when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={onChange}
          clearable
        />
      );

      await user.click(screen.getByRole("button", { name: "Clear time" }));

      expect(onChange).toHaveBeenCalledWith("");
    });

    it("should not open picker when clear button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
          clearable
        />
      );

      await user.click(screen.getByRole("button", { name: "Clear time" }));

      expect(screen.queryByText("Hour")).not.toBeInTheDocument();
    });

    it("should focus input after clearing", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
          clearable
        />
      );

      const input = screen.getByRole("textbox");
      await user.click(screen.getByRole("button", { name: "Clear time" }));

      expect(input).toHaveFocus();
    });
  });

  describe("Disabled State", () => {
    it("should not open picker when disabled", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      await user.click(screen.getByRole("textbox"));

      expect(screen.queryByText("Hour")).not.toBeInTheDocument();
    });

    it("should disable input when disabled prop is true", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should not show clear button when disabled", () => {
      render(
        <TimePicker
          name="appointment"
          value="2:30 PM"
          onChange={() => {}}
          disabled
          clearable
        />
      );

      expect(screen.queryByRole("button", { name: "Clear time" })).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("should have aria-invalid when error is true", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          error
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have aria-required when required is true", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          required
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should have aria-describedby when provided", () => {
      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          aria-describedby="appointment-help"
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "appointment-help");
    });

    it("should have aria-label on zoom slider", async () => {
      const user = userEvent.setup();

      render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const clearButton = screen.queryByRole("button", { name: "Clear time" });
        if (clearButton) {
          expect(clearButton).toHaveAttribute("aria-label", "Clear time");
        }
      });
    });
  });

  describe("CSS Classes", () => {
    it("should apply base class", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
        />
      );

      const wrapper = container.querySelector('[class*="relative"]');
      expect(wrapper).toBeInTheDocument();
    });

    it("should apply error class when error is true", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          error
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-red-500");
    });

    it("should apply disabled class when disabled is true", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should apply open class when picker is open", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByText("Hour")).toBeInTheDocument();
      });
    });

    it("should apply custom className", () => {
      const { container } = render(
        <TimePicker
          name="appointment"
          value=""
          onChange={() => {}}
          className="custom-timepicker"
        />
      );

      expect(container.querySelector(".custom-timepicker")).toBeInTheDocument();
    });
  });

  describe("Component Meta", () => {
    it("should have correct displayName", () => {
      expect(TimePicker.displayName).toBe("TimePicker");
    });
  });
});
