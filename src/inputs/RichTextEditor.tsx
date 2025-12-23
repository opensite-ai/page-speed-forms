"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

/**
 * Editor mode type
 */
export type EditorMode = "wysiwyg" | "markdown";

/**
 * Toolbar button configuration
 */
export interface ToolbarButton {
  command: string;
  icon: string;
  title: string;
  action: (editor: HTMLElement) => void;
}

/**
 * RichTextEditor props interface
 */
export interface RichTextEditorProps extends Omit<InputProps<string>, "onChange"> {
  /**
   * Change handler - receives HTML or Markdown content
   */
  onChange: (content: string) => void;

  /**
   * Editor mode - WYSIWYG or Markdown
   * @default "wysiwyg"
   */
  mode?: EditorMode;

  /**
   * Allow mode switching
   * @default false
   */
  allowModeSwitch?: boolean;

  /**
   * Placeholder text when editor is empty
   * @default "Start typing..."
   */
  placeholder?: string;

  /**
   * Minimum height of editor
   * @default "200px"
   */
  minHeight?: string;

  /**
   * Maximum height of editor (enables scrolling)
   */
  maxHeight?: string;

  /**
   * Show toolbar
   * @default true
   */
  showToolbar?: boolean;

  /**
   * Toolbar buttons to display
   * @default ["bold", "italic", "underline", "heading", "bulletList", "orderedList", "link"]
   */
  toolbarButtons?: string[];

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * Convert HTML to Markdown (basic conversion)
 */
function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Bold
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, "**$1**");
  markdown = markdown.replace(/<b>(.*?)<\/b>/g, "**$1**");

  // Italic
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, "*$1*");
  markdown = markdown.replace(/<i>(.*?)<\/i>/g, "*$1*");

  // Underline (no direct markdown equivalent, use HTML)
  markdown = markdown.replace(/<u>(.*?)<\/u>/g, "<u>$1</u>");

  // Headings
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, "# $1\n");
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, "## $1\n");
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, "### $1\n");

  // Links
  markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)");

  // Lists
  markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (_match, content) => {
    return content.replace(/<li>(.*?)<\/li>/g, "- $1\n");
  });
  markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, (_match, content) => {
    let counter = 1;
    return content.replace(/<li>(.*?)<\/li>/g, () => {
      return `${counter++}. $1\n`;
    });
  });

  // Paragraphs
  markdown = markdown.replace(/<p>(.*?)<\/p>/g, "$1\n\n");

  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/g, "\n");

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();

  return markdown;
}

/**
 * Convert Markdown to HTML (basic conversion)
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/^- (.*?)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*?<\/li>\n?)+/gs, "<ul>$&</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>");

  // Paragraphs
  html = html.replace(/^(?!<[h|ul|ol|li])(.+)$/gm, "<p>$1</p>");

  // Line breaks
  html = html.replace(/\n/g, "<br>");

  return html;
}

/**
 * RichTextEditor - Basic rich text editing component with WYSIWYG and Markdown support
 *
 * A lightweight rich text editor with basic formatting capabilities and optional Markdown mode.
 * Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - WYSIWYG editor with contentEditable
 * - Markdown editor mode
 * - Configurable toolbar with common formatting options
 * - Full accessibility support
 * - Error state styling
 * - Controlled input behavior
 * - Custom toolbar configuration
 * - Mode switching support
 * - Placeholder text support
 * - Adjustable height constraints
 *
 * Toolbar buttons:
 * - bold: Bold text (**text**)
 * - italic: Italic text (*text*)
 * - underline: Underlined text
 * - heading: Heading levels (H1-H3)
 * - bulletList: Unordered list
 * - orderedList: Ordered list
 * - link: Insert hyperlink
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { content: '' } });
 *
 * <RichTextEditor
 *   {...form.getFieldProps('content')}
 *   placeholder="Write your content..."
 *   mode="wysiwyg"
 *   allowModeSwitch
 *   showToolbar
 *   minHeight="200px"
 *   maxHeight="500px"
 *   error={!!form.errors.content}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Markdown mode
 * <RichTextEditor
 *   name="description"
 *   value={description}
 *   onChange={setDescription}
 *   mode="markdown"
 *   toolbarButtons={["bold", "italic", "heading", "link"]}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/rich-text-editor
 */
export function RichTextEditor({
  name,
  value = "",
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  className = "",
  mode = "wysiwyg",
  allowModeSwitch = false,
  placeholder = "Start typing...",
  minHeight = "200px",
  maxHeight,
  showToolbar = true,
  toolbarButtons = ["bold", "italic", "underline", "heading", "bulletList", "orderedList", "link"],
  ...props
}: RichTextEditorProps) {
  const [currentMode, setCurrentMode] = React.useState<EditorMode>(mode);
  const [content, setContent] = React.useState(value);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Sync content with controlled value prop
  React.useEffect(() => {
    setContent(value);
    if (currentMode === "wysiwyg" && editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value, currentMode]);

  // Handle content change in WYSIWYG mode
  const handleWysiwygChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  // Handle content change in Markdown mode
  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  // Execute formatting command
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleWysiwygChange();
  };

  // Toggle mode
  const handleModeToggle = () => {
    const newMode = currentMode === "wysiwyg" ? "markdown" : "wysiwyg";

    if (newMode === "markdown") {
      // Convert HTML to Markdown
      const markdown = htmlToMarkdown(content);
      setContent(markdown);
      onChange(markdown);
    } else {
      // Convert Markdown to HTML
      const html = markdownToHtml(content);
      setContent(html);
      onChange(html);
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }
    }

    setCurrentMode(newMode);
  };

  // Toolbar button configurations
  const toolbarConfig: Record<string, ToolbarButton> = {
    bold: {
      command: "bold",
      icon: "B",
      title: "Bold",
      action: () => execCommand("bold"),
    },
    italic: {
      command: "italic",
      icon: "I",
      title: "Italic",
      action: () => execCommand("italic"),
    },
    underline: {
      command: "underline",
      icon: "U",
      title: "Underline",
      action: () => execCommand("underline"),
    },
    heading: {
      command: "heading",
      icon: "H",
      title: "Heading",
      action: () => execCommand("formatBlock", "<h2>"),
    },
    bulletList: {
      command: "bulletList",
      icon: "•",
      title: "Bullet List",
      action: () => execCommand("insertUnorderedList"),
    },
    orderedList: {
      command: "orderedList",
      icon: "1.",
      title: "Numbered List",
      action: () => execCommand("insertOrderedList"),
    },
    link: {
      command: "link",
      icon: "🔗",
      title: "Insert Link",
      action: () => {
        const url = window.prompt("Enter URL:");
        if (url) {
          execCommand("createLink", url);
        }
      },
    },
  };

  const baseClassName = "richtexteditor";
  const errorClassName = error ? "richtexteditor--error" : "";
  const disabledClassName = disabled ? "richtexteditor--disabled" : "";
  const modeClassName = `richtexteditor--${currentMode}`;
  const combinedClassName =
    `${baseClassName} ${errorClassName} ${disabledClassName} ${modeClassName} ${className}`.trim();

  const editorStyle: React.CSSProperties = {
    minHeight,
    maxHeight,
    overflowY: maxHeight ? "auto" : undefined,
  };

  return (
    <div className={combinedClassName}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={content} />

      {/* Toolbar */}
      {showToolbar && (
        <div className="richtexteditor-toolbar">
          <div className="richtexteditor-toolbar-buttons">
            {toolbarButtons.map((buttonName) => {
              const button = toolbarConfig[buttonName];
              if (!button) return null;

              return (
                <button
                  key={buttonName}
                  type="button"
                  className="richtexteditor-toolbar-button"
                  onClick={() => editorRef.current && button.action(editorRef.current)}
                  title={button.title}
                  disabled={disabled || currentMode === "markdown"}
                  aria-label={button.title}
                >
                  {button.icon}
                </button>
              );
            })}
          </div>
          {allowModeSwitch && (
            <button
              type="button"
              className="richtexteditor-mode-toggle"
              onClick={handleModeToggle}
              disabled={disabled}
              title={`Switch to ${currentMode === "wysiwyg" ? "Markdown" : "WYSIWYG"}`}
              aria-label={`Switch to ${currentMode === "wysiwyg" ? "Markdown" : "WYSIWYG"}`}
            >
              {currentMode === "wysiwyg" ? "MD" : "WYSIWYG"}
            </button>
          )}
        </div>
      )}

      {/* Editor */}
      <div className="richtexteditor-editor" style={editorStyle}>
        {currentMode === "wysiwyg" ? (
          <div
            ref={editorRef}
            className="richtexteditor-content"
            role="textbox"
            contentEditable={!disabled}
            onInput={handleWysiwygChange}
            onBlur={onBlur}
            data-placeholder={placeholder}
            aria-invalid={error || props["aria-invalid"] ? "true" : "false"}
            aria-describedby={props["aria-describedby"]}
            aria-required={required || props["aria-required"]}
            suppressContentEditableWarning
          />
        ) : (
          <textarea
            ref={textareaRef}
            className="richtexteditor-markdown"
            value={content}
            onChange={handleMarkdownChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            aria-invalid={error || props["aria-invalid"] ? "true" : "false"}
            aria-describedby={props["aria-describedby"]}
            aria-required={required || props["aria-required"]}
          />
        )}
      </div>
    </div>
  );
}

RichTextEditor.displayName = "RichTextEditor";
