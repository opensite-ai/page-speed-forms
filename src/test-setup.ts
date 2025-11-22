import '@testing-library/jest-dom';

// Suppress expected React error messages during tests
const originalError = console.error;
const originalWarn = console.warn;

// Store original console methods
const originalLog = console.log;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Convert all args to string for checking
    const fullMessage = args.map(arg =>
      arg instanceof Error ? arg.message : String(arg)
    ).join(' ');

    // Suppress "useField must be used within a FormContext" errors
    // These are expected errors tested in Field.test.tsx
    if (fullMessage.includes('useField must be used within a FormContext')) {
      return;
    }

    // Suppress "Error:" prefix lines that come from React error boundaries
    if (fullMessage.startsWith('Error:') && fullMessage.includes('useField')) {
      return;
    }

    // Suppress React warnings about act() that are handled by testing-library
    if (fullMessage.includes('act(')) {
      return;
    }

    // Suppress React error stack traces
    if (fullMessage.includes('at useField') ||
        fullMessage.includes('at Field') ||
        fullMessage.includes('at renderWithHooks')) {
      return;
    }

    // For all other errors, use original console.error
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const fullMessage = args.map(arg => String(arg)).join(' ');

    // Suppress common React testing warnings
    if (fullMessage.includes('act(')) {
      return;
    }

    // For all other warnings, use original console.warn
    originalWarn.apply(console, args);
  };

  // Suppress console.log for Error stack traces
  console.log = (...args: any[]) => {
    const fullMessage = args.map(arg => String(arg)).join(' ');

    // Suppress error stack traces
    if (fullMessage.includes('useField') ||
        fullMessage.includes('FormContext') ||
        fullMessage.startsWith('Error:')) {
      return;
    }

    originalLog.apply(console, args);
  };
});

// Note: Console suppressions remain active to catch errors during cleanup/teardown
// afterAll(() => {
//   console.error = originalError;
//   console.warn = originalWarn;
//   console.log = originalLog;
// });
