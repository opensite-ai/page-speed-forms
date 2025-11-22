import '@testing-library/jest-dom';

// Suppress expected React error messages during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress expected errors that are intentionally tested
    const errorMessage = args[0]?.toString() || '';

    // Suppress "useField must be used within a FormContext" errors
    // These are expected errors tested in Field.test.tsx
    if (errorMessage.includes('useField must be used within a FormContext')) {
      return;
    }

    // Suppress React warnings about act() that are handled by testing-library
    if (errorMessage.includes('act(')) {
      return;
    }

    // For all other errors, use original console.error
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const warnMessage = args[0]?.toString() || '';

    // Suppress common React testing warnings
    if (warnMessage.includes('act(')) {
      return;
    }

    // For all other warnings, use original console.warn
    originalWarn.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
