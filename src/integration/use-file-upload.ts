"use client";

import { useCallback, useState } from "react";

export interface FileUploadProgress {
  [fileName: string]: number;
}

export interface UseFileUploadReturn {
  uploadTokens: string[];
  uploadProgress: FileUploadProgress;
  isUploading: boolean;
  uploadFiles: (files: File[]) => Promise<void>;
  removeFile: (file: File, index: number) => void;
  resetUpload: () => void;
}

interface ContactFormUploadResponse {
  contact_form_upload?: {
    token?: string;
  };
}

export interface UseFileUploadOptions {
  onError?: (error: Error) => void;
  /**
   * Upload endpoint.
   *
   * Defaults to DashTrack contact form uploads endpoint.
   */
  endpoint?: string;
}

const DEFAULT_UPLOAD_ENDPOINT =
  "https://api.dashtrack.com/contacts/_/contact_form_uploads";

/**
 * Upload helper for two-phase contact form uploads.
 */
export function useFileUpload(
  options?: UseFileUploadOptions,
): UseFileUploadReturn {
  const [uploadTokens, setUploadTokens] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);

  const endpoint = options?.endpoint || DEFAULT_UPLOAD_ENDPOINT;

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setIsUploading(true);

      try {
        const tokens: string[] = [];

        for (const file of files) {
          const formData = new FormData();
          formData.append("contact_form_upload[file_upload]", file);
          formData.append("contact_form_upload[title]", file.name);
          formData.append("contact_form_upload[file_name]", file.name);
          formData.append("contact_form_upload[file_size]", String(file.size));

          const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const data = (await response.json()) as ContactFormUploadResponse;
          if (data.contact_form_upload?.token) {
            tokens.push(`upload_${data.contact_form_upload.token}`);
          }

          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 100,
          }));
        }

        setUploadTokens(tokens);
      } catch (error) {
        options?.onError?.(error as Error);
      } finally {
        setIsUploading(false);
      }
    },
    [endpoint, options],
  );

  const removeFile = useCallback((file: File, index: number) => {
    setUploadTokens((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[file.name];
      return next;
    });
  }, []);

  const resetUpload = useCallback(() => {
    setUploadTokens([]);
    setUploadProgress({});
  }, []);

  return {
    uploadTokens,
    uploadProgress,
    isUploading,
    uploadFiles,
    removeFile,
    resetUpload,
  };
}
