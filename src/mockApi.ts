import type { ApiResponse, ConsoleApiClient, ConsoleDataSnapshot } from "./adapters";
import { snapshotFromProvider } from "./adapters";
import { mockProvider } from "./mockProvider";

const MOCK_LATENCY_MS = 320;

function cloneSnapshot(snapshot: ConsoleDataSnapshot): ConsoleDataSnapshot {
  return structuredClone(snapshot);
}

function traceId() {
  return `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function success<T>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
    traceId: traceId(),
    source: "mock-api",
    receivedAt: new Date().toISOString(),
  };
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export const mockApiClient: ConsoleApiClient = {
  async getConsoleSnapshot() {
    await wait(MOCK_LATENCY_MS);
    return success(cloneSnapshot(snapshotFromProvider(mockProvider)));
  },
};
