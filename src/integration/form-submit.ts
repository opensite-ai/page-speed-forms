import type {
  FormLayoutSettings,
  FormSubmissionConfig,
} from "../core/types";
import {
  deserializeErrors,
  serializeForRails,
  type FormErrors,
  type RailsApiConfig,
  type RailsErrorResponse,
} from "./ContactFormSerializer";

export type PageSpeedFormMethod = "post" | "get" | "put" | "patch";
export type PageSpeedFormSubmissionFormat = "json" | "rails";

export interface PageSpeedFormSubmissionResult {
  formData: Record<string, any>;
  responseData: unknown;
}

/**
 * PageSpeed-specific extension of the core FormSubmissionConfig.
 * Inherits behavior, customComponent, and newFormSubmissionAction from the
 * base type and adds integration-layer callbacks and redirect support.
 */
export interface PageSpeedFormSubmissionConfig extends FormSubmissionConfig {
  /**
   * Optional callback triggered on successful submission.
   */
  handleFormSubmission?: (
    result: PageSpeedFormSubmissionResult,
  ) => void | Promise<void>;

  /**
   * Redirect destination used when behavior is "redirect".
   */
  redirectUrl?: string;
}

export interface PageSpeedFormConfig {
  /**
   * API endpoint used for submission (also applied to form action).
   */
  endpoint?: string;
  /**
   * HTTP method for submission.
   * @default "post"
   */
  method?: PageSpeedFormMethod;
  /**
   * Submission format.
   * Defaults to "rails" when apiKey is present, otherwise "json".
   */
  format?: PageSpeedFormSubmissionFormat;
  /**
   * Additional headers for the submission request.
   */
  headers?: Record<string, string>;
  /**
   * Static values merged into the payload (e.g. subject, content).
   */
  values?: Record<string, unknown>;
  /**
   * Rails API key (required for rails format).
   */
  apiKey?: string;
  /**
   * Rails contact category token.
   */
  contactCategoryToken?: string;
  /**
   * Rails location ID.
   */
  locationId?: string;
  /**
   * Rails website ID.
   */
  websiteId?: string;
  /**
   * Rails website form assignment ID.
   */
  websiteFormAssignmentId?: string;
  /**
   * Rails visitor IP address override.
   */
  visitorIpAddress?: string;
  /**
   * Reset form values after a successful submission.
   * @default true
   */
  resetOnSuccess?: boolean;
  /**
   * Optional post-submission behavior configuration.
   */
  submissionConfig?: PageSpeedFormSubmissionConfig;

  /**
   * Optional layout and presentation settings.
   * Provides a typed home for layout props (formLayout, buttonGroupSize, etc.)
   * so consumers don't need an `as any` cast when passing them alongside API config.
   */
  formLayoutSettings?: FormLayoutSettings;
}

export class PageSpeedFormSubmissionError extends Error {
  formErrors?: FormErrors;
  status?: number;

  constructor(
    message: string,
    options: { formErrors?: FormErrors; status?: number } = {},
  ) {
    super(message);
    this.name = "PageSpeedFormSubmissionError";
    this.formErrors = options.formErrors;
    this.status = options.status;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

function buildUrlWithParams(
  endpoint: string,
  values: Record<string, any>,
): string {
  const base =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL(endpoint, base);

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          url.searchParams.append(key, String(item));
        }
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function normalizeMethod(method?: PageSpeedFormMethod): string {
  return (method || "post").toUpperCase();
}

function resolveFormat(
  config?: PageSpeedFormConfig,
): PageSpeedFormSubmissionFormat {
  if (config?.format) return config.format;
  return config?.apiKey ? "rails" : "json";
}

function mergeValues(
  values: Record<string, any>,
  config?: PageSpeedFormConfig,
): Record<string, any> {
  return {
    ...(config?.values ?? {}),
    ...values,
  };
}

export async function submitPageSpeedForm(
  values: Record<string, any>,
  config?: PageSpeedFormConfig,
): Promise<unknown> {
  if (!config?.endpoint) {
    return null;
  }

  const payload = mergeValues(values, config);
  const method = normalizeMethod(config.method);
  const format = resolveFormat(config);
  const headers: Record<string, string> = { ...(config.headers ?? {}) };

  if (format === "rails") {
    if (!config.apiKey) {
      throw new PageSpeedFormSubmissionError(
        "Missing apiKey for Rails form submission.",
      );
    }

    const railsConfig: RailsApiConfig = {
      apiKey: config.apiKey,
      contactCategoryToken: config.contactCategoryToken,
      locationId: config.locationId,
      websiteId: config.websiteId,
      websiteFormAssignmentId: config.websiteFormAssignmentId,
      visitorIpAddress: config.visitorIpAddress,
    };

    const serialized = serializeForRails(payload, railsConfig);

    if (serialized.contact.contact_form_upload_tokens) {
      serialized.contact.contact_form_upload_tokens = (
        serialized.contact.contact_form_upload_tokens as string[]
      ).map((token) => token.replace(/^upload_/, ""));
    }

    headers["Content-Type"] ??= "application/json";

    const response = await fetch(config.endpoint, {
      method,
      headers,
      body: JSON.stringify(serialized),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || (data && data.errors)) {
      const errorResponse: RailsErrorResponse = {
        errors: data?.errors ?? { base: ["Form submission failed"] },
        status: data?.status ?? response.status,
      };
      const formErrors = deserializeErrors(errorResponse);
      throw new PageSpeedFormSubmissionError("Form submission failed.", {
        formErrors,
        status: errorResponse.status,
      });
    }

    return data;
  }

  if (method === "GET") {
    const url = buildUrlWithParams(config.endpoint, payload);
    const response = await fetch(url, { method, headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new PageSpeedFormSubmissionError(
        data?.message || "Form submission failed.",
        { status: response.status },
      );
    }

    return data;
  }

  headers["Content-Type"] ??= "application/json";

  const response = await fetch(config.endpoint, {
    method,
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new PageSpeedFormSubmissionError(
      data?.message || "Form submission failed.",
      { status: response.status },
    );
  }

  return data;
}
