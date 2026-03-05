import { describe, expect, it } from "vitest";
import {
  selectCollectionReportError,
  selectReportsError,
} from "../../../features/reports/store/selectors";

describe("reports selectors", () => {
  it("coerces object errors to safe text", () => {
    const state = {
      reports: {
        error: {
          code: "THROTTLED",
          message: "Too many requests.",
          details: "Retry later",
        },
        collectionError: {
          code: "SERVICE_UNAVAILABLE",
          detail: "Collection service offline.",
        },
      },
    };

    expect(selectReportsError(state)).toBe("Too many requests.");
    expect(selectCollectionReportError(state)).toBe("Collection service offline.");
  });

  it("returns null for missing errors", () => {
    const state = { reports: {} };
    expect(selectReportsError(state)).toBeNull();
    expect(selectCollectionReportError(state)).toBeNull();
  });
});
