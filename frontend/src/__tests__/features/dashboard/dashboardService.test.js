import { describe, expect, it } from "vitest";
import { normalizeDashboardOverview } from "../../../features/dashboard/services/dashboard";

describe("dashboard service normalization", () => {
  it("reads overview values from nested stats payloads", () => {
    const customers = { data: { total_customers: 12 } };
    const loans = { summary: { total_active_loans: 7 } };
    const repayments = { amounts: { collection_rate: 83.4 }, today: { count: 3 } };

    expect(normalizeDashboardOverview(customers, loans, repayments)).toEqual({
      customers: 12,
      activeLoans: 7,
      dueToday: 3,
      collectionRate: 83.4,
    });
  });

  it("falls back safely for empty payloads", () => {
    expect(normalizeDashboardOverview(null, null, null)).toEqual({
      customers: 0,
      activeLoans: 0,
      dueToday: 0,
      collectionRate: 0,
    });
  });
});
