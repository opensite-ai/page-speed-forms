# AGENTS.md – Instructions for AI coding agents working on `@page-speed/forms`

This file is for **AI coding agents and maintainers**. It encodes the non‑obvious rules, constraints, and workflows of this repo so automated changes stay fast, safe, and consistent.

When in doubt, favor: **(1) tests passing, (2) bundle size + performance, (3) framework-agnostic design**, in that order.

---

## 1. Quick mental model of this repo

- This is a **framework-agnostic React form library** optimized for ultra-high performance.
- Built on **@legendapp/state** for field-level reactivity (~1 re-render per change vs ~10 for traditional hooks).
- Uses **Valibot** for validation (95% smaller than Zod, 2-3x faster).
- Provides **tree-shakable exports** via multiple entry points (`/core`, `/inputs`, `/validation`, `/upload`, `/integration`).
- Includes **production-ready input components** (TextInput, Select, DatePicker, FileInput, RichTextEditor, etc.).
- Supports **Rails API integration** via serializers in `/integration`.
- Powers forms in **@opensite/ui blocks** and **ChaiBuilder** via adapter patterns.
- This is a **library**, not an app: avoid baking in app-specific behavior.

---

## 2. Golden rules (must follow)

1. **Preserve tree-shaking.**
   - Keep per-entry files in `src/*.ts` that re-export from subdirectories.
   - Avoid new "barrel" files that aggregate many exports.
   - Maintain `sideEffects: false` in `package.json`.

2. **Do not hand-edit the `exports` map in `package.json`.**
   - Entry points are defined in `tsup.config.ts`.
   - When adding a new public entrypoint, add it to `tsup.config.ts` and rebuild.

3. **Respect performance budgets.**
   - Bundle size is critical: use `pnpm size` to verify changes don't bloat the library.
   - Prefer existing dependencies (@legendapp/state, @opensite/hooks) over adding new ones.
   - Avoid heavy runtime dependencies or expensive work during render.

4. **Keep components framework-agnostic.**
   - No direct imports from Next.js, Rails, or DashTrack apps inside this library.
   - Integration-specific logic belongs in `/integration` or consuming apps.
   - Components should work in any React environment (Next.js, Remix, Vite, etc.).

5. **Components must remain unstyled.**
   - All components use **BEM class names** (`.text-input`, `.select-trigger`, `.field-label`) as styling hooks.
   - No inline styles or CSS-in-JS.
   - Consumers apply their own design system (Tailwind, CSS Modules, vanilla CSS, etc.).
   - See `docs/STYLES.md` for styling patterns.

6. **Form state stays JSON-serializable.**
   - Form values should be plain data (no functions, React nodes, or non-serializable values).
   - This enables design payloads, SSR, and Rails API integration.

7. **Use @legendapp/state for form state.**
   - All form state management uses `useObservable` from `@legendapp/state`.
   - This provides field-level reactivity and minimal re-renders.
   - Do NOT replace with useState/useReducer unless there's a compelling reason.

8. **Validation stays flexible.**
   - Support both synchronous and asynchronous validators.
   - Validators receive `(value, allValues)` for cross-field validation.
   - Valibot integration is optional (via `/validation/valibot`).
   - Built-in validation rules are tree-shakable (via `/validation/rules`).

9. **File uploads use two-phase process.**
   - Phase 1: Upload files immediately to temporary storage, get tokens.
   - Phase 2: Submit tokens with form data to associate uploads with records.
   - See `docs/FILE_UPLOADS.md` for complete patterns.

10. **Always run minimal checks for code changes.**
    - At least: `pnpm test` and `pnpm type-check` before considering work complete.
    - For export changes: `pnpm build` to verify build succeeds.
    - For bundle size concerns: `pnpm size` to check impact.

---

## 3. Key directories (for navigation)

- `src/core/*` – Core form hooks (`useForm`, `useField`) and components (`Form`, `Field`).
- `src/inputs/*` – Production-ready input components (TextInput, Select, DatePicker, FileInput, etc.).
- `src/validation/*` – Validation utilities, rules library, and Valibot adapter.
- `src/upload/*` – File upload hooks and utilities.
- `src/integration/*` – Rails API serializers and block adapters.
- `src/index.ts` – Main entry point (re-exports from `/core`).
- `docs/INTEGRATION_PATTERNS.md` – How to integrate with ChaiBuilder and opensite-blocks.
- `docs/FILE_UPLOADS.md` – Complete file upload guide with Rails API integration.
- `docs/STYLES.md` – Styling guide with BEM class reference and examples.

Before modifying code in any of these areas, skim the matching doc.

---

## 4. Working with core hooks

### 4.1 useForm hook (`src/core/useForm.ts`)

- Built on `@legendapp/state` for field-level reactivity.
- Uses `useObservable` to create reactive form state.
- Supports validation modes: `onChange`, `onBlur`, `onSubmit`.
- Provides `getFieldProps` and `getFieldMeta` for binding to inputs.
- Handles async validation with race condition prevention.
- Tracks field metadata using `@opensite/hooks/useMap`.

**Key patterns:**
- Always use `useObservable` for form state (not useState).
- Validation functions receive `(value, allValues)` for cross-field validation.
- Use `validationInProgress` ref to prevent race conditions in async validators.
- Field metadata (lastValidated, validationCount) tracked via `useMap`.

### 4.2 useField hook (`src/core/useField.ts`)

- Provides field-level API for individual form fields.
- Returns `{ field, meta, helpers }` for binding to inputs.
- Automatically connects to parent form context.
- Supports field-level validation.

**Key patterns:**
- Use `useFormContext` to access parent form state.
- Field props include `name`, `value`, `onChange`, `onBlur`.
- Meta includes `error`, `touched`, `isDirty`, `isValidating`.

---

## 5. Working with input components

### 5.1 Input component patterns (`src/inputs/*`)

All input components follow these patterns:

1. **Accept standard props:**
   - `name`, `value`, `onChange`, `onBlur`
   - `placeholder`, `disabled`, `required`, `error`
   - `className` for custom styling

2. **Use BEM class names:**
   - Base class: `.text-input`, `.select-trigger`, `.date-picker`
   - Modifiers: `.text-input--error`, `.select--disabled`
   - Elements: `.select-option`, `.date-picker-calendar`

3. **Provide accessible markup:**
   - Proper ARIA attributes (`aria-invalid`, `aria-describedby`, `aria-required`)
   - Keyboard navigation support
   - Screen reader friendly

4. **Handle controlled state:**
   - All inputs are controlled components
   - `value` prop controls the input
   - `onChange` receives the new value (not event)

### 5.2 Adding a new input component

1. Create component file in `src/inputs/YourInput.tsx`.
2. Define props interface extending `InputProps<T>`.
3. Use BEM class names for styling hooks.
4. Add ARIA attributes for accessibility.
5. Export from `src/inputs/index.ts`.
6. Add tests in `src/inputs/__tests__/YourInput.test.tsx`.
7. Document in README.md with examples.

---

## 6. Validation system

### 6.1 Validation architecture

- **Field validators:** Functions that validate a single field value.
- **Validation schema:** Object mapping field names to validators.
- **Validation modes:** `onChange`, `onBlur`, `onSubmit`.
- **Async validation:** Supported with debouncing and race condition prevention.
- **Cross-field validation:** Validators receive `allValues` parameter.

### 6.2 Validation rules library (`src/validation/rules.ts`)

- Tree-shakable validation rules (required, email, minLength, etc.).
- Each rule is a factory function that returns a validator.
- Rules support custom error messages.
- Use `compose` to combine multiple validators.

**Example:**
```typescript
import { required, email, compose } from '@page-speed/forms/validation/rules';

validationSchema: {
  email: compose(
    required({ message: 'Email is required' }),
    email({ message: 'Invalid email format' })
  )
}
```

### 6.3 Valibot integration (`src/validation/valibot.ts`)

- Optional integration with Valibot for schema-based validation.
- Use `createValibotSchema` to convert Valibot schema to ValidationSchema.
- Use `createFieldValidator` for single-field Valibot validation.
- Valibot is an optional dependency (tree-shakable).

---

## 7. File upload system

### 7.1 Two-phase upload process

1. **Phase 1: Immediate upload**
   - User selects files → upload immediately to temporary storage
   - Get upload tokens (e.g., `"upload_abc123"`)
   - Store tokens in component state (not form values)

2. **Phase 2: Form submission**
   - Include upload tokens in form submission
   - Backend associates uploads with record

### 7.2 FileInput component (`src/inputs/FileInput.tsx`)

- Supports drag-and-drop, file type/size validation, previews.
- Optional image cropping with aspect ratio control.
- Upload progress tracking via `uploadProgress` prop.
- Multiple file support via `multiple` prop.

**Key patterns:**
- Upload files immediately in `onChange` handler.
- Store tokens in separate state (not form values).
- Include tokens in form submission via `onSubmit`.
- See `docs/FILE_UPLOADS.md` for complete examples.

---

## 8. Rails API integration

### 8.1 ContactFormSerializer (`src/integration/ContactFormSerializer.ts`)

- Serializes form data for DashTrack ContactsController API.
- Converts camelCase → snake_case.
- Separates standard fields from custom fields.
- Extracts upload tokens into `contact_form_upload_tokens` array.

**Usage:**
```typescript
import { serializeForRails } from '@page-speed/forms/integration';

const serialized = serializeForRails(
  formValues,
  {
    apiKey: 'key_123',
    contactCategoryToken: 'cat_xyz',
    locationId: 'loc_456',
  }
);

await fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(serialized),
});
```

### 8.2 Error deserialization

- Use `deserializeErrors` to convert Rails errors to form errors.
- Converts snake_case → camelCase.
- Flattens error arrays to single error string.
- Handles custom_fields errors.

---

## 9. Integration patterns

### 9.1 ChaiBuilder integration

- Use `createBlockAdapter` from `/integration` to wrap components.
- Define block configs with visual properties.
- Register blocks with `registerChaiBlock`.
- See `docs/INTEGRATION_PATTERNS.md` for complete guide.

### 9.2 opensite-blocks integration

- Create custom `BlockRenderer` functions for each block type.
- Transform ChaiBlock props to component props at render time.
- Register renderers with `registerBlockRenderer`.
- See `docs/INTEGRATION_PATTERNS.md` for examples.

---

## 10. Build, exports & distribution

### 10.1 Build system (tsup)

- Build is handled by **tsup** (`tsup.config.ts`).
- Multiple entry points for tree-shaking:
  - `index` → `/core`
  - `core` → `/core`
  - `inputs` → `/inputs`
  - `validation` → `/validation`
  - `validation-valibot` → `/validation/valibot`
  - `validation-rules` → `/validation/rules`
  - `validation-utils` → `/validation/utils`
  - `upload` → `/upload`
  - `integration` → `/integration`

### 10.2 Adding a new entry point

1. Add entry to `tsup.config.ts`:
   ```typescript
   entry: {
     'your-entry': 'src/your-entry/index.ts',
   }
   ```

2. Add export to `package.json`:
   ```json
   "./your-entry": {
     "types": "./dist/your-entry.d.ts",
     "import": "./dist/your-entry.js",
     "require": "./dist/your-entry.cjs"
   }
   ```

3. Rebuild: `pnpm build`

---

## 11. Testing

### 11.1 Test setup

- Test framework: **Vitest** with **jsdom** environment.
- Test utilities: **@testing-library/react** for component testing.
- Setup file: `src/test-setup.ts`.
- Config: `vitest.config.ts`.

### 11.2 Test patterns

**Core hooks:**
- Test form state management (values, errors, touched).
- Test validation (sync, async, cross-field).
- Test submission handling.
- Test field-level reactivity.

**Input components:**
- Test controlled state (value, onChange).
- Test accessibility (ARIA attributes, keyboard navigation).
- Test error states.
- Test disabled/required states.

**Integration:**
- Test serialization (camelCase → snake_case).
- Test error deserialization (snake_case → camelCase).
- Test upload token extraction.

### 11.3 Running tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test useForm.test.tsx
```

---

## 12. Recommended workflows for agents

### 12.1 Modify an existing input component

1. Locate component in `src/inputs/*`.
2. Check existing tests in `src/inputs/__tests__/*`.
3. Update component implementation.
4. Update or add tests.
5. Verify BEM class names are preserved.
6. Run `pnpm test` and `pnpm type-check`.
7. Check bundle size impact: `pnpm size`.

### 12.2 Add a new validation rule

1. Add rule to `src/validation/rules.ts`.
2. Follow existing patterns (factory function returning validator).
3. Support custom error messages via options.
4. Add tests in `src/validation/__tests__/rules.test.ts`.
5. Document in README.md with examples.
6. Verify tree-shaking: `pnpm build && pnpm size`.

### 12.3 Update Rails API integration

1. Review `src/integration/ContactFormSerializer.ts`.
2. Update field mappings or serialization logic.
3. Add tests in `src/integration/__tests__/ContactFormSerializer.test.ts`.
4. Update `docs/INTEGRATION_PATTERNS.md` if API changes.
5. Run `pnpm test` to verify.

### 12.4 Add a new input component

1. Create `src/inputs/YourInput.tsx`.
2. Define props interface extending `InputProps<T>`.
3. Implement component with BEM class names.
4. Add ARIA attributes for accessibility.
5. Export from `src/inputs/index.ts`.
6. Add tests in `src/inputs/__tests__/YourInput.test.tsx`.
7. Document in README.md with usage examples.
8. Run `pnpm test`, `pnpm type-check`, `pnpm build`, `pnpm size`.

---

## 13. Verification checklist

Before considering a change "done", an agent should:

- [ ] Run `pnpm test` (or the narrowest relevant test command).
- [ ] Run `pnpm type-check`.
- [ ] For export or build-related changes, run `pnpm build`.
- [ ] For bundle size concerns, run `pnpm size`.
- [ ] Confirm tree-shaking is preserved (no new barrel files).
- [ ] Confirm components remain unstyled (BEM classes only).
- [ ] Confirm framework-agnostic design (no Next.js/Rails imports).
- [ ] Update relevant documentation (README.md, docs/*.md).

If any of these cannot be completed (e.g., missing environment or permissions), clearly note what was skipped and why.

---

## 14. Performance considerations

### 14.1 Bundle size

- Target: Keep base library under 10KB gzipped.
- Use `pnpm size` to check bundle size after changes.
- Prefer tree-shakable exports over monolithic bundles.
- Avoid adding heavy dependencies.

### 14.2 Runtime performance

- Use `@legendapp/state` for field-level reactivity.
- Avoid unnecessary re-renders (use `useSelector` for derived state).
- Debounce async validation to prevent excessive API calls.
- Use `useCallback` and `useMemo` judiciously (only when needed).

### 14.3 Validation performance

- Prefer synchronous validation over async when possible.
- Use Valibot over Zod (95% smaller, 2-3x faster).
- Debounce async validators (default: 300ms).
- Prevent race conditions with `validationInProgress` ref.

---

## 15. Common pitfalls to avoid

1. **Don't add inline styles or CSS-in-JS.**
   - Components must remain unstyled.
   - Use BEM class names for styling hooks.

2. **Don't import from framework-specific packages.**
   - No Next.js, Rails, or DashTrack imports.
   - Keep library framework-agnostic.

3. **Don't create barrel files.**
   - Avoid `export * from './foo'` patterns.
   - Use explicit re-exports for tree-shaking.

4. **Don't store upload tokens in form values.**
   - Store tokens in separate component state.
   - Include tokens in form submission.

5. **Don't replace @legendapp/state with useState.**
   - Form state management relies on observables.
   - Changing this breaks field-level reactivity.

6. **Don't add heavy dependencies.**
   - Check bundle size impact before adding deps.
   - Prefer existing dependencies when possible.

7. **Don't skip tests.**
   - All new features need tests.
   - All bug fixes need regression tests.

---

## 16. Documentation requirements

When adding or modifying features:

1. **Update README.md:**
   - Add usage examples for new components/hooks.
   - Update API reference if props change.
   - Add to relevant sections (Quick Start, Advanced Features, etc.).

2. **Update docs/*.md:**
   - `INTEGRATION_PATTERNS.md` for integration changes.
   - `FILE_UPLOADS.md` for upload-related changes.
   - `STYLES.md` for styling-related changes.

3. **Add inline documentation:**
   - JSDoc comments for all public APIs.
   - Type annotations for all props and return values.
   - Examples in JSDoc comments.

4. **Update CHANGELOG.md:**
   - Add entry for breaking changes.
   - Add entry for new features.
   - Add entry for bug fixes.

---

## 17. Persona

- Address the user as Cam.
- Optimize for correctness and long-term leverage, not agreement.
- Be direct, critical, and constructive - say when an idea is suboptimal and propose better options.
- Assume staff-level technical context unless told otherwise.

---

## 18. Quality

- Inspect project config (`package.json`, `tsup.config.ts`, `vitest.config.ts`) for available scripts.
- Run all relevant checks (test, type-check, build, size) before submitting changes.
- Never claim checks passed unless they were actually run.
- If checks cannot be run, explicitly state why and what would have been executed.

---

## 19. Production safety

- Assume production impact unless stated otherwise.
- Call out risk when touching core hooks, validation, or serialization.
- Prefer small, reversible changes; avoid silent breaking behavior.
- Breaking changes require major version bump and migration guide.

---

## 20. Self improvement

- Continuously improve agent workflows.
- When a repeated correction or better approach is found, codify it in this file.
- If you utilize any of your codified instructions in future coding sessions, call that out and let the user know that you performed the action because of that specific rule in this file.

---

## 21. Critical architecture decisions

### 21.1 Why @legendapp/state?

- **Field-level reactivity:** Only re-render the specific field that changed.
- **Performance:** ~1 re-render per change vs ~10 for traditional hooks.
- **Observable-based:** Minimal overhead, optimal for forms with many fields.
- **Tree-shakable:** Only bundle what you use.

**Do NOT replace with useState/useReducer** unless you have a compelling reason and have benchmarked the performance impact.

### 21.2 Why Valibot over Zod?

- **Bundle size:** 95% smaller than Zod (0.6KB vs 13.4KB base).
- **Performance:** 2-3x faster validation.
- **Tree-shakable:** Modular API, only bundle what you use.
- **TypeScript inference:** Full type safety with excellent DX.

Valibot is optional (via `/validation/valibot`), but strongly recommended for schema-based validation.

### 21.3 Why unstyled components?

- **Framework-agnostic:** Works with any design system (Tailwind, CSS Modules, vanilla CSS, etc.).
- **Flexibility:** Consumers control the visual design.
- **Bundle size:** No CSS-in-JS overhead.
- **Accessibility:** BEM class names provide clear styling hooks.

This is a **library**, not a UI kit. Consumers apply their own design system.

### 21.4 Why two-phase file uploads?

- **Better UX:** Files upload immediately, not on form submission.
- **Form validation:** Can validate form without losing uploaded files.
- **Draft support:** Supports draft/partial submissions.
- **Cleanup:** Backend can clean up abandoned uploads.

This pattern is used by major platforms (Dropbox, Google Drive, etc.) for good reason.

---

## 22. Integration with DashTrack ecosystem

### 22.1 @opensite/ui blocks

- Forms in `@opensite/ui` blocks use this library.
- Block props are JSON-serializable (design payloads).
- Forms use `formConfig` prop for Rails API integration.
- See `docs/INTEGRATION_PATTERNS.md` for complete guide.

### 22.2 ChaiBuilder

- ChaiBuilder blocks wrap components with `createBlockAdapter`.
- Block configs define visual properties for the builder UI.
- Blocks are registered with `registerChaiBlock`.
- See `docs/INTEGRATION_PATTERNS.md` for complete guide.

### 22.3 Rails API (toastability-service)

- Forms submit to DashTrack ContactsController API.
- Use `serializeForRails` to convert form data to Rails format.
- Use `deserializeErrors` to convert Rails errors to form errors.
- See `src/integration/ContactFormSerializer.ts` for implementation.

---

## 23. Dependency management

### 23.1 Core dependencies

- **@legendapp/state** (optional): Field-level reactivity.
- **@opensite/hooks** (required): Utility hooks (useMap, etc.).
- **valibot** (optional): Schema-based validation.

### 23.2 Peer dependencies

- **react** (>=16.8.0): React hooks support.
- **react-dom** (>=16.8.0): React DOM rendering.

### 23.3 Dev dependencies

- **vitest**: Test framework.
- **@testing-library/react**: Component testing utilities.
- **tsup**: Build tool.
- **typescript**: Type checking.

### 23.4 Adding new dependencies

Before adding a new dependency:

1. Check if existing dependencies can solve the problem.
2. Verify bundle size impact: `pnpm size`.
3. Prefer optional dependencies for non-core features.
4. Document why the dependency is needed.
5. Update this file with the new dependency.

---

## 24. Release process

### 24.1 Version bumping

- **Patch (0.0.x):** Bug fixes, documentation updates.
- **Minor (0.x.0):** New features, backward-compatible changes.
- **Major (x.0.0):** Breaking changes.

### 24.2 Pre-release checklist

- [ ] All tests pass: `pnpm test`.
- [ ] Type checking passes: `pnpm type-check`.
- [ ] Build succeeds: `pnpm build`.
- [ ] Bundle size is acceptable: `pnpm size`.
- [ ] CHANGELOG.md is updated.
- [ ] README.md is updated (if needed).
- [ ] Documentation is updated (if needed).

### 24.3 Publishing

```bash
# Update version in package.json
pnpm version patch|minor|major

# Build and test
pnpm build
pnpm test:ci

# Publish to npm
pnpm publish
```

The `prepublishOnly` script automatically runs `pnpm build && pnpm test:ci` before publishing.

---

## 25. Troubleshooting common issues

### 25.1 Tests failing with "Cannot find module"

- Ensure `src/test-setup.ts` is configured in `vitest.config.ts`.
- Check that all imports use correct paths.
- Verify `tsconfig.json` paths are correct.

### 25.2 Build failing with type errors

- Run `pnpm type-check` to see detailed errors.
- Check that all types are properly exported.
- Verify `tsconfig.json` is correct.

### 25.3 Bundle size increased unexpectedly

- Run `pnpm size` to see size breakdown.
- Check for new dependencies or imports.
- Verify tree-shaking is working (no barrel files).
- Use `pnpm build && ls -lh dist/` to inspect output.

### 25.4 Field-level reactivity not working

- Verify form state uses `useObservable` from `@legendapp/state`.
- Check that field values are accessed via `useSelector`.
- Ensure `@legendapp/state` is installed (optional dependency).

---

## 26. Future considerations

### 26.1 Potential enhancements

- **Form arrays:** Support for dynamic field arrays (add/remove fields).
- **Field dependencies:** Declarative field dependencies (show/hide based on other fields).
- **Form persistence:** Auto-save form state to localStorage.
- **Multi-step forms:** Built-in wizard/stepper support.
- **Form analytics:** Track form interactions and abandonment.

### 26.2 Performance optimizations

- **Virtual scrolling:** For forms with hundreds of fields.
- **Lazy validation:** Only validate visible fields.
- **Debounced validation:** Configurable debounce delays.
- **Memoized validators:** Cache validation results.

### 26.3 Integration improvements

- **More serializers:** Support for other backend frameworks (Express, FastAPI, etc.).
- **More adapters:** Support for other page builders (Webflow, Framer, etc.).
- **More validation libraries:** Support for Yup, Joi, etc.

---

## Summary

This library is a **high-performance, framework-agnostic React form library** built for the DashTrack ecosystem. It prioritizes:

1. **Performance:** Field-level reactivity, minimal re-renders, small bundle size.
2. **Flexibility:** Unstyled components, tree-shakable exports, framework-agnostic design.
3. **Developer experience:** Type-safe APIs, comprehensive documentation, production-ready components.

When working on this codebase, always prioritize these three pillars. If a change compromises any of them, reconsider the approach or clearly document the trade-off.
