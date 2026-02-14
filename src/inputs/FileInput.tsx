"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from "../components/ui/file-upload";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { cn } from "../lib/utils";

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
export interface FileInputProps extends Omit<
  InputProps<File[]>,
  "value" | "onChange"
> {
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
 * Built on the DiceUI-style FileUpload primitive with form-specific behavior:
 * - Rails/token upload workflow compatibility
 * - External upload progress support
 * - Validation + accessibility wiring
 * - Optional image cropping modal
 */
export function FileInput({
  name,
  value = [],
  onChange,
  onBlur,
  placeholder = "Choose file...",
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
  const normalizedValue = React.useMemo(() => {
    const safeValue = Array.isArray(value) ? value : [];
    return multiple ? safeValue : safeValue.slice(0, 1);
  }, [multiple, value]);

  const [cropperOpen, setCropperOpen] = React.useState(false);
  const [imageToCrop, setImageToCrop] = React.useState<{
    file: File;
    url: string;
  } | null>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    React.useState<CropArea | null>(null);

  /**
   * Validate file against constraints
   */
  const validateFile = React.useCallback(
    (file: File): FileValidationError | null => {
      if (accept) {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const isValidType = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }

          if (type.endsWith("/*")) {
            const baseType = type.split("/")[0];
            return file.type.startsWith(`${baseType}/`);
          }

          return file.type === type;
        });

        if (!isValidType) {
          return {
            file,
            error: "type",
            message: `File type "${file.type}" is not accepted. Accepted types: ${accept}`,
          };
        }
      }

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
    [accept, maxSize],
  );

  const mapRejectedFileError = React.useCallback(
    (file: File, message: string): FileValidationError => {
      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes("maximum") &&
        normalizedMessage.includes("files")
      ) {
        return { file, error: "count", message };
      }

      if (
        normalizedMessage.includes("size") ||
        normalizedMessage.includes("large")
      ) {
        return { file, error: "size", message };
      }

      if (
        normalizedMessage.includes("type") ||
        normalizedMessage.includes("accept")
      ) {
        return { file, error: "type", message };
      }

      if (file.size > maxSize) {
        return { file, error: "size", message };
      }

      return { file, error: "type", message };
    },
    [maxSize],
  );

  const handleFileValidate = React.useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      return validationError?.message ?? null;
    },
    [validateFile],
  );

  const handleFileReject = React.useCallback(
    (file: File, message: string) => {
      const validationError = mapRejectedFileError(file, message);
      onValidationError?.([validationError]);
    },
    [mapRejectedFileError, onValidationError],
  );

  const handleBlur = React.useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const fileIdentity = React.useCallback((file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  const handleValueChange = React.useCallback(
    (incomingFiles: File[]) => {
      const nextFiles = multiple ? incomingFiles : incomingFiles.slice(-1);

      if (onFileRemove && nextFiles.length < normalizedValue.length) {
        const nextFileIds = new Set(nextFiles.map((file) => fileIdentity(file)));
        normalizedValue.forEach((file, index) => {
          if (!nextFileIds.has(fileIdentity(file))) {
            onFileRemove(file, index);
          }
        });
      }

      if (enableCropping && !multiple) {
        const nextImageFile = nextFiles[0];
        const previousFile = normalizedValue[0];
        const isNewSingleImage = Boolean(
          nextImageFile &&
            nextImageFile.type.startsWith("image/") &&
            nextImageFile !== previousFile,
        );

        if (isNewSingleImage) {
          const previewUrl = URL.createObjectURL(nextImageFile!);
          setImageToCrop({ file: nextImageFile!, url: previewUrl });
          setCropperOpen(true);
          return;
        }
      }

      onChange(nextFiles);
    },
    [
      enableCropping,
      maxFiles,
      multiple,
      normalizedValue,
      onChange,
      onFileRemove,
      fileIdentity,
    ],
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

          canvas.width = cropArea.width;
          canvas.height = cropArea.height;

          ctx.drawImage(
            image,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            cropArea.width,
            cropArea.height,
          );

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to create blob from canvas"));
              }
            },
            "image/jpeg",
            0.95,
          );
        };

        image.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        image.src = imageUrl;
      });
    },
    [],
  );

  /**
   * Handle crop completion
   */
  const handleCropSave = React.useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedBlob = await createCroppedImage(
        imageToCrop.url,
        croppedAreaPixels,
      );

      if (onCropComplete) {
        onCropComplete(croppedBlob, imageToCrop.file);
      }

      const croppedFile = new File([croppedBlob], imageToCrop.file.name, {
        type: "image/jpeg",
      });

      let updatedFiles: File[];
      if (!multiple) {
        updatedFiles = [croppedFile];
      } else {
        const existingIndex = normalizedValue.findIndex(
          (file) => file === imageToCrop.file,
        );

        if (existingIndex === -1) {
          updatedFiles = [...normalizedValue, croppedFile].slice(0, maxFiles);
        } else {
          updatedFiles = normalizedValue.map((file, index) =>
            index === existingIndex ? croppedFile : file,
          );
        }
      }

      onChange(updatedFiles);

      setCropperOpen(false);
      URL.revokeObjectURL(imageToCrop.url);
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (cropError) {
      console.error("Failed to crop image:", cropError);
    }
  }, [
    createCroppedImage,
    croppedAreaPixels,
    imageToCrop,
    maxFiles,
    multiple,
    normalizedValue,
    onChange,
    onCropComplete,
  ]);

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

  const handleCrop = React.useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const previewUrl = URL.createObjectURL(file);
    setImageToCrop({ file, url: previewUrl });
    setCropperOpen(true);
  }, []);

  const onCropChange = React.useCallback((nextCrop: { x: number; y: number }) => {
    setCrop(nextCrop);
  }, []);

  const onZoomChange = React.useCallback((nextZoom: number) => {
    setZoom(nextZoom);
  }, []);

  const onCropCompleteInternal = React.useCallback(
    (_: unknown, nextCroppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(nextCroppedAreaPixels);
    },
    [],
  );

  const formatFileSize = React.useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const unit = 1024;
    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(unit));
    return Math.round((bytes / Math.pow(unit, index)) * 100) / 100 + " " + units[index];
  }, []);

  React.useEffect(() => {
    return () => {
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop.url);
      }
    };
  }, [imageToCrop]);

  const fileCountLabel =
    normalizedValue.length > 0
      ? `${normalizedValue.length} file(s) selected`
      : placeholder;

  return (
    <>
      <FileUpload
        name={name}
        value={normalizedValue}
        onValueChange={handleValueChange}
        onFileValidate={handleFileValidate}
        onFileReject={handleFileReject}
        accept={accept}
        maxSize={maxSize}
        maxFiles={multiple ? maxFiles : undefined}
        multiple={multiple}
        disabled={disabled}
        required={required && normalizedValue.length === 0}
        invalid={Boolean(error || props["aria-invalid"])}
        label="File upload"
        className={cn(className)}
        inputProps={{
          ...props,
          onBlur: handleBlur,
          style: { display: "none" },
          "aria-invalid": error || props["aria-invalid"],
          "aria-required": required || props["aria-required"],
          "aria-describedby": props["aria-describedby"],
        }}
      >
        <FileUploadDropzone
          role="button"
          aria-label={placeholder}
          className={cn(
            "flex min-h-32 w-full cursor-pointer items-center justify-center border-input bg-transparent p-6 transition-colors",
            "hover:bg-accent/50 hover:border-ring",
            "data-[dragging]:bg-accent data-[dragging]:border-ring",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-destructive",
          )}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <svg
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

            <p className="text-sm font-medium">{fileCountLabel}</p>
            {accept && <p className="text-xs">Accepted: {accept}</p>}
            <p className="text-xs">Max size: {formatFileSize(maxSize)}</p>
          </div>
        </FileUploadDropzone>

        <FileUploadList className="mt-4">
          {normalizedValue.map((file, index) => {
            const progressValue = uploadProgress[file.name];
            const hasProgress =
              showProgress && typeof progressValue === "number";

            return (
              <FileUploadItem
                key={`${file.name}-${index}`}
                value={file}
                className="flex items-center gap-3 border-border bg-card text-card-foreground hover:bg-primary/50 transition-colors"
              >
                {showPreview ? (
                  <FileUploadItemPreview className="h-12 w-12 rounded [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>svg]:size-6" />
                ) : null}

                <div className="flex min-w-0 flex-1 flex-col">
                  <FileUploadItemMetadata className="min-w-0" />
                  <span className="text-xs">{formatFileSize(file.size)}</span>

                  {hasProgress ? (
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent/40"
                        role="progressbar"
                        aria-valuenow={progressValue}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Upload progress: ${progressValue}%`}
                      >
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                      <span className="text-xs">{progressValue}%</span>
                    </div>
                  ) : null}
                </div>

                {enableCropping && file.type.startsWith("image/") ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCrop(file);
                    }}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
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
                  </Button>
                ) : null}

                <FileUploadItemDelete asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    className="h-8 w-8 p-0"
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
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            );
          })}
        </FileUploadList>
      </FileUpload>

      <Dialog
        open={cropperOpen && Boolean(imageToCrop)}
        onOpenChange={(open) => {
          if (!open) {
            handleCropCancel();
          }
        }}
      >
        {imageToCrop ? (
          <DialogContent
            showCloseButton={false}
            className="max-w-3xl gap-0 p-0"
            aria-describedby={undefined}
          >
            <DialogHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
              <DialogTitle>Crop Image</DialogTitle>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  aria-label="Close"
                >
                  <svg
                    width="16"
                    height="16"
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
                </Button>
              </DialogClose>
            </DialogHeader>

            <div className="p-4">
              <div
                className="relative h-96 w-full overflow-hidden rounded-md bg-accent/40"
                onMouseDown={(event) => {
                  event.preventDefault();
                  const startX = event.clientX - crop.x;
                  const startY = event.clientY - crop.y;

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
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{
                    transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                  }}
                  draggable={false}
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    const containerWidth = 600;
                    const containerHeight = 400;

                    const cropWidth = cropAspectRatio
                      ? Math.min(
                          containerWidth * 0.8,
                          containerHeight * 0.8 * cropAspectRatio,
                        )
                      : containerWidth * 0.8;
                    const cropHeight = cropAspectRatio
                      ? cropWidth / cropAspectRatio
                      : containerHeight * 0.8;

                    const imageWidth = image.naturalWidth;
                    const imageHeight = image.naturalHeight;
                    const scale = zoom;
                    const centerX = containerWidth / 2;
                    const centerY = containerHeight / 2;

                    const cropX = (centerX - crop.x - cropWidth / 2) / scale;
                    const cropY = (centerY - crop.y - cropHeight / 2) / scale;

                    onCropCompleteInternal(null, {
                      x: Math.max(0, cropX),
                      y: Math.max(0, cropY),
                      width: Math.min(cropWidth / scale, imageWidth),
                      height: Math.min(cropHeight / scale, imageHeight),
                    });
                  }}
                />

                <div
                  className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded border-2 border-primary"
                  style={{
                    width: cropAspectRatio
                      ? `${Math.min(80, 80 * cropAspectRatio)}%`
                      : "80%",
                    aspectRatio: cropAspectRatio
                      ? String(cropAspectRatio)
                      : undefined,
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

              <div className="mt-4 flex items-center gap-3">
                <label
                  htmlFor="zoom-slider"
                  className="whitespace-nowrap text-sm font-medium"
                >
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <input
                  id="zoom-slider"
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(event) => onZoomChange(parseFloat(event.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-accent/60"
                  aria-label="Zoom level"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border p-4">
              <Button type="button" variant="outline" onClick={handleCropCancel}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCropSave}>
                Save
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}

FileInput.displayName = "FileInput";
