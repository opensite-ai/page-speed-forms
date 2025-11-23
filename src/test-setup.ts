import '@testing-library/jest-dom';

// Suppress expected React error messages during tests
const originalError = console.error;
const originalWarn = console.warn;

// Store original console methods
const originalLog = console.log;

// Suppress React error boundary errors globally
// This must be done before beforeAll to catch React's internal error logging
console.error = (...args: any[]) => {
  const fullMessage = args.map(arg =>
    arg instanceof Error ? arg.message : String(arg)
  ).join(' ');

  // Suppress expected test errors
  if (fullMessage.includes('useField must be used within a FormContext') ||
      fullMessage.includes('Component render error') ||
      fullMessage.includes('at ErrorComponent') ||
      fullMessage.includes('at useField') ||
      fullMessage.includes('at Field') ||
      fullMessage.includes('at renderWithHooks')) {
    return;
  }

  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const fullMessage = args.map(arg => String(arg)).join(' ');

  if (fullMessage.includes('act(')) {
    return;
  }

  originalWarn.apply(console, args);
};

beforeAll(() => {
  // Suppress console.log for Error stack traces
  console.log = (...args: any[]) => {
    const fullMessage = args.map(arg => String(arg)).join(' ');

    // Suppress error stack traces
    if (fullMessage.includes('useField') ||
        fullMessage.includes('FormContext') ||
        fullMessage.includes('Component render error') ||
        fullMessage.includes('ErrorComponent') ||
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
