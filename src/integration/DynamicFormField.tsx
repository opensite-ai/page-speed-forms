"use client";

import * as React from "react";
import { Field } from "../core/Field";
import {
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
  FileInput,
  MultiSelect,
  Radio,
  Select,
  TextArea,
  TextInput,
  TimePicker,
} from "../inputs";
import { cn } from "../lib/utils";
import type { FormFieldConfig } from "./form-field-types";

export interface DynamicFormFieldProps {
  field: FormFieldConfig;
  className?: string;
  uploadProgress?: { [fileName: string]: number };
  onFileUpload?: (files: File[]) => Promise<void>;
  onFileRemove?: (file: File, index: number) => void;
  isUploading?: boolean;
}

/**
 * Dynamic renderer for form field schema configuration.
 */
export function DynamicFormField({
  field,
  className,
  uploadProgress = {},
  onFileUpload,
  onFileRemove,
  isUploading = false,
}: DynamicFormFieldProps): React.JSX.Element {
  const fieldId = field.name;
  const usesGroupLegend =
    field.type === "radio" || field.type === "checkbox-group";
  const usesInlineCheckboxLabel = field.type === "checkbox";
  const shouldRenderFieldLabel = !usesGroupLegend && !usesInlineCheckboxLabel;

  return (
    <Field
      name={field.name}
      label={shouldRenderFieldLabel ? field.label : undefined}
      description={shouldRenderFieldLabel ? field.description : undefined}
      required={field.required}
      className={cn("space-y-2", className)}
    >
      {({ field: formField, meta }) => (
        <div>
          {(field.type === "text" ||
            field.type === "email" ||
            field.type === "tel" ||
            field.type === "search" ||
            field.type === "password" ||
            field.type === "url") && (
            <TextInput
              {...formField}
              id={fieldId}
              type={field.type}
              placeholder={field.placeholder}
              error={meta.touched && !!meta.error}
              disabled={field.disabled}
              aria-label={field.label}
            />
          )}

          {field.type === "number" && (
            <TextInput
              {...formField}
              id={fieldId}
              type="text"
              placeholder={field.placeholder}
              error={meta.touched && !!meta.error}
              disabled={field.disabled}
              aria-label={field.label}
            />
          )}

          {field.type === "textarea" && (
            <TextArea
              {...formField}
              id={fieldId}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              error={meta.touched && !!meta.error}
              disabled={field.disabled}
              aria-label={field.label}
            />
          )}

          {field.type === "select" && field.options && (
            <Select
              {...formField}
              id={fieldId}
              options={field.options}
              placeholder={
                field.placeholder || `Select ${field.label.toLowerCase()}`
              }
              error={meta.touched && !!meta.error}
              disabled={field.disabled}
              aria-label={field.label}
            />
          )}

          {field.type === "multi-select" && field.options && (
            <MultiSelect
              {...formField}
              id={fieldId}
              options={field.options}
              placeholder={
                field.placeholder || `Select ${field.label.toLowerCase()}`
              }
              error={meta.touched && !!meta.error}
              disabled={field.disabled}
              aria-label={field.label}
            />
          )}

          {field.type === "radio" && field.options && (
            <Radio
              {...formField}
              id={fieldId}
              options={field.options}
              label={field.label}
              description={field.description}
              required={field.required}
              disabled={field.disabled}
              layout={field.layout || "stacked"}
              error={meta.touched && !!meta.error}
              aria-label={field.label}
            />
          )}

          {field.type === "checkbox" && (
            <Checkbox
              {...formField}
              id={fieldId}
              value={formField.value === true || formField.value === "true"}
              onChange={(checked) => formField.onChange(checked)}
              label={field.label}
              description={field.description}
              disabled={field.disabled}
              required={field.required}
              error={meta.touched && !!meta.error}
              aria-label={field.label}
            />
          )}

          {field.type === "checkbox-group" && field.options && (
            <CheckboxGroup
              {...formField}
              id={fieldId}
              options={field.options}
              label={field.label}
              description={field.description}
              required={field.required}
              disabled={field.disabled}
              layout={field.layout || "stacked"}
              error={meta.touched && !!meta.error}
              aria-label={field.label}
            />
          )}

          {(field.type === "date-picker" || field.type === "date") && (
            <DatePicker
              {...formField}
              id={fieldId}
              placeholder={field.placeholder}
              error={meta.touched && !!meta.error}
              disabled={field.disabled}
              aria-label={field.label}
            />
          )}

          {field.type === "date-range" && (
            <DateRangePicker
              {...formField}
              id={fieldId}
              placeholder={field.placeholder}
              error={meta.touched && !!meta.error}
              disabled={field.disabled}
              aria-label={field.label}
            />
          )}

          {field.type === "time" && (
            <TimePicker
              {...formField}
              id={fieldId}
              placeholder={field.placeholder}
              error={meta.touched && !!meta.error}
              disabled={field.disabled}
              aria-label={field.label}
            />
          )}

          {field.type === "file" && (
            <FileInput
              {...formField}
              id={fieldId}
              accept={field.accept}
              maxSize={field.maxSize || 5 * 1024 * 1024}
              maxFiles={field.maxFiles || 1}
              multiple={field.multiple || false}
              placeholder={field.placeholder || "Choose file(s)..."}
              error={meta.touched && !!meta.error}
              disabled={field.disabled || isUploading}
              showProgress
              uploadProgress={uploadProgress}
              onChange={(files) => {
                formField.onChange(files);
                if (files.length > 0 && onFileUpload) {
                  onFileUpload(files);
                }
              }}
              onFileRemove={onFileRemove}
              aria-label={field.label}
            />
          )}
        </div>
      )}
    </Field>
  );
}
