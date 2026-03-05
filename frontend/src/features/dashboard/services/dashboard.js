import axios from "@api/axios";

const unwrapEnvelope = (payload) =>
  payload && typeof payload === "object" && payload.data !== undefined
    ? payload.data
    : payload;

const toBody = (response) => unwrapEnvelope(response?.data ?? response);

const toArray = (data) => {
  const payload = unwrapEnvelope(data);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const normalizeDashboardOverview = (customersPayload, loansPayload, repaymentsPayload) => {
  const customers = unwrapEnvelope(customersPayload) || {};
  const loans = unwrapEnvelope(loansPayload) || {};
  const repayments = unwrapEnvelope(repaymentsPayload) || {};

  const loansSummary = loans?.summary || {};
  const repaymentsAmounts = repayments?.amounts || {};
  const repaymentsToday = repayments?.today || {};

  return {
    customers:
      customers.total_customers ||
      customers?.summary?.total_customers ||
      customers?.counts?.total ||
      customers.total ||
      0,
    activeLoans:
      loans.active_loans ||
      loans.total_active_loans ||
      loansSummary.total_active_loans ||
      loansSummary.active_loans ||
      0,
    dueToday:
      repayments.due_today ||
      repayments.due_repayments_today ||
      repaymentsToday.count ||
      repayments?.counts?.due_today ||
      0,
    collectionRate:
      repayments.collection_rate ||
      repayments.repayment_rate ||
      repayments.on_time_rate ||
      repaymentsAmounts.collection_rate ||
      0,
  };
};

export class DashboardAPI {
  async getOverview() {
    const [customersResp, loansResp, repaymentsResp] = await Promise.all([
      axios.get("/customers/stats/"),
      axios.get("/loans/stats/"),
      axios.get("/repayments/stats/"),
    ]);

    return normalizeDashboardOverview(customersResp?.data, loansResp?.data, repaymentsResp?.data);
  }

  async getMyCustomers(params = {}) {
    const resp = await axios.get("/customers/", { params: { page_size: 5, ...params } });
    return toArray(resp?.data);
  }

  async getMyLoans(params = {}) {
    const resp = await axios.get("/loans/", { params: { page_size: 5, ...params } });
    return toArray(resp?.data);
  }

  async getPendingApprovals(params = {}) {
    const resp = await axios.get("/loans/applications/", {
      params: { pending: true, page_size: 5, ...params },
    });
    return toArray(resp?.data);
  }

  async getCollectionsSummary() {
    const resp = await axios.get("/repayments/stats/");
    const data = toBody(resp) || {};
    const amounts = data?.amounts || {};
    const today = data?.today || {};

    const totalPaid = Number(
      data.total_collected || data.total_paid || amounts.total_paid || 0
    );
    const totalDue = Number(
      data.total_due || data.total_expected || amounts.total_due || 0
    );
    const rate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

    return {
      collected: `KES ${totalPaid.toLocaleString()}`,
      target: `KES ${totalDue.toLocaleString()}`,
      rate,
      dueToday: data.due_today || data.due_repayments_today || today.count || 0,
    };
  }

  async getPerformanceMetrics() {
    const [loansStats, repaymentsStats] = await Promise.all([
      axios.get("/loans/stats/"),
      axios.get("/repayments/stats/"),
    ]);
    const loans = toBody(loansStats) || {};
    const repayments = toBody(repaymentsStats) || {};
    const loansSummary = loans?.summary || {};
    const repaymentsAmounts = repayments?.amounts || {};

    return [
      {
        label: "Collections Target",
        value: Math.round(Number(repayments.collection_rate || repaymentsAmounts.collection_rate || 0)),
        variant: "success",
      },
      {
        label: "Loan Portfolio Health",
        value: Math.round(Number(loans.portfolio_health_score || loansSummary.portfolio_health_score || 70)),
        variant: "info",
      },
      {
        label: "Approval Throughput",
        value: Math.round(Number(loans.approval_rate || loansSummary.approval_rate || 55)),
        variant: "warning",
      },
    ];
  }

  async getRecentActivity() {
    const [repaymentsResp, loansResp] = await Promise.all([
      axios.get("/repayments/", { params: { ordering: "-created_at", page_size: 3 } }),
      axios.get("/loans/", { params: { ordering: "-created_at", page_size: 3 } }),
    ]);

    const repaymentItems = toArray(repaymentsResp?.data).map((r) => ({
      id: `repayment-${r.id}`,
      title: "Repayment recorded",
      detail: `${r.repayment_number || `RP-${r.id}`} for ${r.customer?.full_name || "customer"}`,
      time: r.created_at || r.payment_date,
    }));

    const loanItems = toArray(loansResp?.data).map((l) => ({
      id: `loan-${l.id}`,
      title: "Loan application updated",
      detail: `${l.loan_number || `LN-${l.id}`} for ${l.customer?.full_name || "customer"}`,
      time: l.created_at,
    }));

    return [...repaymentItems, ...loanItems]
      .filter((item) => item.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  }
}

export const dashboardAPI = new DashboardAPI();
export default dashboardAPI;
