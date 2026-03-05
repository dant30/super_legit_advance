import { describe, expect, it } from "vitest";
import { normalizeLoanCollection } from "../../../features/loans/services/loans";

describe("normalizeLoanCollection", () => {
  it("extracts list from paginated payload", () => {
    const payload = { results: [{ id: "1" }, { id: "2" }] };
    expect(normalizeLoanCollection(payload)).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("extracts list from wrapped payload data", () => {
    const payload = { data: { results: [{ id: "loan-1" }] } };
    expect(normalizeLoanCollection(payload)).toEqual([{ id: "loan-1" }]);
  });

  it("returns empty list for unknown payload shapes", () => {
    expect(normalizeLoanCollection({ summary: { total_loans: 4 } })).toEqual([]);
    expect(normalizeLoanCollection(null)).toEqual([]);
  });
});
