import { vi } from "vitest";

// Mock fetch globally to prevent actual network requests during tests
globalThis.fetch = vi.fn((url) =>{
  if (url.includes('streamline-card/streamline_templates.yaml')) {
    return Promise.resolve(new Response('', {status: 200, statusText: "OK"}))
  }

  return Promise.reject(new Error("Network request blocked in tests"));
});
