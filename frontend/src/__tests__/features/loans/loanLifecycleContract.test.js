import { beforeEach, describe, expect, it, vi } from "vitest";

const { axiosMock } = vi.hoisted(() => ({
  axiosMock: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@api/axios", () => ({ default: axiosMock }));

import { loanAPI } from "../../../features/loans/services/loans";

describe("loan lifecycle API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and fetches loans with expected endpoints", async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { id: 17 } });
    axiosMock.get.mockResolvedValueOnce({ data: { id: 17, status: "PENDING" } });

    const created = await loanAPI.createLoan({ customer: 3, amount_requested: 25000 });
    const detail = await loanAPI.getLoan(17);

    expect(created.id).toBe(17);
    expect(detail.status).toBe("PENDING");
    expect(axiosMock.post).toHaveBeenCalledWith("/loans/create/", {
      customer: 3,
      amount_requested: 25000,
    });
    expect(axiosMock.get).toHaveBeenCalledWith("/loans/17/");
  });

  it("updates, approves, disburses and rejects via dedicated endpoints", async () => {
    axiosMock.patch.mockResolvedValueOnce({ data: { id: 17, notes: "updated" } });
    axiosMock.post
      .mockResolvedValueOnce({ data: { status: "APPROVED" } })
      .mockResolvedValueOnce({ data: { status: "ACTIVE" } })
      .mockResolvedValueOnce({ data: { status: "REJECTED" } });

    await loanAPI.updateLoan(17, { notes: "updated" });
    await loanAPI.approveLoan(17, { approved_amount: 20000 });
    await loanAPI.disburseLoan(17, { disbursement_amount: 19000 });
    await loanAPI.rejectLoan(18, "Insufficient repayment history");

    expect(axiosMock.patch).toHaveBeenCalledWith("/loans/17/", { notes: "updated" });
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, "/loans/17/approve/", {
      approved_amount: 20000,
    });
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, "/loans/17/disburse/", {
      disbursement_amount: 19000,
    });
    expect(axiosMock.post).toHaveBeenNthCalledWith(3, "/loans/18/reject/", {
      rejection_reason: "Insufficient repayment history",
    });
  });
});
