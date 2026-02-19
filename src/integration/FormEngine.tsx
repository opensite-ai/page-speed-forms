"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Form } from "../core/Form";
import { DynamicFormField } from "./DynamicFormField";
import { getColumnSpanClass } from "./form-field-types";
import type { FormFieldConfig } from "./form-field-types";
import type { FormRenderConfig } from "../core/types";
import type { PageSpeedFormConfig } from "./form-submit";
import { useContactForm } from "./use-contact-form";
import { useFileUpload } from "./use-file-upload";

// ─── Default Values ───────────────────────────────────────────────────────────

const DEFAULT_STYLE_RULES: FormEngineStyleRules = {
  formContainer: "",
  fieldsContainer: "",
  fieldClassName: "",
  formClassName: "",
  successMessageClassName:
    "text-green-600 dark:text-green-400 mt-4 p-3 rounded-md bg-green-50 dark:bg-green-950/20",
  errorMessageClassName:
    "text-red-600 dark:text-red-400 mt-4 p-3 rounded-md bg-red-50 dark:bg-red-950/20",
};

const DEFAULT_SUBMIT_LABEL = "Submit";
const DEFAULT_BUTTON_GROUP_LABEL = "Subscribe";
const DEFAULT_BUTTON_VARIANT = "default";
const DEFAULT_BUTTON_GROUP_SIZE = "default";

// ─── Setup / Style Types ──────────────────────────────────────────────────────

export interface ButtonGroupFormSetup {
  size?: "xs" | "sm" | "default" | "lg";
  submitLabel?: React.ReactNode;
  submitVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
  submitIconName?: string;
  submitIconComponent?: React.ReactNode;
}

export interface FormEngineSubmitButtonSetup {
  submitLabel?: React.ReactNode;
  submitVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
  submitIconName?: string;
  submitIconComponent?: React.ReactNode;
}

export interface FormEngineStyleRules {
  /** ClassName applied to the div wrapping the `<form>` element */
  formContainer?: string;
  /** ClassName applied to the grid div wrapping all field columns (standard layout) */
  fieldsContainer?: string;
  /** Fallback className applied to each field wrapper when the field has no own className */
  fieldClassName?: string;
  /** className forwarded to the `<form>` element itself via FormStyleConfig */
  formClassName?: string;
  /** className forwarded to the success message container via FormStyleConfig */
  successMessageClassName?: string;
  /** className forwarded to the error message container via FormStyleConfig */
  errorMessageClassName?: string;
}

export interface FormEngineLayoutSettings {
  styleRules?: FormEngineStyleRules;
  formLayout?: "standard" | "button-group";
  /** Settings for button-group layout (only used when formLayout is "button-group") */
  buttonGroupSetup?: ButtonGroupFormSetup;
  /** Settings for the submit button in standard layout */
  submitButtonSetup?: FormEngineSubmitButtonSetup;
}

export interface FormEngineProps {
  /** API / submission configuration */
  api?: PageSpeedFormConfig;
  /** Form field definitions */
  fields: FormFieldConfig[];
  /** Layout, style, and submit-button settings */
  formLayoutSettings?: FormEngineLayoutSettings;
  /** Success message shown after a successful submission */
  successMessage?: React.ReactNode;
  /** Custom submit handler (called in addition to any api endpoint) */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Called after a successful submission with the server response */
  onSuccess?: (data: unknown) => void;
  /** Called when submission fails */
  onError?: (error: Error) => void;
  /** Navigation handler for internal redirects (return false to fall back to browser navigation) */
  navigate?: (href: string) => boolean | void;
  /** Reset form values after success @default true */
  resetOnSuccess?: boolean;
  /** File upload tokens to merge into the payload */
  uploadTokens?: string[];
  /** Called when files are selected for upload */
  onFileUpload?: (files: File[]) => Promise<void>;
  /** Called when a file is removed */
  onFileRemove?: (file: File, index: number) => void;
  /** Whether a file upload is in progress */
  isUploading?: boolean;
  /** Per-file upload progress map (fileName → 0-100) */
  uploadProgress?: { [fileName: string]: number };
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * FormEngine — declarative form component with built-in API integration.
 *
 * Handles `useContactForm` orchestration internally so callers only need to
 * supply `api`, `fields`, and optional layout/style settings.
 *
 * @example Standard layout
 * ```tsx
 * <FormEngine api={api} fields={fields} formLayoutSettings={{ submitButtonSetup: { submitLabel: "Send" } }} />
 * ```
 *
 * @example Button-group layout
 * ```tsx
 * <FormEngine api={api} fields={[emailField]} formLayoutSettings={{ formLayout: "button-group", buttonGroupSetup: { size: "lg", submitLabel: "Subscribe" } }} />
 * ```
 */
export function FormEngine({
  api,
  fields,
  formLayoutSettings,
  successMessage,
  onSubmit,
  onSuccess,
  onError,
  navigate,
  resetOnSuccess,
  uploadTokens: externalUploadTokens,
  onFileUpload: externalOnFileUpload,
  onFileRemove: externalOnFileRemove,
  isUploading: externalIsUploading,
  uploadProgress: externalUploadProgress,
}: FormEngineProps) {
  const {
    styleRules: userStyleRules,
    formLayout = "standard",
    buttonGroupSetup,
    submitButtonSetup,
  } = formLayoutSettings ?? {};
  const isButtonGroup = formLayout === "button-group";

  // Merge user-provided styles with defaults
  const styleRules = React.useMemo<FormEngineStyleRules>(
    () => ({
      formContainer:
        userStyleRules?.formContainer ?? DEFAULT_STYLE_RULES.formContainer,
      fieldsContainer:
        userStyleRules?.fieldsContainer ?? DEFAULT_STYLE_RULES.fieldsContainer,
      fieldClassName:
        userStyleRules?.fieldClassName ?? DEFAULT_STYLE_RULES.fieldClassName,
      formClassName:
        userStyleRules?.formClassName ?? DEFAULT_STYLE_RULES.formClassName,
      successMessageClassName:
        userStyleRules?.successMessageClassName ??
        DEFAULT_STYLE_RULES.successMessageClassName,
      errorMessageClassName:
        userStyleRules?.errorMessageClassName ??
        DEFAULT_STYLE_RULES.errorMessageClassName,
    }),
    [userStyleRules],
  );

  // Integrate file upload functionality
  const {
    uploadTokens: internalUploadTokens,
    uploadProgress: internalUploadProgress,
    isUploading: internalIsUploading,
    uploadFiles: internalUploadFiles,
    removeFile: internalRemoveFile,
    resetUpload,
  } = useFileUpload({ onError });

  // Use external upload state if provided, otherwise use internal
  const uploadTokens = externalUploadTokens ?? internalUploadTokens;
  const uploadProgress = externalUploadProgress ?? internalUploadProgress;
  const isUploading = externalIsUploading ?? internalIsUploading;
  const onFileUpload = externalOnFileUpload ?? internalUploadFiles;
  const onFileRemove = externalOnFileRemove ?? internalRemoveFile;

  const { form, submissionError, formMethod, resetSubmissionState } =
    useContactForm({
      formFields: fields,
      formConfig: api,
      onSubmit,
      onSuccess: (data) => {
        resetUpload();
        onSuccess?.(data);
      },
      onError,
      navigate,
      resetOnSuccess,
      uploadTokens,
    });

  // Map FormEngineLayoutSettings → FormRenderConfig for the legacy Form component
  const legacyFormConfig = React.useMemo<FormRenderConfig>(() => {
    if (isButtonGroup) {
      return {
        formLayout: "button-group",
        buttonGroupSize: buttonGroupSetup?.size ?? DEFAULT_BUTTON_GROUP_SIZE,
        submitLabel:
          buttonGroupSetup?.submitLabel ?? DEFAULT_BUTTON_GROUP_LABEL,
        submitVariant:
          buttonGroupSetup?.submitVariant ?? DEFAULT_BUTTON_VARIANT,
        submitIconName: buttonGroupSetup?.submitIconName,
        submitIconComponent: buttonGroupSetup?.submitIconComponent,
        endpoint: api?.endpoint,
        submissionConfig: api?.submissionConfig,
      };
    }
    return {
      formLayout: "standard",
      endpoint: api?.endpoint,
      submissionConfig: api?.submissionConfig,
    };
  }, [isButtonGroup, buttonGroupSetup, api]);

  return (
    <div className={styleRules?.formContainer}>
      <Form
        form={form}
        fields={isButtonGroup ? fields : undefined}
        formConfig={legacyFormConfig}
        method={formMethod}
        notificationConfig={{
          submissionError: submissionError ?? undefined,
          successMessage,
        }}
        styleConfig={{
          formClassName: styleRules?.formClassName,
          successMessageClassName: styleRules?.successMessageClassName,
          errorMessageClassName: styleRules?.errorMessageClassName,
        }}
        onNewSubmission={resetSubmissionState}
      >
        {!isButtonGroup && (
          <>
            <div
              className={cn(
                "grid grid-cols-12 gap-6",
                styleRules?.fieldsContainer,
              )}
            >
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={cn(
                    getColumnSpanClass(field.columnSpan ?? 12),
                    "min-w-0",
                  )}
                >
                  <DynamicFormField
                    field={field}
                    className={field.className ?? styleRules?.fieldClassName}
                    uploadProgress={uploadProgress}
                    onFileUpload={onFileUpload}
                    onFileRemove={onFileRemove}
                    isUploading={isUploading}
                  />
                </div>
              ))}
            </div>
            <Button
              type="submit"
              variant={
                submitButtonSetup?.submitVariant ?? DEFAULT_BUTTON_VARIANT
              }
              disabled={form.isSubmitting}
              className="mt-6 w-full"
            >
              {submitButtonSetup?.submitLabel ?? DEFAULT_SUBMIT_LABEL}
            </Button>
          </>
        )}
      </Form>
    </div>
  );
}

FormEngine.displayName = "FormEngine";
