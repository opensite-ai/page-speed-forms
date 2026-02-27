/// <reference types="vitest/globals" />
import '@testing-library/jest-dom/vitest';

// Suppress expected React error messages during tests
const originalError = console.error;
const originalWarn = console.warn;

// Store original console methods
const originalLog = console.log;

// Store original stderr.write to intercept React's low-level error output
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// Intercept process.stderr.write to suppress React error boundary output
process.stderr.write = ((chunk: any, ...args: any[]): boolean => {
  const output = chunk.toString();

  // Suppress React error boundary stack traces and Icon act warnings
  if (output.includes('Component render error') ||
      output.includes('at ErrorComponent') ||
      output.includes('at renderWithHooks') ||
      output.includes('useField must be used within a FormContext') ||
      output.includes('An update to Icon inside a test was not wrapped in act') ||
      output.includes('at Icon (') ||
      output.includes('act(')) {
    return true;
  }

  return originalStderrWrite(chunk, ...args);
}) as typeof process.stderr.write;

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
      fullMessage.includes('at renderWithHooks') ||
      fullMessage.includes('An update to Icon inside a test was not wrapped in act') ||
      fullMessage.includes('act(')) {
    return;
  }

  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const fullMessage = args.map(arg => String(arg)).join(' ');

  // Suppress act warnings
  if (fullMessage.includes('act(') || fullMessage.includes('An update to Icon inside a test was not wrapped in act')) {
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
