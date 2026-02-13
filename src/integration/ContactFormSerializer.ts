/**
 * @page-speed/forms - Rails API Serializer
 *
 * Serializes form data for the DashTrack ContactsController API.
 * Handles field name conversion (camelCase → snake_case), custom fields separation,
 * and upload token arrays.
 *
 * @see https://github.com/opensite-ai/page-speed-forms
 */

/**
 * Standard fields recognized by the Rails ContactsController API.
 * These are serialized to snake_case and sent in the contact object.
 */
const STANDARD_FIELDS = [
  "content",
  "email",
  "firstName",
  "lastName",
  "locationId",
  "phone",
  "subject",
  "redemptionStatus",
  "birthday",
  "city",
  "state",
  "websiteFormAssignmentId",
  "websiteId",
  "acceptsSmsMarketing",
  "acceptsEmailMarketing",
  "visitorIpAddress",
] as const;

/**
 * Configuration parameters for Rails API submission.
 */
export interface RailsApiConfig {
  /**
   * API key for authentication.
   * Sent as top-level parameter: api_key
   */
  apiKey: string;

  /**
   * Contact category token for categorization.
   * Sent as top-level parameter: contact_category_token
   */
  contactCategoryToken?: string;

  /**
   * Location ID for multi-location organizations.
   * Sent as top-level parameter: location_id
   */
  locationId?: string;

  /**
   * Website ID for tracking form submissions.
   * Sent within contact object: website_id
   */
  websiteId?: string;

  /**
   * Website form assignment ID for form tracking.
   * Sent within contact object: website_form_assignment_id
   */
  websiteFormAssignmentId?: string;

  /**
   * Visitor IP address. If not provided, will be auto-detected on server.
   * Sent within contact object: visitor_ip_address
   */
  visitorIpAddress?: string;
}

/**
 * Serialized form data ready for Rails API submission.
 */
export interface SerializedFormData {
  /**
   * Top-level API key parameter.
   */
  api_key: string;

  /**
   * Top-level contact category token (optional).
   */
  contact_category_token?: string;

  /**
   * Top-level location ID (optional).
   */
  location_id?: string;

  /**
   * Contact object with standard fields and metadata.
   */
  contact: {
    /**
     * Standard contact fields in snake_case.
     */
    [key: string]: unknown;

    /**
     * Custom fields that don't match standard schema.
     * Stored as separate hash in Rails.
     */
    custom_fields?: Record<string, unknown>;

    /**
     * Array of upload tokens from file uploads.
     * These reference ContactFormUpload records in Rails.
     */
    contact_form_upload_tokens?: string[];
  };
}

/**
 * Form values from the form library (camelCase keys).
 */
export type FormValues = Record<string, unknown>;

/**
 * Convert camelCase to snake_case.
 *
 * @example
 * ```ts
 * camelToSnake("firstName") // "first_name"
 * camelToSnake("acceptsSmsMarketing") // "accepts_sms_marketing"
 * ```
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Check if a field name is a standard Rails contact field.
 */
function isStandardField(fieldName: string): boolean {
  return STANDARD_FIELDS.includes(
    fieldName as (typeof STANDARD_FIELDS)[number],
  );
}

/**
 * Extract upload tokens from form values.
 * Handles both string tokens and arrays of tokens.
 */
function extractUploadTokens(values: FormValues): string[] {
  const tokens: string[] = [];

  for (const value of Object.values(values)) {
    if (typeof value === "string" && value.startsWith("upload_")) {
      tokens.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.startsWith("upload_")) {
          tokens.push(item);
        }
      }
    }
  }

  return tokens;
}

/**
 * Format date/time values for Rails API.
 * Rails expects ISO 8601 format.
 */
function formatDateForRails(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    // Attempt to parse and reformat to ensure valid ISO 8601
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return undefined;
}

/**
 * Serialize form values for Rails ContactsController API.
 *
 * This function:
 * 1. Converts camelCase field names to snake_case
 * 2. Separates standard fields from custom fields
 * 3. Extracts upload tokens into contact_form_upload_tokens array
 * 4. Formats dates to ISO 8601
 * 5. Includes API configuration parameters
 *
 * @param values - Form values from useForm hook (camelCase keys)
 * @param config - Rails API configuration (apiKey, locationId, etc.)
 * @returns Serialized data ready for POST to /contacts
 *
 * @example
 * ```ts
 * const serialized = serializeForRails(
 *   {
 *     firstName: "John",
 *     lastName: "Doe",
 *     email: "john@example.com",
 *     phone: "555-1234",
 *     companySize: "50-100", // Custom field
 *     resumeToken: "upload_abc123",
 *   },
 *   {
 *     apiKey: "key_123",
 *     contactCategoryToken: "cat_xyz",
 *     locationId: "loc_456",
 *   }
 * );
 *
 * // Result:
 * // {
 * //   api_key: "key_123",
 * //   contact_category_token: "cat_xyz",
 * //   location_id: "loc_456",
 * //   contact: {
 * //     first_name: "John",
 * //     last_name: "Doe",
 * //     email: "john@example.com",
 * //     phone: "555-1234",
 * //     custom_fields: {
 * //       company_size: "50-100"
 * //     },
 * //     contact_form_upload_tokens: ["upload_abc123"]
 * //   }
 * // }
 * ```
 */
export function serializeForRails(
  values: FormValues,
  config: RailsApiConfig,
): SerializedFormData {
  const standardFields: Record<string, unknown> = {};
  const customFields: Record<string, unknown> = {};

  // Extract upload tokens
  const uploadTokens = extractUploadTokens(values);

  // Separate standard and custom fields
  for (const [key, value] of Object.entries(values)) {
    // Skip upload token fields - they're handled separately
    if (typeof value === "string" && value.startsWith("upload_")) {
      continue;
    }
    if (
      Array.isArray(value) &&
      value.every(
        (item) => typeof item === "string" && item.startsWith("upload_"),
      )
    ) {
      continue;
    }

    const snakeKey = camelToSnake(key);

    if (isStandardField(key)) {
      // Format dates for birthday field
      if (key === "birthday") {
        const formatted = formatDateForRails(value);
        if (formatted) {
          standardFields[snakeKey] = formatted;
        }
      } else {
        // Handle array values for standard fields
        // Standard fields expect scalar values (strings), but some field types
        // like checkbox-group produce arrays. Convert arrays to comma-separated strings.
        if (Array.isArray(value)) {
          standardFields[snakeKey] = value.join(", ");
        } else {
          standardFields[snakeKey] = value;
        }
      }
    } else {
      // Custom fields
      customFields[snakeKey] = value;
    }
  }

  // Add config fields to standard fields if provided
  if (config.websiteId !== undefined) {
    standardFields.website_id = config.websiteId;
  }
  if (config.websiteFormAssignmentId !== undefined) {
    standardFields.website_form_assignment_id = config.websiteFormAssignmentId;
  }
  if (config.visitorIpAddress !== undefined) {
    standardFields.visitor_ip_address = config.visitorIpAddress;
  }

  // Build contact object
  const contact: SerializedFormData["contact"] = {
    ...standardFields,
  };

  // Add custom fields if any
  if (Object.keys(customFields).length > 0) {
    contact.custom_fields = customFields;
  }

  // Add upload tokens if any
  if (uploadTokens.length > 0) {
    contact.contact_form_upload_tokens = uploadTokens;
  }

  // Build final serialized data
  const serialized: SerializedFormData = {
    api_key: config.apiKey,
    contact,
  };

  // Add optional top-level parameters
  if (config.contactCategoryToken !== undefined) {
    serialized.contact_category_token = config.contactCategoryToken;
  }
  if (config.locationId !== undefined) {
    serialized.location_id = config.locationId;
  }

  return serialized;
}

/**
 * Rails API error response format.
 */
export interface RailsErrorResponse {
  errors: {
    [field: string]: string[];
  };
  status: number;
}

/**
 * Form error format used by @page-speed/forms.
 */
export type FormErrors = Record<string, string | undefined>;

/**
 * Convert snake_case to camelCase.
 *
 * @example
 * ```ts
 * snakeToCamel("first_name") // "firstName"
 * snakeToCamel("accepts_sms_marketing") // "acceptsSmsMarketing"
 * ```
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Deserialize Rails API errors to form error format.
 *
 * Converts Rails error format to the format expected by @page-speed/forms:
 * - Maps snake_case field names to camelCase
 * - Flattens error arrays to single error string (first error)
 * - Handles custom_fields errors by mapping back to original field names
 * - Extracts base errors to form-level errors
 *
 * @param railsErrors - Error response from Rails API
 * @returns Form errors object (camelCase keys)
 *
 * @example
 * ```ts
 * const formErrors = deserializeErrors({
 *   errors: {
 *     first_name: ["can't be blank", "is too short"],
 *     email: ["is invalid"],
 *     custom_fields: {
 *       company_size: ["is required"]
 *     },
 *     base: ["Something went wrong"]
 *   },
 *   status: 422
 * });
 *
 * // Result:
 * // {
 * //   firstName: "can't be blank",
 * //   email: "is invalid",
 * //   companySize: "is required",
 * //   _form: "Something went wrong"
 * // }
 * ```
 */
export function deserializeErrors(railsErrors: RailsErrorResponse): FormErrors {
  const formErrors: FormErrors = {};

  for (const [field, messages] of Object.entries(railsErrors.errors)) {
    // Handle base errors (form-level errors)
    if (field === "base") {
      formErrors._form = Array.isArray(messages) ? messages[0] : messages;
      continue;
    }

    // Handle custom_fields errors
    if (field === "custom_fields" && typeof messages === "object") {
      for (const [customField, customMessages] of Object.entries(messages)) {
        const camelField = snakeToCamel(customField);
        const errorMessage = Array.isArray(customMessages)
          ? customMessages[0]
          : customMessages;
        formErrors[camelField] = errorMessage;
      }
      continue;
    }

    // Handle standard field errors
    const camelField = snakeToCamel(field);
    const errorMessage = Array.isArray(messages) ? messages[0] : messages;
    formErrors[camelField] = errorMessage;
  }

  return formErrors;
}
