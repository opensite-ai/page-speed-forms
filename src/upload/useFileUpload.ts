"use client";

import * as React from "react";

/**
 * Upload progress information
 */
export interface UploadProgress {
  /**
   * Bytes loaded
   */
  loaded: number;

  /**
   * Total bytes
   */
  total: number;

  /**
   * Progress percentage (0-100)
   */
  percent: number;

  /**
   * Upload speed in bytes per second
   */
  speed: number;

  /**
   * Estimated remaining time in seconds
   */
  remaining: number;

  /**
   * Current chunk being uploaded (for chunked uploads)
   */
  currentChunk?: number;

  /**
   * Total chunks (for chunked uploads)
   */
  totalChunks?: number;
}

/**
 * Upload error information
 */
export interface UploadError {
  /**
   * Error message
   */
  message: string;

  /**
   * HTTP status code
   */
  status?: number;

  /**
   * Error code
   */
  code?: string;

  /**
   * File that failed to upload
   */
  file: File;
}

/**
 * Upload state
 */
export type UploadState = "idle" | "uploading" | "paused" | "completed" | "error";

/**
 * Upload format for legacy compatibility
 */
export type UploadFormat = "legacy" | "chunked" | "standard";

/**
 * Hook options
 */
export interface UseFileUploadOptions {
  /**
   * Upload endpoint URL
   */
  endpoint: string;

  /**
   * Upload format for API compatibility
   * - legacy: Rails DTFormBuilder format (FormData with contact_form_upload[])
   * - chunked: Multi-part chunked upload with resume capability
   * - standard: Simple FormData upload
   * @default "standard"
   */
  format?: UploadFormat;

  /**
   * Chunk size in bytes (for chunked uploads)
   * @default 1MB (1024 * 1024)
   */
  chunkSize?: number;

  /**
   * Maximum parallel chunk uploads
   * @default 3
   */
  maxParallel?: number;

  /**
   * Enable resumable uploads (requires chunked format)
   * @default false
   */
  resumable?: boolean;

  /**
   * Request headers
   */
  headers?: Record<string, string>;

  /**
   * Progress update callback
   */
  onProgress?: (progress: UploadProgress) => void;

  /**
   * Upload complete callback
   * @param token - Upload token(s) returned by server
   */
  onComplete?: (token: string | string[]) => void;

  /**
   * Upload error callback
   */
  onError?: (error: UploadError) => void;
}

/**
 * Upload result
 */
interface UploadResult {
  /**
   * Upload state
   */
  state: UploadState;

  /**
   * Upload progress
   */
  progress: UploadProgress;

  /**
   * Upload error
   */
  error: UploadError | null;

  /**
   * Upload token(s)
   */
  token: string | string[] | null;

  /**
   * Start upload
   */
  upload: (files: File | File[]) => Promise<void>;

  /**
   * Pause upload (chunked only)
   */
  pause: () => void;

  /**
   * Resume upload (chunked only)
   */
  resume: () => void;

  /**
   * Cancel upload
   */
  cancel: () => void;

  /**
   * Reset state
   */
  reset: () => void;
}

/**
 * File upload hook with progress tracking and chunked upload support
 *
 * @example
 * ```tsx
 * const { upload, progress, state } = useFileUpload({
 *   endpoint: "/api/uploads",
 *   format: "legacy",
 *   onComplete: (token) => {
 *     form.setFieldValue("resumeToken", token);
 *   },
 * });
 *
 * const handleUpload = async () => {
 *   await upload(files);
 * };
 * ```
 */
export function useFileUpload({
  endpoint,
  format = "standard",
  chunkSize = 1024 * 1024, // 1MB
  maxParallel = 3,
  resumable = false,
  headers = {},
  onProgress,
  onComplete,
  onError,
}: UseFileUploadOptions): UploadResult {
  const [state, setState] = React.useState<UploadState>("idle");
  const [progress, setProgress] = React.useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percent: 0,
    speed: 0,
    remaining: 0,
  });
  const [error, setError] = React.useState<UploadError | null>(null);
  const [token, setToken] = React.useState<string | string[] | null>(null);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const pausedRef = React.useRef(false);
  const startTimeRef = React.useRef<number>(0);
  const loadedAtStartRef = React.useRef<number>(0);

  /**
   * Calculate upload speed and remaining time
   */
  const calculateProgress = React.useCallback(
    (loaded: number, total: number): UploadProgress => {
      const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000; // seconds
      const loadedSinceStart = loaded - loadedAtStartRef.current;
      const speed = elapsedTime > 0 ? loadedSinceStart / elapsedTime : 0;
      const remaining =
        speed > 0 ? Math.ceil((total - loaded) / speed) : 0;

      return {
        loaded,
        total,
        percent,
        speed,
        remaining,
      };
    },
    []
  );

  /**
   * Update progress and notify callback
   */
  const updateProgress = React.useCallback(
    (loaded: number, total: number, chunkInfo?: { current: number; total: number }) => {
      const progressData = {
        ...calculateProgress(loaded, total),
        ...(chunkInfo && {
          currentChunk: chunkInfo.current,
          totalChunks: chunkInfo.total,
        }),
      };

      setProgress(progressData);

      if (onProgress) {
        onProgress(progressData);
      }
    },
    [calculateProgress, onProgress]
  );

  /**
   * Upload file in legacy Rails format
   */
  const uploadLegacy = React.useCallback(
    async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("contact_form_upload[file]", file);
      formData.append("contact_form_upload[file_type]", file.type);
      formData.append("contact_form_upload[upload_name]", file.name);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            updateProgress(e.loaded, e.total);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              const uploadToken = response.contact_form_upload?.token;

              if (uploadToken) {
                resolve(uploadToken);
              } else {
                reject(new Error("No token in response"));
              }
            } catch (err) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        xhr.open("POST", endpoint);

        // Add custom headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.send(formData);

        // Store XHR for cancellation
        abortControllerRef.current = {
          abort: () => xhr.abort(),
        } as AbortController;
      });
    },
    [endpoint, headers, updateProgress]
  );

  /**
   * Upload file in standard format
   */
  const uploadStandard = React.useCallback(
    async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            updateProgress(e.loaded, e.total);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              const uploadToken = response.token || response.id;

              if (uploadToken) {
                resolve(uploadToken);
              } else {
                reject(new Error("No token in response"));
              }
            } catch (err) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        xhr.open("POST", endpoint);

        // Add custom headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.send(formData);

        // Store XHR for cancellation
        abortControllerRef.current = {
          abort: () => xhr.abort(),
        } as AbortController;
      });
    },
    [endpoint, headers, updateProgress]
  );

  /**
   * Upload file in chunks
   */
  const uploadChunked = React.useCallback(
    async (file: File): Promise<string> => {
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedChunks = 0;
      let totalLoaded = 0;

      // Upload chunk
      const uploadChunk = async (
        chunk: Blob,
        chunkIndex: number
      ): Promise<void> => {
        if (pausedRef.current) {
          throw new Error("Upload paused");
        }

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("chunkIndex", chunkIndex.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("fileName", file.name);
        formData.append("fileSize", file.size.toString());

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: formData,
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error(`Chunk ${chunkIndex} upload failed: ${response.status}`);
        }

        uploadedChunks++;
        totalLoaded += chunk.size;

        updateProgress(totalLoaded, file.size, {
          current: uploadedChunks,
          total: totalChunks,
        });
      };

      // Parallel chunk upload
      const chunks: Array<{ blob: Blob; index: number }> = [];
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        chunks.push({ blob: chunk, index: i });
      }

      // Upload chunks with concurrency limit
      const uploadPromises: Promise<void>[] = [];
      for (let i = 0; i < chunks.length; i += maxParallel) {
        const batch = chunks.slice(i, i + maxParallel);
        const batchPromises = batch.map((chunk) =>
          uploadChunk(chunk.blob, chunk.index)
        );
        await Promise.all(batchPromises);
        uploadPromises.push(...batchPromises);
      }

      // Finalize upload
      const finalizeResponse = await fetch(`${endpoint}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          fileName: file.name,
          totalChunks,
        }),
        signal: abortControllerRef.current?.signal,
      });

      if (!finalizeResponse.ok) {
        throw new Error("Failed to finalize upload");
      }

      const result = await finalizeResponse.json();
      return result.token || result.id;
    },
    [endpoint, chunkSize, maxParallel, headers, updateProgress]
  );

  /**
   * Upload single file
   */
  const uploadFile = React.useCallback(
    async (file: File): Promise<string> => {
      // Choose upload method based on format
      if (format === "legacy") {
        return uploadLegacy(file);
      } else if (format === "chunked") {
        return uploadChunked(file);
      } else {
        return uploadStandard(file);
      }
    },
    [format, uploadLegacy, uploadChunked, uploadStandard]
  );

  /**
   * Upload files
   */
  const upload = React.useCallback(
    async (files: File | File[]) => {
      const fileArray = Array.isArray(files) ? files : [files];

      if (fileArray.length === 0) {
        return;
      }

      // Reset state
      setState("uploading");
      setError(null);
      setToken(null);
      pausedRef.current = false;
      startTimeRef.current = Date.now();
      loadedAtStartRef.current = 0;
      abortControllerRef.current = new AbortController();

      try {
        const tokens: string[] = [];

        for (const file of fileArray) {
          const uploadToken = await uploadFile(file);
          tokens.push(uploadToken);
        }

        setToken(tokens.length === 1 ? tokens[0] : tokens);
        setState("completed");

        if (onComplete) {
          onComplete(tokens.length === 1 ? tokens[0] : tokens);
        }
      } catch (err) {
        const uploadError: UploadError = {
          message: err instanceof Error ? err.message : "Upload failed",
          file: fileArray[0],
        };

        setError(uploadError);
        setState("error");

        if (onError) {
          onError(uploadError);
        }
      }
    },
    [uploadFile, onComplete, onError]
  );

  /**
   * Pause upload
   */
  const pause = React.useCallback(() => {
    if (state === "uploading" && format === "chunked" && resumable) {
      pausedRef.current = true;
      setState("paused");
    }
  }, [state, format, resumable]);

  /**
   * Resume upload
   */
  const resume = React.useCallback(() => {
    if (state === "paused") {
      pausedRef.current = false;
      setState("uploading");
      // Resume logic would need chunk tracking implementation
    }
  }, [state]);

  /**
   * Cancel upload
   */
  const cancel = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState("idle");
    setProgress({
      loaded: 0,
      total: 0,
      percent: 0,
      speed: 0,
      remaining: 0,
    });
  }, []);

  /**
   * Reset state
   */
  const reset = React.useCallback(() => {
    setState("idle");
    setProgress({
      loaded: 0,
      total: 0,
      percent: 0,
      speed: 0,
      remaining: 0,
    });
    setError(null);
    setToken(null);
    pausedRef.current = false;
  }, []);

  return {
    state,
    progress,
    error,
    token,
    upload,
    pause,
    resume,
    cancel,
    reset,
  };
}
