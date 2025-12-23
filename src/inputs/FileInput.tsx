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
 * Upload progress tracking per file
 */
export interface FileUploadProgress {
  [fileName: string]: number; // 0-100
}

/**
 * Crop area coordinates
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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
   * Show upload progress indicators
   * @default true
   */
  showProgress?: boolean;

  /**
   * Upload progress per file (0-100)
   * Consumer should update this during upload
   */
  uploadProgress?: FileUploadProgress;

  /**
   * Enable image cropping for image files
   * @default false
   */
  enableCropping?: boolean;

  /**
   * Crop aspect ratio (width / height)
   * @default Free form (no constraint)
   * @example 16/9, 1, 4/3
   */
  cropAspectRatio?: number;

  /**
   * Crop complete handler - receives cropped blob and original file
   */
  onCropComplete?: (croppedBlob: Blob, originalFile: File) => void;

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
 * FileInput component for file selection with validation, progress tracking, and image cropping
 *
 * Features:
 * - Drag-and-drop file upload
 * - File type and size validation
 * - Image preview thumbnails
 * - Upload progress indicators
 * - Image cropping with aspect ratio control
 * - Multiple file support
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
 *
 * @example
 * ```tsx
 * // With upload progress
 * <FileInput
 *   name="photos"
 *   accept="image/*"
 *   multiple
 *   value={files}
 *   onChange={setFiles}
 *   showProgress
 *   uploadProgress={progress}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With image cropping
 * <FileInput
 *   name="avatar"
 *   accept="image/*"
 *   value={files}
 *   onChange={setFiles}
 *   enableCropping
 *   cropAspectRatio={1}
 *   onCropComplete={(blob, file) => {
 *     // Handle cropped image
 *   }}
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
  showProgress = true,
  uploadProgress = {},
  enableCropping = false,
  cropAspectRatio,
  onCropComplete,
  onValidationError,
  onFileRemove,
  ...props
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [cropperOpen, setCropperOpen] = React.useState(false);
  const [imageToCrop, setImageToCrop] = React.useState<{
    file: File;
    url: string;
  } | null>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<CropArea | null>(null);

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

      // Handle valid files
      if (validFiles.length > 0 && totalFiles <= maxFiles) {
        // If cropping is enabled and file is an image, open cropper for first image
        const firstImage = validFiles.find((f) => f.type.startsWith("image/"));
        if (enableCropping && firstImage && !multiple) {
          // Open cropper for single image
          const previewUrl = URL.createObjectURL(firstImage);
          setImageToCrop({ file: firstImage, url: previewUrl });
          setCropperOpen(true);
        } else {
          // Add files directly
          const updatedFiles = multiple ? [...value, ...validFiles] : validFiles;
          onChange(updatedFiles.slice(0, maxFiles));
        }
      }

      // Reset input value to allow same file selection again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [value, onChange, validateFile, maxFiles, multiple, enableCropping, onValidationError]
  );

  /**
   * Create cropped image from canvas
   */
  const createCroppedImage = React.useCallback(
    async (imageUrl: string, cropArea: CropArea): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Set canvas size to crop area
          canvas.width = cropArea.width;
          canvas.height = cropArea.height;

          // Draw cropped image
          ctx.drawImage(
            image,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            cropArea.width,
            cropArea.height
          );

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob from canvas"));
            }
          }, "image/jpeg", 0.95);
        };
        image.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        image.src = imageUrl;
      });
    },
    []
  );

  /**
   * Handle crop completion
   */
  const handleCropSave = React.useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedBlob = await createCroppedImage(
        imageToCrop.url,
        croppedAreaPixels
      );

      // Notify parent of cropped image
      if (onCropComplete) {
        onCropComplete(croppedBlob, imageToCrop.file);
      }

      // Create new file from blob
      const croppedFile = new File(
        [croppedBlob],
        imageToCrop.file.name,
        { type: "image/jpeg" }
      );

      // Update files
      const updatedFiles = multiple ? [...value, croppedFile] : [croppedFile];
      onChange(updatedFiles);

      // Close cropper
      setCropperOpen(false);
      URL.revokeObjectURL(imageToCrop.url);
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Failed to crop image:", error);
    }
  }, [imageToCrop, croppedAreaPixels, createCroppedImage, onCropComplete, value, onChange, multiple]);

  /**
   * Handle crop cancel
   */
  const handleCropCancel = React.useCallback(() => {
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop.url);
    }
    setCropperOpen(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [imageToCrop]);

  /**
   * Handle crop change
   */
  const onCropChange = React.useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  /**
   * Handle zoom change
   */
  const onZoomChange = React.useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  /**
   * Handle crop complete (receives pixel coordinates)
   */
  const onCropCompleteInternal = React.useCallback(
    (_: any, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
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

  // Cleanup preview URLs on unmount and when files change
  React.useEffect(() => {
    return () => {
      value.forEach((file) => {
        const previewUrl = getPreviewUrl(file);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      });
      // Cleanup crop image URL if present
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop.url);
      }
    };
  }, [value, imageToCrop]);

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
                  {/* Upload progress indicator */}
                  {showProgress && uploadProgress[file.name] !== undefined && (
                    <div className="file-input__progress">
                      <div
                        className="file-input__progress-bar"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                        role="progressbar"
                        aria-valuenow={uploadProgress[file.name]}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Upload progress: ${uploadProgress[file.name]}%`}
                      />
                      <span className="file-input__progress-text">
                        {uploadProgress[file.name]}%
                      </span>
                    </div>
                  )}
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

      {/* Image cropper modal */}
      {cropperOpen && imageToCrop && (
        <div className="file-input-cropper-modal">
          <div
            className="file-input-cropper-overlay"
            onClick={handleCropCancel}
            aria-label="Close cropper"
          />
          <div className="file-input-cropper-container">
            <div className="file-input-cropper-header">
              <h3 className="file-input-cropper-title">Crop Image</h3>
              <button
                type="button"
                className="file-input-cropper-close"
                onClick={handleCropCancel}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="file-input-cropper-content">
              <div
                className="file-input-cropper-image-container"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX - crop.x;
                  const startY = e.clientY - crop.y;

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    onCropChange({
                      x: moveEvent.clientX - startX,
                      y: moveEvent.clientY - startY,
                    });
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              >
                <img
                  src={imageToCrop.url}
                  alt="Crop preview"
                  className="file-input-cropper-image"
                  style={{
                    transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                  }}
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const containerWidth = 600;
                    const containerHeight = 400;
                    const cropWidth = cropAspectRatio
                      ? Math.min(containerWidth * 0.8, containerHeight * 0.8 * cropAspectRatio)
                      : containerWidth * 0.8;
                    const cropHeight = cropAspectRatio
                      ? cropWidth / cropAspectRatio
                      : containerHeight * 0.8;

                    // Calculate crop area in pixels
                    const scale = zoom;
                    const imgWidth = img.naturalWidth;
                    const imgHeight = img.naturalHeight;
                    const displayWidth = img.width * scale;
                    const displayHeight = img.height * scale;

                    // Calculate center point
                    const centerX = containerWidth / 2;
                    const centerY = containerHeight / 2;

                    // Calculate crop area relative to image
                    const cropX = (centerX - crop.x - cropWidth / 2) / scale;
                    const cropY = (centerY - crop.y - cropHeight / 2) / scale;

                    // Store crop area for saving
                    onCropCompleteInternal(null, {
                      x: Math.max(0, cropX),
                      y: Math.max(0, cropY),
                      width: Math.min(cropWidth / scale, imgWidth),
                      height: Math.min(cropHeight / scale, imgHeight),
                    });
                  }}
                />

                {/* Crop overlay */}
                <div
                  className="file-input-cropper-overlay-box"
                  style={{
                    width: cropAspectRatio
                      ? `${Math.min(80, 80 * cropAspectRatio)}%`
                      : "80%",
                    aspectRatio: cropAspectRatio ? String(cropAspectRatio) : undefined,
                  }}
                >
                  <div className="file-input-cropper-grid">
                    <div className="file-input-cropper-grid-line" />
                    <div className="file-input-cropper-grid-line" />
                  </div>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="file-input-cropper-controls">
                <label htmlFor="zoom-slider" className="file-input-cropper-label">
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <input
                  id="zoom-slider"
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                  className="file-input-cropper-slider"
                  aria-label="Zoom level"
                />
              </div>
            </div>

            <div className="file-input-cropper-footer">
              <button
                type="button"
                className="file-input-cropper-button file-input-cropper-button--cancel"
                onClick={handleCropCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="file-input-cropper-button file-input-cropper-button--save"
                onClick={handleCropSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

FileInput.displayName = "FileInput";
