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
   * Handle crop button click for existing file
   */
  const handleCrop = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const previewUrl = URL.createObjectURL(file);
    setImageToCrop({ file, url: previewUrl });
    setCropperOpen(true);
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

  const combinedClassName = `${className}`.trim();

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
        aria-invalid={error || props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
        aria-required={required || props["aria-required"]}
        style={{ display: "none" }}
      />

      {/* Drop zone */}
      <div
        className={`flex min-h-32 w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-input bg-transparent p-6 transition-colors hover:bg-accent/50 hover:border-ring ${dragActive ? "bg-accent border-ring" : ""} ${disabled ? "cursor-not-allowed opacity-50" : ""} ${error ? "border-red-500" : ""}`}
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
        <div className="flex flex-col items-center gap-2 text-center">
          <svg
            className="text-muted-foreground"
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
          <p className="text-sm font-medium">
            {value.length > 0
              ? `${value.length} file(s) selected`
              : placeholder}
          </p>
          {accept && (
            <p className="text-xs text-muted-foreground">Accepted: {accept}</p>
          )}
          {maxSize && (
            <p className="text-xs text-muted-foreground">
              Max size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      </div>

      {/* File list */}
      {value.length > 0 && (
        <ul className="flex flex-col gap-2 mt-4" role="list">
          {value.map((file, index) => {
            const previewUrl = showPreview ? getPreviewUrl(file) : null;

            return (
              <li key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-12 h-12 rounded object-cover"
                    width="48"
                    height="48"
                  />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                  {/* Upload progress indicator */}
                  {showProgress && uploadProgress[file.name] !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-1.5 bg-muted rounded-full overflow-hidden flex-1"
                        role="progressbar"
                        aria-valuenow={uploadProgress[file.name]}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Upload progress: ${uploadProgress[file.name]}%`}
                      >
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {uploadProgress[file.name]}%
                      </span>
                    </div>
                  )}
                </div>
                {/* Crop button for images when cropping is enabled */}
                {enableCropping && file.type.startsWith("image/") && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCrop(file);
                    }}
                    disabled={disabled}
                    className="flex items-center justify-center h-8 w-8 rounded border-none bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Crop ${file.name}`}
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
                      <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
                      <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  disabled={disabled}
                  className="flex items-center justify-center h-8 w-8 rounded border-none bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCropCancel}
            aria-label="Close cropper"
          />
          <div className="relative bg-popover border border-border rounded-lg shadow-lg max-w-3xl w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Crop Image</h3>
              <button
                type="button"
                className="flex items-center justify-center h-8 w-8 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleCropCancel}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <div
                className="relative w-full h-96 bg-muted rounded-md overflow-hidden"
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
                  className="absolute inset-0 w-full h-full object-contain"
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
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary rounded pointer-events-none"
                  style={{
                    width: cropAspectRatio
                      ? `${Math.min(80, 80 * cropAspectRatio)}%`
                      : "80%",
                    aspectRatio: cropAspectRatio ? String(cropAspectRatio) : undefined,
                  }}
                >
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-primary/30" />
                    <div className="border-r border-b border-primary/30" />
                    <div className="border-b border-primary/30" />
                    <div className="border-r border-b border-primary/30" />
                    <div className="border-r border-b border-primary/30" />
                    <div className="border-b border-primary/30" />
                    <div className="border-r border-primary/30" />
                    <div className="border-r border-primary/30" />
                    <div />
                  </div>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-3 mt-4">
                <label htmlFor="zoom-slider" className="text-sm font-medium whitespace-nowrap">
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
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  aria-label="Zoom level"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <button
                type="button"
                className="inline-flex items-center justify-center h-9 rounded-md px-4 text-sm font-medium border border-input bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={handleCropCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center h-9 rounded-md px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
