import type { ApiMode, ConsoleApiClient } from "./adapters";
import { mockApiClient } from "./mockApi";
import { realApiClient } from "./realApi";

export function createConsoleApiClient(mode: ApiMode): ConsoleApiClient {
  if (mode === "real") return realApiClient;
  return mockApiClient;
}

export function apiModeLabel(mode: ApiMode) {
  if (mode === "real") return "Real API";
  if (mode === "hybrid") return "Hybrid API";
  return "Mock API";
}
