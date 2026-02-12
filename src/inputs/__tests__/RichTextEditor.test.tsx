import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "../RichTextEditor";

describe("RichTextEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.execCommand for WYSIWYG editor functionality
    document.execCommand = vi.fn(() => true);
  });

  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          placeholder="Type your content..."
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("data-placeholder", "Type your content...");
    });

    it("should display value when provided (WYSIWYG mode)", () => {
      const value = "<p>Hello World</p>";

      render(
        <RichTextEditor
          name="content"
          value={value}
          onChange={() => {}}
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor.innerHTML).toBe(value);
    });

    it("should display value when provided (Markdown mode)", () => {
      const value = "# Hello World";

      render(
        <RichTextEditor
          name="content"
          value={value}
          onChange={() => {}}
          mode="markdown"
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe(value);
    });

    it("should render toolbar when showToolbar is true", () => {
      const { container } = render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          showToolbar
        />
      );

      const toolbar = container.querySelector('[class*="border-b"]');
      expect(toolbar).toBeInTheDocument();
    });

    it("should not render toolbar when showToolbar is false", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          showToolbar={false}
        />
      );

      expect(screen.queryByRole("button", { name: "Bold" })).not.toBeInTheDocument();
    });

    it("should render default toolbar buttons", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          showToolbar
        />
      );

      expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Italic" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Underline" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Heading" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Bullet List" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Numbered List" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Insert Link" })).toBeInTheDocument();
    });

    it("should render only specified toolbar buttons", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          showToolbar
          toolbarButtons={["bold", "italic"]}
        />
      );

      expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Italic" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Underline" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Heading" })).not.toBeInTheDocument();
    });

    it("should render mode toggle when allowModeSwitch is true", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          allowModeSwitch
        />
      );

      expect(screen.getByRole("button", { name: /Switch to/ })).toBeInTheDocument();
    });

    it("should not render mode toggle when allowModeSwitch is false", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          allowModeSwitch={false}
        />
      );

      expect(screen.queryByRole("button", { name: /Switch to/ })).not.toBeInTheDocument();
    });

    it("should render hidden input for form submission", () => {
      const value = "<p>Hello</p>";
      const { container } = render(
        <RichTextEditor
          name="content"
          value={value}
          onChange={() => {}}
        />
      );

      const hiddenInput = container.querySelector('input[type="hidden"]') as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute("name", "content");
      expect(hiddenInput.value).toBe(value);
    });

    it("should apply custom minHeight", () => {
      const { container } = render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          minHeight="300px"
        />
      );

      // The style is applied to the inner wrapper div, not the outer container
      const editor = screen.getByRole("textbox");
      const styleWrapper = editor.parentElement as HTMLElement;
      expect(styleWrapper).toHaveStyle({ minHeight: "300px" });
    });

    it("should apply custom maxHeight", () => {
      const { container } = render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          maxHeight="500px"
        />
      );

      // The style is applied to the inner wrapper div, not the outer container
      const editor = screen.getByRole("textbox");
      const styleWrapper = editor.parentElement as HTMLElement;
      expect(styleWrapper).toHaveStyle({ maxHeight: "500px" });
      expect(styleWrapper).toHaveStyle({ overflowY: "auto" });
    });
  });

  describe("WYSIWYG Mode", () => {
    it("should be editable when not disabled", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("contenteditable", "true");
    });

    it("should not be editable when disabled", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("contenteditable", "false");
    });

    it("should call onChange when content changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      const editor = screen.getByRole("textbox");
      await user.click(editor);
      await user.keyboard("Hello");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should execute bold command", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      // Mock document.execCommand
      const execCommandSpy = vi.spyOn(document, "execCommand");

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Bold" }));

      expect(execCommandSpy).toHaveBeenCalledWith("bold", false, undefined);
    });

    it("should execute italic command", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const execCommandSpy = vi.spyOn(document, "execCommand");

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Italic" }));

      expect(execCommandSpy).toHaveBeenCalledWith("italic", false, undefined);
    });

    it("should execute underline command", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const execCommandSpy = vi.spyOn(document, "execCommand");

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Underline" }));

      expect(execCommandSpy).toHaveBeenCalledWith("underline", false, undefined);
    });

    it("should execute heading command", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const execCommandSpy = vi.spyOn(document, "execCommand");

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Heading" }));

      expect(execCommandSpy).toHaveBeenCalledWith("formatBlock", false, "<h2>");
    });

    it("should execute bullet list command", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const execCommandSpy = vi.spyOn(document, "execCommand");

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Bullet List" }));

      expect(execCommandSpy).toHaveBeenCalledWith("insertUnorderedList", false, undefined);
    });

    it("should execute ordered list command", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const execCommandSpy = vi.spyOn(document, "execCommand");

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Numbered List" }));

      expect(execCommandSpy).toHaveBeenCalledWith("insertOrderedList", false, undefined);
    });

    it("should prompt for URL when inserting link", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const promptSpy = vi.spyOn(window, "prompt").mockReturnValue("https://example.com");
      const execCommandSpy = vi.spyOn(document, "execCommand");

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Insert Link" }));

      expect(promptSpy).toHaveBeenCalledWith("Enter URL:");
      expect(execCommandSpy).toHaveBeenCalledWith("createLink", false, "https://example.com");

      promptSpy.mockRestore();
      execCommandSpy.mockRestore();
    });

    it("should not insert link when prompt is cancelled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const promptSpy = vi.spyOn(window, "prompt").mockReturnValue(null);
      const execCommandSpy = vi.spyOn(document, "execCommand");

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Insert Link" }));

      expect(promptSpy).toHaveBeenCalled();
      expect(execCommandSpy).not.toHaveBeenCalledWith("createLink", expect.anything(), expect.anything());

      promptSpy.mockRestore();
      execCommandSpy.mockRestore();
    });

    it("should disable toolbar buttons when disabled", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Italic" })).toBeDisabled();
    });
  });

  describe("Markdown Mode", () => {
    it("should render textarea in markdown mode", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          mode="markdown"
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should call onChange when textarea content changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={onChange}
          mode="markdown"
        />
      );

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "# Hello");

      expect(onChange).toHaveBeenCalled();
    });

    it("should disable toolbar buttons in markdown mode", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          mode="markdown"
        />
      );

      expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Italic" })).toBeDisabled();
    });

    it("should disable textarea when disabled prop is true", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          mode="markdown"
          disabled
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
    });
  });

  describe("Mode Switching", () => {
    it("should switch from WYSIWYG to Markdown", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <RichTextEditor
          name="content"
          value="<p>Hello World</p>"
          onChange={onChange}
          allowModeSwitch
        />
      );

      await user.click(screen.getByRole("button", { name: /Switch to Markdown/ }));

      await waitFor(() => {
        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea.tagName).toBe("TEXTAREA");
        expect(textarea.value).toContain("Hello World");
      });
    });

    it("should switch from Markdown to WYSIWYG", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <RichTextEditor
          name="content"
          value="# Hello World"
          onChange={onChange}
          mode="markdown"
          allowModeSwitch
        />
      );

      await user.click(screen.getByRole("button", { name: /Switch to WYSIWYG/ }));

      await waitFor(() => {
        const editor = screen.getByRole("textbox");
        expect(editor.getAttribute("contenteditable")).toBe("true");
      });
    });

    it("should convert HTML to Markdown when switching modes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <RichTextEditor
          name="content"
          value="<strong>Bold</strong> and <em>italic</em>"
          onChange={onChange}
          allowModeSwitch
        />
      );

      await user.click(screen.getByRole("button", { name: /Switch to Markdown/ }));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const call = onChange.mock.calls[0][0];
        expect(call).toContain("**Bold**");
        expect(call).toContain("*italic*");
      });
    });

    it("should convert Markdown to HTML when switching modes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <RichTextEditor
          name="content"
          value="**Bold** and *italic*"
          onChange={onChange}
          mode="markdown"
          allowModeSwitch
        />
      );

      await user.click(screen.getByRole("button", { name: /Switch to WYSIWYG/ }));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const call = onChange.mock.calls[0][0];
        expect(call).toContain("<strong>Bold</strong>");
        expect(call).toContain("<em>italic</em>");
      });
    });

    it("should disable mode toggle when editor is disabled", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          allowModeSwitch
          disabled
        />
      );

      expect(screen.getByRole("button", { name: /Switch to/ })).toBeDisabled();
    });
  });

  describe("Disabled State", () => {
    it("should disable editor when disabled prop is true", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("contenteditable", "false");
    });

    it("should disable all toolbar buttons when disabled", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("aria-invalid", "false");
    });

    it("should have aria-invalid when error is true", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          error
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("aria-invalid", "true");
    });

    it("should have aria-required when required is true", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          required
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("aria-required", "true");
    });

    it("should have aria-describedby when provided", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          aria-describedby="content-help"
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("aria-describedby", "content-help");
    });

    it("should have aria-label on toolbar buttons", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-label", "Bold");
      expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-label", "Italic");
    });
  });

  describe("CSS Classes", () => {
    it("should apply base class", () => {
      const { container } = render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
        />
      );

      const wrapper = container.querySelector('[class*="rounded-md"]');
      expect(wrapper).toBeInTheDocument();
    });

    it("should apply error class when error is true", () => {
      const { container } = render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          error
        />
      );

      const editorContainer = container.querySelector('[class*="rounded-md"]');
      expect(editorContainer?.className).toContain("border-red-500");
    });

    it("should apply disabled class when disabled is true", () => {
      const { container } = render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      const editorContainer = container.querySelector('[class*="rounded-md"]');
      expect(editorContainer?.className).toContain("opacity-50");
    });

    it("should apply mode class", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          mode="wysiwyg"
        />
      );

      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("contenteditable", "true");
    });

    it("should apply markdown mode class", () => {
      render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          mode="markdown"
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <RichTextEditor
          name="content"
          value=""
          onChange={() => {}}
          className="custom-editor"
        />
      );

      expect(container.querySelector(".custom-editor")).toBeInTheDocument();
    });
  });

  describe("Component Meta", () => {
    it("should have correct displayName", () => {
      expect(RichTextEditor.displayName).toBe("RichTextEditor");
    });
  });
});
