"use client";

import * as React from "react";
import { cn } from "../../../lib/utils";
import type {
  ActionConfig,
  StatItem,
  SectionBackground,
  SectionSpacing,
} from "../../../src/types";
import { Section } from "../../ui/section";
import type { PatternName } from "../../ui/pattern-background";
import {
  FormEngine,
  useFileUpload,
  type FormFieldConfig,
  type PageSpeedFormConfig,
} from "@page-speed/forms/integration";

const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  {
    name: "email",
    type: "email",
    label: "Email Address",
    placeholder: "Enter your email",
    required: true,
    columnSpan: 12,
  },
];

export interface HeroNewsletterMinimalProps {
  /**
   * Main heading content
   */
  heading?: React.ReactNode;
  /**
   * Description text below heading
   */
  description?: React.ReactNode;
  /**
   * Form field configuration
   */
  formFields?: FormFieldConfig[];
  /**
   * Form configuration for submission
   */
  formConfig?: PageSpeedFormConfig;
  /**
   * Custom submit handler
   */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /**
   * Success callback
   */
  onSuccess?: (data: unknown) => void;
  /**
   * Error callback
   */
  onError?: (error: Error) => void;
  /**
   * Success message to display
   */
  successMessage?: React.ReactNode;
  /**
   * Submit button configuration
   */
  buttonAction?: ActionConfig;
  /**
   * Helper text below form
   */
  helperText?: React.ReactNode;
  /**
   * Custom slot for the form (overrides form props)
   */
  formSlot?: React.ReactNode;
  /**
   * Disclaimer text below form
   */
  disclaimer?: React.ReactNode;
  /**
   * Array of stat/trust indicators
   */
  stats?: StatItem[];
  /**
   * Custom slot for rendering stats (overrides stats array)
   */
  statsSlot?: React.ReactNode; /**
   * Background style for the section
   */
  background?: SectionBackground;
  /**
   * Vertical spacing for the section
   */
  spacing?: SectionSpacing;
  /**
   * Optional background pattern name
   */
  pattern?: PatternName | undefined;
  /**
   * Pattern overlay opacity (0-1)
   */
  patternOpacity?: number;

  /**
   * Additional CSS classes for the section
   */
  className?: string;
  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;
  /**
   * Additional CSS classes for the heading
   */
  headingClassName?: string;
  /**
   * Additional CSS classes for the description
   */
  descriptionClassName?: string;
  /**
   * Additional CSS classes for the form container
   */
  formClassName?: string;
  /**
   * Additional CSS classes for the input
   */
  inputClassName?: string;
  /**
   * Additional CSS classes for the disclaimer
   */
  disclaimerClassName?: string;
  /**
   * Additional CSS classes for the stats container
   */
  statsClassName?: string;
  /**
   * Additional CSS classes for the pattern overlay
   */
  patternClassName?: string;
}

export function HeroNewsletterMinimal({
  heading,
  description,
  formFields = DEFAULT_FORM_FIELDS,
  formConfig,
  onSubmit,
  onSuccess,
  onError,
  successMessage,
  buttonAction,
  helperText,
  formSlot,
  disclaimer,
  stats,
  patternClassName,
  statsSlot,
  background,
  containerClassName = "px-6 sm:px-6 md:px-8 lg:px-8",
  spacing = "xl",
  pattern,
  patternOpacity,
  className,
  headingClassName,
  descriptionClassName,
  formClassName,
  disclaimerClassName,
  statsClassName,
}: HeroNewsletterMinimalProps): React.JSX.Element {
  const {
    uploadTokens,
    uploadProgress,
    isUploading,
    uploadFiles,
    removeFile,
    resetUpload,
  } = useFileUpload({ onError });
  const renderStats = React.useMemo(() => {
    if (statsSlot) return statsSlot;
    if (!stats || stats.length === 0) return null;

    return stats.map((stat, index) => (
      <div key={index} className={cn("flex items-center", stat.className)}>
        <div className="text-center">
          <div
            className={cn(
              "flex items-center",
              stat.icon ? "justify-between" : "justify-center",
            )}
          >
            {stat.icon}
            <div
              className={cn("font-bold ", stat.icon ? "text-xl" : "text-2xl")}
            >
              {stat.value}
            </div>
          </div>
          <div className={cn("text-sm")}>{stat.label}</div>
        </div>
      </div>
    ));
  }, [statsSlot, stats]);

  const renderForm = React.useMemo(() => {
    if (formSlot) return formSlot;

    const defaultButtonAction: ActionConfig = {
      label: "Subscribe",
      variant: "default",
    };

    const action = buttonAction || defaultButtonAction;

    return (
      <>
        <FormEngine
          api={formConfig}
          fields={formFields}
          formLayoutSettings={{
            formLayout: "button-group",
            buttonGroupSetup: {
              size: "lg",
              submitLabel: <>{action.label}{action.iconAfter}</>,
              submitVariant: action.variant || "default",
            },
          }}
          successMessage={successMessage}
          onSubmit={onSubmit}
          onSuccess={(data) => {
            resetUpload();
            onSuccess?.(data);
          }}
          onError={onError}
          uploadTokens={uploadTokens}
          uploadProgress={uploadProgress}
          onFileUpload={uploadFiles}
          onFileRemove={removeFile}
          isUploading={isUploading}
        />
        {helperText &&
          (typeof helperText === "string" ? (
            <p className={cn("text-sm mt-2 text-center")}>{helperText}</p>
          ) : (
            helperText
          ))}
      </>
    );
  }, [
    formSlot,
    formFields,
    formConfig,
    buttonAction,
    uploadTokens,
    uploadProgress,
    uploadFiles,
    removeFile,
    isUploading,
    successMessage,
    onSubmit,
    onSuccess,
    onError,
    helperText,
    resetUpload,
  ]);

  return (
    <Section
      background={background}
      spacing={spacing}
      pattern={pattern}
      patternOpacity={patternOpacity}
      patternClassName={patternClassName}
      className={className}
      containerClassName={containerClassName}
    >
      <div
        className={cn(
          "container flex flex-col items-center justify-center text-center",
          containerClassName,
        )}
      >
        {heading &&
          (typeof heading === "string" ? (
            <h1
              className={cn(
                "max-w-3xl text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl text-pretty",
                headingClassName,
              )}
            >
              {heading}
            </h1>
          ) : (
            heading
          ))}
        {description &&
          (typeof description === "string" ? (
            <p
              className={cn(
                "mt-6 max-w-full md:max-w-lg text-lg md:text-xl text-balance",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : (
            description
          ))}
        <div
          className={cn(
            "mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row",
            formClassName,
          )}
        >
          {renderForm}
        </div>
        {disclaimer &&
          (typeof disclaimer === "string" ? (
            <p className={cn("mt-4 text-sm", disclaimerClassName)}>
              {disclaimer}
            </p>
          ) : (
            disclaimer
          ))}
        {(statsSlot || (stats && stats.length > 0)) && (
          <div
            className={cn(
              "mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12",
              statsClassName,
            )}
          >
            {renderStats}
          </div>
        )}
      </div>
    </Section>
  );
}
