# Standard Form Example

## Implementation in UI Library

```tsx
"use client";

import * as React from "react";
import { useMemo } from "react";
import { Form } from "@page-speed/forms";
import {
  DynamicFormField,
  getColumnSpanClass,
  useContactForm,
  useFileUpload,
  type FormFieldConfig,
  type PageSpeedFormConfig,
} from "@page-speed/forms/integration";
import { cn } from "../../../lib/utils";
import { Pressable } from "../../../lib/Pressable";
import { Card, CardContent } from "../../ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Section } from "../../ui/section";
import type { PatternName } from "../../ui/pattern-background";
import type {
  ActionConfig,
  SectionBackground,
  SectionSpacing,
} from "../../../src/types";

export interface FaqItem {
  id: string;
  question: React.ReactNode;
  answer: React.ReactNode;
}

export interface ContactFaqProps {
  /**
   * Main heading text
   */
  heading?: React.ReactNode;
  /**
   * Description text below heading
   */
  description?: React.ReactNode;
  /**
   * Form section heading
   */
  formHeading?: React.ReactNode;
  /**
   * Submit button text
   */
  buttonText?: string;
  /**
   * Icon to display in submit button
   */
  buttonIcon?: React.ReactNode;
  /**
   * Array of action configurations for custom buttons
   */
  actions?: ActionConfig[];
  /**
   * Custom slot for rendering actions (overrides actions array)
   */
  actionsSlot?: React.ReactNode;
  /**
   * Array of FAQ items to display alongside the contact form
   */
  items?: FaqItem[];
  /**
   * Custom slot for rendering FAQ items (overrides items array)
   */
  itemsSlot?: React.ReactNode;
  /**
   * Heading for the FAQ section
   */
  faqHeading?: React.ReactNode;
  /**
   * Array of form field configurations
   * If not provided, defaults to: name, email, subject, message
   */
  formFields?: FormFieldConfig[];
  /**
   * Success message to display after form submission
   * @default "Thank you! Your message has been sent successfully."
   */
  successMessage?: React.ReactNode;
  /**
   * Additional CSS classes for the section
   */
  className?: string;
  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;
  /**
   * Additional CSS classes for the header
   */
  headerClassName?: string;
  /**
   * Additional CSS classes for the heading
   */
  headingClassName?: string;
  /**
   * Additional CSS classes for the description
   */
  descriptionClassName?: string;
  /**
   * Additional CSS classes for the card
   */
  cardClassName?: string;
  /**
   * Additional CSS classes for the card content
   */
  cardContentClassName?: string;
  /**
   * Additional CSS classes for the form heading
   */
  formHeadingClassName?: string;
  /**
   * Additional CSS classes for the form
   */
  formClassName?: string;
  /**
   * Additional CSS classes for the submit button
   */
  submitClassName?: string;
  /**
   * Additional CSS classes for the FAQ heading
   */
  faqHeadingClassName?: string;
  /**
   * Additional CSS classes for the FAQ container
   */
  faqContainerClassName?: string;
  /**
   * Additional CSS classes for the accordion
   */
  accordionClassName?: string;
  /**
   * Additional CSS classes for accordion items
   */
  accordionItemClassName?: string;
  /**
   * Additional CSS classes for accordion triggers
   */
  accordionTriggerClassName?: string;
  /**
   * Additional CSS classes for accordion content
   */
  accordionContentClassName?: string;
  /**
   * Additional CSS classes for the two-column grid wrapper
   */
  gridClassName?: string;
  /**
   * Additional CSS classes for the success message
   */
  successMessageClassName?: string;
  /**
   * Additional CSS classes for the error message
   */
  errorMessageClassName?: string;
  /**
   * Background style for the section
   */
  background?: SectionBackground;
  /**
   * Vertical spacing for the section
   */
  spacing?: SectionSpacing;
  /**
   * Optional background pattern name or URL
   */
  pattern?: PatternName | undefined;
  /**
   * Pattern overlay opacity (0-1)
   */
  patternOpacity?: number;
  /**
   * Form configuration for PageSpeed forms
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
}

// Default form fields
const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  {
    name: "name",
    type: "text",
    label: "Name",
    placeholder: "Full Name",
    required: true,
    columnSpan: 6,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "your@email.com",
    required: true,
    columnSpan: 6,
  },
  {
    name: "subject",
    type: "text",
    label: "Subject",
    placeholder: "What is this regarding?",
    required: true,
    columnSpan: 12,
  },
  {
    name: "message",
    type: "textarea",
    label: "Message",
    placeholder: "Your message...",
    required: true,
    rows: 4,
    columnSpan: 12,
  },
];

/**
 * ContactFaq - FAQ contact form with flexible field configuration
 */
export function ContactFaq({
  heading,
  description,
  formHeading,
  buttonText = "Submit",
  buttonIcon,
  actions,
  actionsSlot,
  items,
  itemsSlot,
  faqHeading,
  formFields = DEFAULT_FORM_FIELDS,
  successMessage = "Thank you! Your message has been sent successfully.",
  className,
  containerClassName = "px-6 sm:px-6 md:px-8 lg:px-8",
  headerClassName,
  headingClassName,
  descriptionClassName,
  cardClassName,
  cardContentClassName,
  formHeadingClassName,
  formClassName,
  submitClassName,
  faqHeadingClassName,
  faqContainerClassName,
  accordionClassName,
  accordionItemClassName,
  accordionTriggerClassName,
  accordionContentClassName,
  gridClassName,
  successMessageClassName,
  errorMessageClassName,
  background,
  spacing = "py-8 md:py-32",
  pattern,
  patternOpacity,
  formConfig,
  onSubmit,
  onSuccess,
  onError,
}: ContactFaqProps): React.JSX.Element {
  // File upload hook
  const {
    uploadTokens,
    uploadProgress,
    isUploading,
    uploadFiles,
    removeFile,
    resetUpload,
  } = useFileUpload({ onError });

  // Contact form hook with file upload integration
  const { form, submissionError, formMethod, resetSubmissionState } =
    useContactForm({
      formFields,
      formConfig,
      onSubmit,
      onSuccess: (data) => {
        resetUpload();
        onSuccess?.(data);
      },
      onError,
      resetOnSuccess: formConfig?.resetOnSuccess !== false,
      uploadTokens,
    });

  const actionsContent = useMemo(() => {
    if (actionsSlot) return actionsSlot;
    if (actions && actions.length > 0) {
      return actions.map((action, index) => {
        const {
          label,
          icon,
          iconAfter,
          children,
          className: actionClassName,
          ...pressableProps
        } = action;
        return (
          <Pressable
            key={index}
            asButton
            className={actionClassName}
            {...pressableProps}
          >
            {children ?? (
              <>
                {icon}
                {label}
                {iconAfter}
              </>
            )}
          </Pressable>
        );
      });
    }
    return null;
  }, [actionsSlot, actions]);

  const hasFaqItems = itemsSlot || (items && items.length > 0);

  const faqContent = useMemo(() => {
    if (itemsSlot) return itemsSlot;
    if (!items || items.length === 0) return null;

    return (
      <Accordion type="single" collapsible className={accordionClassName}>
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className={accordionItemClassName}
          >
            <AccordionTrigger
              className={cn(
                "font-semibold hover:no-underline",
                accordionTriggerClassName,
              )}
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent className={cn(accordionContentClassName)}>
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }, [
    itemsSlot,
    items,
    accordionClassName,
    accordionItemClassName,
    accordionTriggerClassName,
    accordionContentClassName,
  ]);

  return (
    <Section
      background={background}
      spacing={spacing}
      pattern={pattern}
      patternOpacity={patternOpacity}
      className={className}
      containerClassName={containerClassName}
    >
      <div className="relative">
        <div
          className={cn(
            "mb-10 md:mb-16 text-left max-w-full md:max-w-md",
            headerClassName,
          )}
        >
          {heading &&
            (typeof heading === "string" ? (
              <h2
                className={cn(
                  "mb-3 text-3xl md:text-5xl font-bold tracking-tight text-balance",
                  headingClassName,
                )}
              >
                {heading}
              </h2>
            ) : (
              heading
            ))}
          {description &&
            (typeof description === "string" ? (
              <p
                className={cn(
                  "leading-relaxed text-balance",
                  descriptionClassName,
                )}
              >
                {description}
              </p>
            ) : (
              description
            ))}
        </div>

        <div
          className={cn(
            "w-full mx-auto grid gap-10 grid-cols-1",
            hasFaqItems ? "lg:grid-cols-2" : "lg:grid-cols-1",
            gridClassName,
          )}
        >
          {/* Contact Form Column */}
          <Card className={cn("w-full pt-0 pb-0", cardClassName)}>
            <CardContent className={cn("p-6 lg:p-8", cardContentClassName)}>
              {formHeading &&
                (typeof formHeading === "string" ? (
                  <h3
                    className={cn(
                      "mb-6 text-xl font-semibold",
                      formHeadingClassName,
                    )}
                  >
                    {formHeading}
                  </h3>
                ) : (
                  <div className={formHeadingClassName}>{formHeading}</div>
                ))}

              <Form
                form={form}
                notificationConfig={{
                  submissionError,
                  successMessage,
                }}
                styleConfig={{
                  formClassName: cn("space-y-6", formClassName),
                  successMessageClassName,
                  errorMessageClassName,
                }}
                formConfig={{
                  endpoint: formConfig?.endpoint,
                  method: formMethod,
                  submissionConfig: formConfig?.submissionConfig,
                }}
                onNewSubmission={() => {
                  resetUpload();
                  resetSubmissionState();
                }}
              >
                <div className="grid grid-cols-12 gap-6">
                  {formFields.map((field) => (
                    <div
                      key={field.name}
                      className={getColumnSpanClass(field.columnSpan)}
                    >
                      <DynamicFormField
                        field={field}
                        uploadProgress={uploadProgress}
                        onFileUpload={uploadFiles}
                        onFileRemove={removeFile}
                        isUploading={isUploading}
                      />
                    </div>
                  ))}
                </div>

                {actionsSlot || (actions && actions.length > 0) ? (
                  actionsContent
                ) : (
                  <Pressable
                    componentType="button"
                    type="submit"
                    className={cn("w-full", submitClassName)}
                    size="lg"
                    asButton
                    disabled={form.isSubmitting}
                  >
                    {buttonIcon}
                    {buttonText}
                  </Pressable>
                )}
              </Form>
            </CardContent>
          </Card>

          {/* FAQ Column */}
          {hasFaqItems && (
            <div className={cn("relative", faqContainerClassName)}>
              {faqHeading &&
                (typeof faqHeading === "string" ? (
                  <h3
                    className={cn(
                      "mb-6 text-xl font-semibold",
                      faqHeadingClassName,
                    )}
                  >
                    {faqHeading}
                  </h3>
                ) : (
                  <div className={faqHeadingClassName}>{faqHeading}</div>
                ))}
              {faqContent}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
```

## Called by Application Like This

```tsx
"use client";

import { ContactFaq } from "@opensite/ui/blocks/contact/contact-faq";
import { demoFormConfig } from "@/lib/form-demo-data";
import type { FormFieldConfig } from "@opensite/ui";

const formFields: FormFieldConfig[] = [
  {
    name: "name",
    type: "text",
    label: "Full Name",
    placeholder: "Full Name",
    required: true,
    columnSpan: 6,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "your@email.com",
    required: true,
    columnSpan: 6,
  },
  {
    name: "subject",
    type: "text",
    label: "Subject",
    placeholder: "What is this regarding?",
    required: true,
    columnSpan: 12,
  },
  {
    name: "content",
    type: "textarea",
    label: "Message",
    placeholder: "Please describe your question in detail...",
    required: true,
    rows: 5,
    columnSpan: 12,
  },
];

export default function Demo() {
  return (
    <ContactFaq
      heading="Have Questions?"
      description="Can't find what you're looking for in our FAQ? Send us a message and our team will get back to you within 24 hours."
      formHeading="Send Us a Message"
      buttonText="Submit Question"
      formFields={formFields}
      formConfig={demoFormConfig}
      successMessage="Thank you for reaching out! We'll get back to you within 24 hours."
      background="white"
      pattern="dashedGridFadeTop"
      patternOpacity={0.9}
      faqHeading="Frequently Asked Questions"
      items={[
        {
          id: "billing-cycle",
          question: "When will I be charged?",
          answer:
            "Billing occurs on the same day each month or year, depending on your plan. You'll receive an invoice via email 3 days before each billing cycle.",
        },
        {
          id: "refunds",
          question: "What is your refund policy?",
          answer:
            "We offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days of your initial purchase for a full refund.",
        },
        {
          id: "upgrades",
          question: "How do plan upgrades work?",
          answer:
            "Upgrades take effect immediately. You'll be charged a prorated amount for the remainder of your billing cycle at the new plan rate.",
        },
        {
          id: "downgrade",
          question: "Can I downgrade my plan?",
          answer:
            "Yes, downgrades take effect at the end of your current billing cycle. You'll continue to have access to your current plan features until then.",
        },
      ]}
    />
  );
}
```
