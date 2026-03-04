import axios from "@api/axios";

const toArray = (data) => (Array.isArray(data) ? data : data?.results || []);

export class DashboardAPI {
  async getOverview() {
    const [customersResp, loansResp, repaymentsResp] = await Promise.all([
      axios.get("/customers/stats/"),
      axios.get("/loans/stats/"),
      axios.get("/repayments/stats/"),
    ]);

    const customers = customersResp?.data || {};
    const loans = loansResp?.data || {};
    const repayments = repaymentsResp?.data || {};

    return {
      customers: customers.total_customers || 0,
      activeLoans: loans.active_loans || loans.total_active_loans || 0,
      dueToday: repayments.due_today || repayments.due_repayments_today || 0,
      collectionRate:
        repayments.collection_rate ||
        repayments.repayment_rate ||
        repayments.on_time_rate ||
        0,
    };
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
    const data = resp?.data || {};
    const totalPaid = Number(data.total_collected || data.total_paid || 0);
    const totalDue = Number(data.total_due || data.total_expected || 0);
    const rate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

    return {
      collected: `KES ${totalPaid.toLocaleString()}`,
      target: `KES ${totalDue.toLocaleString()}`,
      rate,
      dueToday: data.due_today || data.due_repayments_today || 0,
    };
  }

  async getPerformanceMetrics() {
    const [loansStats, repaymentsStats] = await Promise.all([
      axios.get("/loans/stats/"),
      axios.get("/repayments/stats/"),
    ]);
    const loans = loansStats?.data || {};
    const repayments = repaymentsStats?.data || {};

    return [
      {
        label: "Collections Target",
        value: Math.round(Number(repayments.collection_rate || 0)),
        variant: "success",
      },
      {
        label: "Loan Portfolio Health",
        value: Math.round(Number(loans.portfolio_health_score || 70)),
        variant: "info",
      },
      {
        label: "Approval Throughput",
        value: Math.round(Number(loans.approval_rate || 55)),
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
