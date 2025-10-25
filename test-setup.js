import { vi } from "vitest";

// Mock fetch globally to prevent actual network requests during tests
globalThis.fetch = vi.fn(() =>
  Promise.reject(new Error("Network request blocked in tests")),
);
