/**
 * @page-speed/forms - File Upload Module
 *
 * High-performance file upload components with progress tracking,
 * drag-and-drop support, chunked uploads, and legacy Rails API compatibility.
 *
 * @example
 * ```tsx
 * import { useFileUpload } from "@page-speed/forms/upload";
 *
 * const { upload, progress, state } = useFileUpload({
 *   endpoint: "/api/uploads",
 *   format: "legacy", // Rails DTFormBuilder compatibility
 *   onComplete: (token) => {
 *     form.setFieldValue("resumeToken", token);
 *   },
 * });
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/upload
 */

export {
  useFileUpload,
  type UseFileUploadOptions,
  type UploadProgress,
  type UploadError,
  type UploadState,
  type UploadFormat,
} from "./useFileUpload";
