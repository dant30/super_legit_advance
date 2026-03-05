import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const navigateMock = vi.fn();
const contextState = {
  loan: null,
  isLoading: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: "101" }),
  };
});

vi.mock("@contexts/LoanContext", () => ({
  useLoanContext: () => ({
    useLoanQuery: () => ({ data: contextState.loan, isLoading: contextState.isLoading }),
    useApproveLoan: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useRejectLoan: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDisburseLoan: () => ({ mutateAsync: vi.fn(), isPending: false }),
  }),
}));

vi.mock("@components/loans", () => ({
  LoanDetails: ({ loan }) => <div>Loan details {loan?.loan_number}</div>,
}));

vi.mock("@components/ui", () => ({
  PageHeader: ({ extra }) => <div>{extra}</div>,
  Button: ({ children }) => <button type="button">{children}</button>,
}));

import LoanDetail from "../../../features/loans/pages/LoanDetail";

describe("LoanDetail lifecycle actions", () => {
  it("shows approve/reject actions when loan is pending", () => {
    contextState.loan = { id: 101, loan_number: "LN-101", status: "PENDING" };
    render(<LoanDetail />);

    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Approve" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Reject" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Disburse" })).toBeNull();
  });

  it("shows disburse action only when loan is approved", () => {
    contextState.loan = { id: 101, loan_number: "LN-101", status: "APPROVED" };
    render(<LoanDetail />);

    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Disburse" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
  });

  it("hides edit/action buttons on active loans", () => {
    contextState.loan = { id: 101, loan_number: "LN-101", status: "ACTIVE" };
    render(<LoanDetail />);

    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Disburse" })).toBeNull();
  });
});
