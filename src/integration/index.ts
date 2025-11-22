/**
 * @page-speed/forms - Platform Integration
 *
 * Integration utilities for connecting forms with the DashTrack platform.
 * Includes serializers for Rails API and adapters for opensite-blocks.
 *
 * @example
 * ```tsx
 * import { serializeForRails, deserializeErrors } from "@page-speed/forms/integration";
 *
 * // Serialize form data for Rails API
 * const serialized = serializeForRails(formValues, {
 *   apiKey: "key_123",
 *   contactCategoryToken: "cat_xyz",
 *   locationId: "loc_456",
 * });
 *
 * // Submit to Rails API
 * const response = await fetch("/contacts", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify(serialized),
 * });
 *
 * // Handle errors
 * if (!response.ok) {
 *   const railsErrors = await response.json();
 *   const formErrors = deserializeErrors(railsErrors);
 *   form.setErrors(formErrors);
 * }
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/integration
 */

/**
 * @page-speed/forms - Platform Integration
 *
 * Generic integration utilities for connecting forms with various platforms.
 * This module provides framework-agnostic patterns that can be adapted to
 * any backend API or rendering system.
 *
 * ## Rails API Integration
 *
 * Serializers for Rails-style JSON APIs with Active Record error format:
 *
 * @example
 * ```tsx
 * import { serializeForRails, deserializeErrors } from "@page-speed/forms/integration";
 *
 * // Serialize form data for Rails API
 * const serialized = serializeForRails(formValues, {
 *   apiKey: "key_123",
 *   contactCategoryToken: "cat_xyz",
 *   locationId: "loc_456",
 * });
 *
 * // Submit to Rails API
 * const response = await fetch("/contacts", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify(serialized),
 * });
 *
 * // Handle errors
 * if (!response.ok) {
 *   const railsErrors = await response.json();
 *   const formErrors = deserializeErrors(railsErrors);
 *   form.setErrors(formErrors);
 * }
 * ```
 *
 * ## Visual Builder Integration
 *
 * Generic adapter pattern for integrating with block-based visual builders:
 *
 * @example
 * ```tsx
 * import { TextInput } from "@page-speed/forms/inputs";
 * import { createChaiBlockAdapter } from "@page-speed/forms/integration";
 *
 * // Create a block-compatible wrapper
 * const TextInputBlock = createChaiBlockAdapter(TextInput, {
 *   transformProps: (blockProps, block) => ({
 *     ...blockProps,
 *     label: block.content,
 *     className: block.styles,
 *   }),
 * });
 *
 * // Register with your builder system
 * registerBlock("TextInput", TextInputBlock);
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/integration
 */

export {
  serializeForRails,
  deserializeErrors,
  type RailsApiConfig,
  type SerializedFormData,
  type RailsErrorResponse,
  type FormErrors,
} from "./ContactFormSerializer";

export {
  createChaiBlockAdapter,
  createChaiBlockAdapters,
  standardInputTransformer,
  type ChaiBlock,
  type ChaiBlockAdapterOptions,
  type AdaptedComponentProps,
} from "./ChaiBlockAdapter";
