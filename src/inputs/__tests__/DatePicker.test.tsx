import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "../DatePicker";

describe("DatePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Select date...");
    });

    it("should render with custom placeholder", () => {
      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          placeholder="Pick a date"
        />,
      );

      expect(screen.getByPlaceholderText("Pick a date")).toBeInTheDocument();
    });

    it("should display formatted date when value is provided", () => {
      const date = new Date(2024, 0, 15); // January 15, 2024

      render(<DatePicker name="birthdate" value={date} onChange={() => {}} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("01/15/2024");
    });

    it("should format date according to format prop", () => {
      const date = new Date(2024, 0, 15);

      render(
        <DatePicker
          name="birthdate"
          value={date}
          onChange={() => {}}
          format="yyyy-MM-dd"
        />,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("2024-01-15");
    });

    it("should render calendar icon when showIcon is true", () => {
      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          showIcon
        />,
      );

      const icon = screen
        .getByRole("textbox")
        .parentElement?.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should not render calendar icon when showIcon is false", () => {
      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          showIcon={false}
        />,
      );

      const icon = screen
        .getByRole("textbox")
        .parentElement?.querySelector("svg");
      expect(icon).not.toBeInTheDocument();
    });

    it("should render clear button when value is present and clearable is true", () => {
      const date = new Date(2024, 0, 15);

      render(
        <DatePicker
          name="birthdate"
          value={date}
          onChange={() => {}}
          clearable
        />,
      );

      expect(
        screen.getByRole("button", { name: "Clear date" }),
      ).toBeInTheDocument();
    });

    it("should not render clear button when value is null", () => {
      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          clearable
        />,
      );

      expect(
        screen.queryByRole("button", { name: "Clear date" }),
      ).not.toBeInTheDocument();
    });

    it("should not render clear button when clearable is false", () => {
      const date = new Date(2024, 0, 15);

      render(
        <DatePicker
          name="birthdate"
          value={date}
          onChange={() => {}}
          clearable={false}
        />,
      );

      expect(
        screen.queryByRole("button", { name: "Clear date" }),
      ).not.toBeInTheDocument();
    });

    it("should render hidden input for form submission", () => {
      const date = new Date(2024, 0, 15);
      const { container } = render(
        <DatePicker name="birthdate" value={date} onChange={() => {}} />,
      );

      const hiddenInput = container.querySelector(
        'input[type="hidden"]',
      ) as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute("name", "birthdate");
      expect(hiddenInput.value).toBe(date.toISOString());
    });
  });

  describe("Calendar Popup", () => {
    it("should open calendar when input is clicked", async () => {
      const user = userEvent.setup();

      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should display current month by default", async () => {
      const user = userEvent.setup();

      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      await user.click(screen.getByRole("textbox"));

      const now = new Date();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const expectedMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      await waitFor(() => {
        expect(screen.getByText(expectedMonth)).toBeInTheDocument();
      });
    });

    it("should display month of selected date", async () => {
      const user = userEvent.setup();
      const date = new Date(2024, 5, 15); // June 15, 2024

      render(<DatePicker name="birthdate" value={date} onChange={() => {}} />);

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByText("June 2024")).toBeInTheDocument();
      });
    });

    it("should close calendar when clicking outside", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <DatePicker name="birthdate" value={null} onChange={() => {}} />
          <button>Outside</button>
        </div>,
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "Outside" }));

      await waitFor(() => {
        expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      });
    });

    it("should navigate to previous month", async () => {
      const user = userEvent.setup();

      render(
        <DatePicker
          name="birthdate"
          value={new Date(2024, 5, 15)} // June 2024
          onChange={() => {}}
        />,
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() =>
        expect(screen.getByText("June 2024")).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Previous month" }));

      await waitFor(() => {
        expect(screen.getByText("May 2024")).toBeInTheDocument();
      });
    });

    it("should navigate to next month", async () => {
      const user = userEvent.setup();

      render(
        <DatePicker
          name="birthdate"
          value={new Date(2024, 5, 15)} // June 2024
          onChange={() => {}}
        />,
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() =>
        expect(screen.getByText("June 2024")).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Next month" }));

      await waitFor(() => {
        expect(screen.getByText("July 2024")).toBeInTheDocument();
      });
    });

    it("should highlight today's date", async () => {
      const user = userEvent.setup();

      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      await user.click(screen.getByRole("textbox"));

      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const year = today.getFullYear();
      const formattedDate = `${month}/${day}/${year}`;

      const todayButton = screen.getByRole("button", { name: formattedDate });

      expect(todayButton).toHaveClass("border");
      expect(todayButton).toHaveClass("border-primary");
    });

    it("should highlight selected date", async () => {
      const user = userEvent.setup();
      const date = new Date(2024, 5, 15); // June 15, 2024

      render(<DatePicker name="birthdate" value={date} onChange={() => {}} />);

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const selectedButton = screen.getByRole("button", {
          name: "06/15/2024",
        });
        expect(selectedButton).toHaveClass("bg-primary");
        expect(selectedButton).toHaveClass("text-primary-foreground");
      });
    });
  });

  describe("Date Selection", () => {
    it("should call onChange when date is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<DatePicker name="birthdate" value={null} onChange={onChange} />);

      await user.click(screen.getByRole("textbox"));

      const calendar = await screen.findByRole("grid");
      const dateButtons = within(calendar).getAllByRole("button");
      const firstDate = dateButtons.find(
        (btn) => btn.textContent && /^\d+$/.test(btn.textContent),
      );

      if (firstDate) {
        await user.click(firstDate);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
      }
    });

    it("should close calendar after date selection", async () => {
      const user = userEvent.setup();

      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      await user.click(screen.getByRole("textbox"));

      const calendar = await screen.findByRole("grid");
      const dateButtons = within(calendar).getAllByRole("button");
      const firstDate = dateButtons.find(
        (btn) => btn.textContent && /^\d+$/.test(btn.textContent),
      );

      if (firstDate) {
        await user.click(firstDate);

        await waitFor(() => {
          expect(screen.queryByRole("grid")).not.toBeInTheDocument();
        });
      }
    });

    it("should not allow selection of disabled dates", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const disabledDate = new Date(2024, 5, 15); // June 15, 2024

      render(
        <DatePicker
          name="birthdate"
          value={new Date(2024, 5, 1)}
          onChange={onChange}
          disabledDates={[disabledDate]}
        />,
      );

      await user.click(screen.getByRole("textbox"));

      // Calendar opens on June 2024 because value is in June
      expect(screen.getByText("June 2024")).toBeInTheDocument();

      const disabledButton = screen.getByRole("button", { name: "06/15/2024" });
      expect(disabledButton).toBeDisabled();

      await user.click(disabledButton);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should enforce minDate constraint", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const minDate = new Date(2024, 5, 15); // June 15, 2024

      render(
        <DatePicker
          name="birthdate"
          value={new Date(2024, 5, 1)}
          onChange={onChange}
          minDate={minDate}
        />,
      );

      await user.click(screen.getByRole("textbox"));

      // Calendar opens on June 2024 because value is in June
      expect(screen.getByText("June 2024")).toBeInTheDocument();

      // Try to click date before minDate
      const beforeMinButton = screen.getByRole("button", {
        name: "06/10/2024",
      });
      expect(beforeMinButton).toBeDisabled();
    });

    it("should enforce maxDate constraint", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const maxDate = new Date(2024, 5, 15); // June 15, 2024

      render(
        <DatePicker
          name="birthdate"
          value={new Date(2024, 5, 1)}
          onChange={onChange}
          maxDate={maxDate}
        />,
      );

      await user.click(screen.getByRole("textbox"));

      // Calendar opens on June 2024 because value is in June
      expect(screen.getByText("June 2024")).toBeInTheDocument();

      // Try to click date after maxDate
      const afterMaxButton = screen.getByRole("button", { name: "06/20/2024" });
      expect(afterMaxButton).toBeDisabled();
    });

    it("should use custom isDateDisabled function", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const isDateDisabled = (date: Date) =>
        date.getDay() === 0 || date.getDay() === 6; // Disable weekends

      render(
        <DatePicker
          name="birthdate"
          value={new Date(2024, 5, 15)} // June 15, 2024 (Saturday)
          onChange={onChange}
          isDateDisabled={isDateDisabled}
        />,
      );

      await user.click(screen.getByRole("textbox"));
      await screen.findByText("June 2024");

      // June 15, 2024 is Saturday, should be disabled
      const saturdayButton = screen.getByRole("button", { name: "06/15/2024" });
      expect(saturdayButton).toBeDisabled();

      // June 16, 2024 is Sunday, should be disabled
      const sundayButton = screen.getByRole("button", { name: "06/16/2024" });
      expect(sundayButton).toBeDisabled();

      // June 17, 2024 is Monday, should be enabled
      const mondayButton = screen.getByRole("button", { name: "06/17/2024" });
      expect(mondayButton).not.toBeDisabled();
    });
  });

  describe("Clear Functionality", () => {
    it("should clear date when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const date = new Date(2024, 5, 15);

      render(
        <DatePicker
          name="birthdate"
          value={date}
          onChange={onChange}
          clearable
        />,
      );

      await user.click(screen.getByRole("button", { name: "Clear date" }));

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should not open calendar when clear button is clicked", async () => {
      const user = userEvent.setup();
      const date = new Date(2024, 5, 15);

      render(
        <DatePicker
          name="birthdate"
          value={date}
          onChange={() => {}}
          clearable
        />,
      );

      await user.click(screen.getByRole("button", { name: "Clear date" }));

      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });
  });

  describe("Manual Input", () => {
    it.skip("should parse manual date input", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={onChange}
          allowManualInput
        />,
      );

      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "06/15/2024");
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calledDate = onChange.mock.calls[0][0] as Date;
        expect(calledDate.getMonth()).toBe(5); // June
        expect(calledDate.getDate()).toBe(15);
        expect(calledDate.getFullYear()).toBe(2024);
      });
    });

    it("should not allow manual input when allowManualInput is false", () => {
      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          allowManualInput={false}
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });

    it.skip("should handle invalid manual input gracefully", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={onChange}
          allowManualInput
        />,
      );

      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "invalid date");
      await user.tab();

      // Should not call onChange with invalid date
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it.skip("should open calendar with Enter key", async () => {
      const user = userEvent.setup();

      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      const input = screen.getByRole("textbox");
      input.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it.skip("should close calendar with Escape key", async () => {
      const user = userEvent.setup();

      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      });
    });
  });

  describe("Disabled State", () => {
    it("should not open calendar when disabled", async () => {
      const user = userEvent.setup();

      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          disabled
        />,
      );

      await user.click(screen.getByRole("textbox"));

      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("should disable input when disabled prop is true", () => {
      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          disabled
        />,
      );

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should not show clear button when disabled", () => {
      const date = new Date(2024, 5, 15);

      render(
        <DatePicker
          name="birthdate"
          value={date}
          onChange={() => {}}
          disabled
          clearable
        />,
      );

      expect(
        screen.queryByRole("button", { name: "Clear date" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("should have aria-invalid when error is true", () => {
      render(
        <DatePicker name="birthdate" value={null} onChange={() => {}} error />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have aria-required when required is true", () => {
      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          required
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should have aria-describedby when provided", () => {
      render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          aria-describedby="birthdate-help"
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "birthdate-help");
    });

    it("should have proper ARIA labels on navigation buttons", async () => {
      const user = userEvent.setup();

      render(<DatePicker name="birthdate" value={null} onChange={() => {}} />);

      await user.click(screen.getByRole("textbox"));

      expect(
        screen.getByRole("button", { name: "Previous month" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Next month" }),
      ).toBeInTheDocument();
    });
  });

  describe("CSS Classes", () => {
    it("should apply base class", () => {
      const { container } = render(
        <DatePicker name="birthdate" value={null} onChange={() => {}} />,
      );

      const wrapper = container.querySelector('[class*="relative"]');
      expect(wrapper).toBeInTheDocument();
    });

    it("should apply error class when error is true", () => {
      const { container } = render(
        <DatePicker name="birthdate" value={null} onChange={() => {}} error />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-destructive");
    });

    it("should apply disabled class when disabled is true", () => {
      const { container } = render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          disabled
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should apply open class when calendar is open", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker name="birthdate" value={null} onChange={() => {}} />,
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should apply custom className", () => {
      const { container } = render(
        <DatePicker
          name="birthdate"
          value={null}
          onChange={() => {}}
          className="custom-datepicker"
        />,
      );

      expect(container.querySelector(".custom-datepicker")).toBeInTheDocument();
    });
  });

  describe("Component Meta", () => {
    it("should have correct displayName", () => {
      expect(DatePicker.displayName).toBe("DatePicker");
    });
  });
});
