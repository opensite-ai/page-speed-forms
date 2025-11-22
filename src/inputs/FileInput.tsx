"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

/**
 * File validation error details
 */
export interface FileValidationError {
  file: File;
  error: "type" | "size" | "count";
  message: string;
}

/**
 * FileInput component props
 */
export interface FileInputProps extends Omit<InputProps<File[]>, "value" | "onChange"> {
  /**
   * Current file value(s)
   */
  value?: File[];

  /**
   * Change handler receives array of files
   */
  onChange: (files: File[]) => void;

  /**
   * Accepted file types (MIME types or extensions)
   * @example ".pdf,.doc,.docx"
   * @example "image/*,application/pdf"
   */
  accept?: string;

  /**
   * Maximum file size in bytes
   * @default 5MB (5 * 1024 * 1024)
   */
  maxSize?: number;

  /**
   * Maximum number of files
   * @default 1
   */
  maxFiles?: number;

  /**
   * Allow multiple file selection
   * @default false
   */
  multiple?: boolean;

  /**
   * Show file preview thumbnails
   * @default true
   */
  showPreview?: boolean;

  /**
   * Validation error handler
   */
  onValidationError?: (errors: FileValidationError[]) => void;

  /**
   * File removed handler
   */
  onFileRemove?: (file: File, index: number) => void;
}

/**
 * FileInput component for file selection with validation
 *
 * @example
 * ```tsx
 * <FileInput
 *   name="resume"
 *   accept=".pdf,.doc,.docx"
 *   maxSize={5 * 1024 * 1024}
 *   value={files}
 *   onChange={(files) => setFiles(files)}
 *   error={hasError}
 * />
 * ```
 */
export function FileInput({
  name,
  value = [],
  onChange,
  onBlur,
  placeholder = "Choose file(s)...",
  disabled = false,
  required = false,
  error = false,
  className = "",
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  multiple = false,
  showPreview = true,
  onValidationError,
  onFileRemove,
  ...props
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  /**
   * Validate file against constraints
   */
  const validateFile = React.useCallback(
    (file: File): FileValidationError | null => {
      // Validate file type
      if (accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const isValidType = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            // Extension match
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          } else if (type.endsWith("/*")) {
            // MIME type wildcard match (e.g., "image/*")
            const baseType = type.split("/")[0];
            return file.type.startsWith(baseType + "/");
          } else {
            // Exact MIME type match
            return file.type === type;
          }
        });

        if (!isValidType) {
          return {
            file,
            error: "type",
            message: `File type "${file.type}" is not accepted. Accepted types: ${accept}`,
          };
        }
      }

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return {
          file,
          error: "size",
          message: `File size ${fileSizeMB}MB exceeds maximum ${maxSizeMB}MB`,
        };
      }

      return null;
    },
    [accept, maxSize]
  );

  /**
   * Handle file selection from input or drop
   */
  const handleFiles = React.useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const newFiles = Array.from(fileList);
      const validationErrors: FileValidationError[] = [];
      const validFiles: File[] = [];

      // Validate each file
      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          validationErrors.push(validationError);
        } else {
          validFiles.push(file);
        }
      }

      // Check max files constraint
      const totalFiles = value.length + validFiles.length;
      if (totalFiles > maxFiles) {
        validationErrors.push({
          file: validFiles[0], // Use first file as reference
          error: "count",
          message: `Maximum ${maxFiles} file(s) allowed. Attempting to add ${validFiles.length} to existing ${value.length}.`,
        });
      }

      // Notify validation errors
      if (validationErrors.length > 0 && onValidationError) {
        onValidationError(validationErrors);
      }

      // Update files if valid
      if (validFiles.length > 0 && totalFiles <= maxFiles) {
        const updatedFiles = multiple ? [...value, ...validFiles] : validFiles;
        onChange(updatedFiles.slice(0, maxFiles));
      }

      // Reset input value to allow same file selection again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [value, onChange, validateFile, maxFiles, multiple, onValidationError]
  );

  /**
   * Handle input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  /**
   * Handle file removal
   */
  const handleRemove = (index: number) => {
    const fileToRemove = value[index];
    const updatedFiles = value.filter((_, i) => i !== index);
    onChange(updatedFiles);

    if (onFileRemove && fileToRemove) {
      onFileRemove(fileToRemove, index);
    }
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  };

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    inputRef.current?.click();
  };

  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  /**
   * Generate file preview URL for images
   */
  const getPreviewUrl = (file: File): string | null => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      value.forEach((file) => {
        const previewUrl = getPreviewUrl(file);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      });
    };
  }, [value]);

  const baseClassName = "file-input";
  const errorClassName = error ? "file-input--error" : "";
  const dragClassName = dragActive ? "file-input--drag-active" : "";
  const disabledClassName = disabled ? "file-input--disabled" : "";
  const combinedClassName = `${baseClassName} ${errorClassName} ${dragClassName} ${disabledClassName} ${className}`.trim();

  return (
    <div className={combinedClassName}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        onChange={handleChange}
        onBlur={onBlur}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        required={required && value.length === 0}
        className="file-input__native"
        aria-invalid={error || props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
        aria-required={required || props["aria-required"]}
        style={{ display: "none" }}
      />

      {/* Drop zone */}
      <div
        className="file-input__dropzone"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={placeholder}
        aria-disabled={disabled}
      >
        <div className="file-input__dropzone-content">
          <svg
            className="file-input__icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="file-input__placeholder">
            {value.length > 0
              ? `${value.length} file(s) selected`
              : placeholder}
          </p>
          {accept && (
            <p className="file-input__hint">Accepted: {accept}</p>
          )}
          {maxSize && (
            <p className="file-input__hint">
              Max size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      </div>

      {/* File list */}
      {value.length > 0 && (
        <ul className="file-input__list" role="list">
          {value.map((file, index) => {
            const previewUrl = showPreview ? getPreviewUrl(file) : null;

            return (
              <li key={`${file.name}-${index}`} className="file-input__item">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="file-input__preview"
                    width="48"
                    height="48"
                  />
                )}
                <div className="file-input__details">
                  <span className="file-input__filename">{file.name}</span>
                  <span className="file-input__filesize">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  disabled={disabled}
                  className="file-input__remove"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

FileInput.displayName = "FileInput";
