import { beforeEach, describe, expect, it, vi } from "vitest";

const { axiosMock } = vi.hoisted(() => ({
  axiosMock: {
    get: vi.fn(),
  },
}));

vi.mock("@api/axios", () => ({ default: axiosMock }));

import { dashboardAPI } from "../../../features/dashboard/services/dashboard";

describe("dashboard lifecycle API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads overview from customers/loans/repayments stats endpoints", async () => {
    axiosMock.get
      .mockResolvedValueOnce({ data: { total_customers: 12 } })
      .mockResolvedValueOnce({ data: { summary: { total_active_loans: 7 } } })
      .mockResolvedValueOnce({ data: { amounts: { collection_rate: 88.2 }, today: { count: 3 } } });

    const overview = await dashboardAPI.getOverview();

    expect(overview).toEqual({
      customers: 12,
      activeLoans: 7,
      dueToday: 3,
      collectionRate: 88.2,
    });
    expect(axiosMock.get).toHaveBeenNthCalledWith(1, "/customers/stats/");
    expect(axiosMock.get).toHaveBeenNthCalledWith(2, "/loans/stats/");
    expect(axiosMock.get).toHaveBeenNthCalledWith(3, "/repayments/stats/");
  });

  it("loads lifecycle dashboard collections from expected list endpoints", async () => {
    axiosMock.get
      .mockResolvedValueOnce({ data: { results: [{ id: "c1" }] } })
      .mockResolvedValueOnce({ data: { results: [{ id: "l1" }] } })
      .mockResolvedValueOnce({ data: { results: [{ id: "a1" }] } })
      .mockResolvedValueOnce({
        data: {
          amounts: { total_paid: 8000, total_due: 10000 },
          today: { count: 2 },
        },
      });

    const customers = await dashboardAPI.getMyCustomers();
    const loans = await dashboardAPI.getMyLoans();
    const approvals = await dashboardAPI.getPendingApprovals();
    const collections = await dashboardAPI.getCollectionsSummary();

    expect(customers).toEqual([{ id: "c1" }]);
    expect(loans).toEqual([{ id: "l1" }]);
    expect(approvals).toEqual([{ id: "a1" }]);
    expect(collections).toEqual({
      collected: "KES 8,000",
      target: "KES 10,000",
      rate: 80,
      dueToday: 2,
    });
    expect(axiosMock.get).toHaveBeenNthCalledWith(1, "/customers/", { params: { page_size: 5 } });
    expect(axiosMock.get).toHaveBeenNthCalledWith(2, "/loans/", { params: { page_size: 5 } });
    expect(axiosMock.get).toHaveBeenNthCalledWith(3, "/loans/applications/", {
      params: { pending: true, page_size: 5 },
    });
    expect(axiosMock.get).toHaveBeenNthCalledWith(4, "/repayments/stats/");
  });
});

