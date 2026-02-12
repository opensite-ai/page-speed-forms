import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangePicker, DateRange } from "../DateRangePicker";

describe("DateRangePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Select date range...");
    });

    it("should render with custom placeholder", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          placeholder="Pick date range"
        />
      );

      expect(screen.getByPlaceholderText("Pick date range")).toBeInTheDocument();
    });

    it("should display formatted date range when values are provided", () => {
      const start = new Date(2024, 0, 15); // January 15, 2024
      const end = new Date(2024, 0, 20); // January 20, 2024

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("01/15/2024 - 01/20/2024");
    });

    it("should display only start date when end date is null", () => {
      const start = new Date(2024, 0, 15);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end: null }}
          onChange={() => {}}
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("01/15/2024");
    });

    it("should format dates according to format prop", () => {
      const start = new Date(2024, 0, 15);
      const end = new Date(2024, 0, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
          format="yyyy-MM-dd"
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("2024-01-15 - 2024-01-20");
    });

    it("should use custom separator", () => {
      const start = new Date(2024, 0, 15);
      const end = new Date(2024, 0, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
          separator=" to "
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("01/15/2024 to 01/20/2024");
    });

    it("should render calendar icon when showIcon is true", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          showIcon
        />
      );

      const icon = screen.getByRole("textbox").parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it("should not render calendar icon when showIcon is false", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          showIcon={false}
        />
      );

      const icon = screen.getByRole("textbox").parentElement?.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it("should render clear button when range is selected and clearable is true", () => {
      const start = new Date(2024, 0, 15);
      const end = new Date(2024, 0, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
          clearable
        />
      );

      expect(screen.getByRole("button", { name: "Clear date range" })).toBeInTheDocument();
    });

    it("should render clear button when only start date is selected", () => {
      const start = new Date(2024, 0, 15);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end: null }}
          onChange={() => {}}
          clearable
        />
      );

      expect(screen.getByRole("button", { name: "Clear date range" })).toBeInTheDocument();
    });

    it("should not render clear button when no dates are selected", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          clearable
        />
      );

      expect(screen.queryByRole("button", { name: "Clear date range" })).not.toBeInTheDocument();
    });

    it("should render hidden inputs for form submission", () => {
      const start = new Date(2024, 0, 15);
      const end = new Date(2024, 0, 20);
      const { container } = render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
        />
      );

      const startInput = container.querySelector('input[name="daterange[start]"]') as HTMLInputElement;
      const endInput = container.querySelector('input[name="daterange[end]"]') as HTMLInputElement;

      expect(startInput).toBeInTheDocument();
      expect(endInput).toBeInTheDocument();
      expect(startInput.value).toBe(start.toISOString());
      expect(endInput.value).toBe(end.toISOString());
    });
  });

  describe("Calendar Popup", () => {
    it("should open calendar when input is clicked", async () => {
      const user = userEvent.setup();

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should display current month by default", async () => {
      const user = userEvent.setup();

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      const now = new Date();
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const expectedMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      await waitFor(() => {
        expect(screen.getByText(expectedMonth)).toBeInTheDocument();
      });
    });

    it("should display month of start date when provided", async () => {
      const user = userEvent.setup();
      const start = new Date(2024, 5, 15); // June 15, 2024

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByText("June 2024")).toBeInTheDocument();
      });
    });

    it("should close calendar when clicking outside", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <DateRangePicker
            name="daterange"
            value={{ start: null, end: null }}
            onChange={() => {}}
          />
          <button>Outside</button>
        </div>
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
        <DateRangePicker
          name="daterange"
          value={{ start: new Date(2024, 5, 15), end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("June 2024")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "Previous month" }));

      await waitFor(() => {
        expect(screen.getByText("May 2024")).toBeInTheDocument();
      });
    });

    it("should navigate to next month", async () => {
      const user = userEvent.setup();

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: new Date(2024, 5, 15), end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await waitFor(() => expect(screen.getByText("June 2024")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "Next month" }));

      await waitFor(() => {
        expect(screen.getByText("July 2024")).toBeInTheDocument();
      });
    });

    it("should highlight today's date", async () => {
      const user = userEvent.setup();

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
        />
      );

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

    it("should highlight selected start date", async () => {
      const user = userEvent.setup();
      const start = new Date(2024, 5, 15);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const startButton = screen.getByRole("button", { name: "06/15/2024" });
        expect(startButton).toHaveClass("bg-muted");
        expect(startButton).toHaveClass("font-semibold");
      });
    });

    it("should highlight selected end date", async () => {
      const user = userEvent.setup();
      const start = new Date(2024, 5, 15);
      const end = new Date(2024, 5, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const endButton = screen.getByRole("button", { name: "06/20/2024" });
        expect(endButton).toHaveClass("bg-muted");
        expect(endButton).toHaveClass("font-semibold");
      });
    });

    it("should highlight dates in range", async () => {
      const user = userEvent.setup();
      const start = new Date(2024, 5, 15);
      const end = new Date(2024, 5, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        const inRangeButton = screen.getByRole("button", { name: "06/17/2024" });
        expect(inRangeButton).toHaveClass("bg-muted/70");
      });
    });

    it("should show 'Select end date' hint when only start date is selected", async () => {
      const user = userEvent.setup();
      const start = new Date(2024, 5, 15);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByText("Select end date")).toBeInTheDocument();
      });
    });
  });

  describe("Date Range Selection", () => {
    it("should start new range when clicking date", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("textbox"));

      const calendar = await screen.findByRole("grid");
      const dateButtons = within(calendar).getAllByRole("button");
      const june15 = dateButtons.find((btn) => btn.getAttribute("aria-label") === "06/15/2024");

      if (june15) {
        await user.click(june15);

        expect(onChange).toHaveBeenCalledWith({
          start: expect.any(Date),
          end: null,
        });
      }
    });

    it("should complete range when clicking second date after start", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const start = new Date(2024, 5, 15);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end: null }}
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("textbox"));

      const june20 = screen.getByRole("button", { name: "06/20/2024" });
      await user.click(june20);

      expect(onChange).toHaveBeenCalledWith({
        start: expect.any(Date),
        end: expect.any(Date),
      });

      // Calendar should close
      await waitFor(() => {
        expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      });
    });

    it("should swap dates when end date is before start date", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const start = new Date(2024, 5, 20); // June 20

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end: null }}
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("textbox"));

      const june15 = screen.getByRole("button", { name: "06/15/2024" });
      await user.click(june15);

      expect(onChange).toHaveBeenCalledWith({
        start: expect.any(Date), // Should be June 15 now
        end: expect.any(Date),   // Should be June 20 now
      });

      const call = onChange.mock.calls[0][0] as DateRange;
      expect(call.start!.getDate()).toBe(15);
      expect(call.end!.getDate()).toBe(20);
    });

    it("should restart selection when clicking date with complete range", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const start = new Date(2024, 5, 15);
      const end = new Date(2024, 5, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("textbox"));

      const june25 = screen.getByRole("button", { name: "06/25/2024" });
      await user.click(june25);

      expect(onChange).toHaveBeenCalledWith({
        start: expect.any(Date),
        end: null,
      });

      const call = onChange.mock.calls[0][0] as DateRange;
      expect(call.start!.getDate()).toBe(25);
    });

    it("should not allow selection of disabled dates", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const disabledDate = new Date(2024, 5, 15); // June 15, 2024

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: new Date(2024, 5, 1), end: null }}
          onChange={onChange}
          disabledDates={[disabledDate]}
        />
      );

      await user.click(screen.getByRole("textbox"));

      // Calendar opens on June 2024 because value.start is in June
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
        <DateRangePicker
          name="daterange"
          value={{ start: new Date(2024, 5, 1), end: null }}
          onChange={onChange}
          minDate={minDate}
        />
      );

      await user.click(screen.getByRole("textbox"));

      // Calendar opens on June 2024 because value.start is in June
      expect(screen.getByText("June 2024")).toBeInTheDocument();

      const beforeMinButton = screen.getByRole("button", { name: "06/10/2024" });
      expect(beforeMinButton).toBeDisabled();
    });

    it("should enforce maxDate constraint", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const maxDate = new Date(2024, 5, 15); // June 15, 2024

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: new Date(2024, 5, 1), end: null }}
          onChange={onChange}
          maxDate={maxDate}
        />
      );

      await user.click(screen.getByRole("textbox"));

      // Calendar opens on June 2024 because value.start is in June
      expect(screen.getByText("June 2024")).toBeInTheDocument();

      const afterMaxButton = screen.getByRole("button", { name: "06/20/2024" });
      expect(afterMaxButton).toBeDisabled();
    });

    it("should use custom isDateDisabled function", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const isDateDisabled = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: new Date(2024, 5, 15), end: null }}
          onChange={onChange}
          isDateDisabled={isDateDisabled}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await screen.findByText("June 2024");

      const saturdayButton = screen.getByRole("button", { name: "06/15/2024" });
      expect(saturdayButton).toBeDisabled();

      const sundayButton = screen.getByRole("button", { name: "06/16/2024" });
      expect(sundayButton).toBeDisabled();

      const mondayButton = screen.getByRole("button", { name: "06/17/2024" });
      expect(mondayButton).not.toBeDisabled();
    });

    it("should show hover range when hovering dates", async () => {
      const user = userEvent.setup();
      const start = new Date(2024, 5, 15);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));
      await screen.findByText("June 2024");

      const june20 = screen.getByRole("button", { name: "06/20/2024" });
      await user.hover(june20);

      // Dates between start and hover should have in-range class
      const june17 = screen.getByRole("button", { name: "06/17/2024" });
      expect(june17).toHaveClass("bg-muted/70");
    });
  });

  describe("Clear Functionality", () => {
    it("should clear range when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const start = new Date(2024, 5, 15);
      const end = new Date(2024, 5, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={onChange}
          clearable
        />
      );

      await user.click(screen.getByRole("button", { name: "Clear date range" }));

      expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
    });

    it("should not open calendar when clear button is clicked", async () => {
      const user = userEvent.setup();
      const start = new Date(2024, 5, 15);
      const end = new Date(2024, 5, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
          clearable
        />
      );

      await user.click(screen.getByRole("button", { name: "Clear date range" }));

      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should not open calendar when disabled", async () => {
      const user = userEvent.setup();

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          disabled
        />
      );

      await user.click(screen.getByRole("textbox"));

      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("should disable input when disabled prop is true", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should not show clear button when disabled", () => {
      const start = new Date(2024, 5, 15);
      const end = new Date(2024, 5, 20);

      render(
        <DateRangePicker
          name="daterange"
          value={{ start, end }}
          onChange={() => {}}
          disabled
          clearable
        />
      );

      expect(screen.queryByRole("button", { name: "Clear date range" })).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("should have aria-invalid when error is true", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          error
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have aria-required when required is true", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          required
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should have aria-describedby when provided", () => {
      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          aria-describedby="daterange-help"
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "daterange-help");
    });

    it("should have proper ARIA labels on navigation buttons", async () => {
      const user = userEvent.setup();

      render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
    });
  });

  describe("CSS Classes", () => {
    it("should apply base class", () => {
      const { container } = render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
        />
      );

      const wrapper = container.querySelector('[class*="relative"]');
      expect(wrapper).toBeInTheDocument();
    });

    it("should apply error class when error is true", () => {
      const { container } = render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          error
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-red-500");
    });

    it("should apply disabled class when disabled is true", () => {
      const { container } = render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          disabled
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should apply open class when calendar is open", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
        />
      );

      await user.click(screen.getByRole("textbox"));

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    });

    it("should apply custom className", () => {
      const { container } = render(
        <DateRangePicker
          name="daterange"
          value={{ start: null, end: null }}
          onChange={() => {}}
          className="custom-daterangepicker"
        />
      );

      expect(container.querySelector(".custom-daterangepicker")).toBeInTheDocument();
    });
  });

  describe("Component Meta", () => {
    it("should have correct displayName", () => {
      expect(DateRangePicker.displayName).toBe("DateRangePicker");
    });
  });
});
