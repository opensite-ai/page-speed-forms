#!/bin/bash
# Run tests and filter out expected React context errors

vitest run 2>&1 | grep -v "useField must be used within a FormContext" | grep -v "at useField" | grep -v "at Field" | grep -v "at renderWithHooks" | grep -v "at mountIndeterminateComponent" | grep -v "at beginWork" | grep -v "at HTMLUnknownElement" | grep -v "at innerInvokeEventListeners" | grep -v "at invokeEventListeners" | grep -v "at HTMLUnknownElementImpl"

# Preserve the exit code from vitest
exit ${PIPESTATUS[0]}
