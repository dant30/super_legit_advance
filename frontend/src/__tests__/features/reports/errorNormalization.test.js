import { describe, expect, it } from "vitest";
import { normalizeReportError } from "../../../features/reports/hooks/useReports";

describe("normalizeReportError", () => {
  it("returns plain string values directly", () => {
    expect(normalizeReportError("Something failed")).toBe("Something failed");
  });

  it("extracts message from backend payload object", () => {
    const payload = {
      code: "THROTTLED",
      message: "Too many requests.",
      details: "Try later",
      hint: "Wait",
      retry_after: 30,
    };
    expect(normalizeReportError(payload, "Fallback")).toBe("Too many requests.");
  });

  it("extracts message from axios-style error shape", () => {
    const error = {
      response: {
        data: {
          message: "Collection report unavailable.",
        },
      },
    };
    expect(normalizeReportError(error, "Fallback")).toBe("Collection report unavailable.");
  });

  it("falls back safely when no readable message exists", () => {
    expect(normalizeReportError({ code: "X" }, "Safe fallback")).toBe("X: Safe fallback");
    expect(normalizeReportError(null, "Safe fallback")).toBe("Safe fallback");
  });
});
