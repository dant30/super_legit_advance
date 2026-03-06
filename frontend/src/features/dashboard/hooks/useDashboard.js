import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { dashboardAPI } from "../services/dashboard";
import {
  setCollections,
  setDashboardCustomers,
  setDashboardError,
  setDashboardLoading,
  setDashboardLoans,
  setDashboardState,
  setOverview,
  setPendingApprovals,
  setPerformance,
  setRecentActivity,
} from "../store";

export const useDashboard = () => {
  const dispatch = useDispatch();

  const withLoading = useCallback(async (fn) => {
    dispatch(setDashboardLoading(true));
    dispatch(setDashboardError(null));
    try {
      return await fn();
    } catch (error) {
      dispatch(
        setDashboardError(
          error?.response?.data?.detail || error?.message || "Failed to load dashboard data"
        )
      );
      throw error;
    } finally {
      dispatch(setDashboardLoading(false));
      dispatch(setDashboardState({ lastUpdatedAt: Date.now() }));
    }
  }, [dispatch]);

  const loadDashboard = useCallback(async () => {
    return withLoading(async () => {
      const jobs = [
        {
          key: "overview",
          label: "overview",
          run: () => dashboardAPI.getOverview(),
          fallback: { customers: 0, activeLoans: 0, dueToday: 0, collectionRate: 0 },
          apply: (payload) => dispatch(setOverview(payload)),
        },
        {
          key: "customers",
          label: "customers",
          run: () => dashboardAPI.getMyCustomers(),
          fallback: [],
          apply: (payload) => dispatch(setDashboardCustomers(payload)),
        },
        {
          key: "loans",
          label: "loans",
          run: () => dashboardAPI.getMyLoans(),
          fallback: [],
          apply: (payload) => dispatch(setDashboardLoans(payload)),
        },
        {
          key: "approvals",
          label: "pending approvals",
          run: () => dashboardAPI.getPendingApprovals(),
          fallback: [],
          apply: (payload) => dispatch(setPendingApprovals(payload)),
        },
        {
          key: "collections",
          label: "collections",
          run: () => dashboardAPI.getCollectionsSummary(),
          fallback: { collected: "KES 0", target: "KES 0", rate: 0, dueToday: 0 },
          apply: (payload) => dispatch(setCollections(payload)),
        },
        {
          key: "performance",
          label: "performance",
          run: () => dashboardAPI.getPerformanceMetrics(),
          fallback: [],
          apply: (payload) => dispatch(setPerformance(payload)),
        },
        {
          key: "activity",
          label: "recent activity",
          run: () => dashboardAPI.getRecentActivity(),
          fallback: [],
          apply: (payload) => dispatch(setRecentActivity(payload)),
        },
      ];

      const settled = await Promise.allSettled(jobs.map((job) => job.run()));
      const result = {};
      const failed = [];

      settled.forEach((entry, index) => {
        const job = jobs[index];
        if (entry.status === "fulfilled") {
          result[job.key] = entry.value;
          job.apply(entry.value);
          return;
        }

        result[job.key] = job.fallback;
        job.apply(job.fallback);
        failed.push(job.label);
      });

      if (failed.length) {
        dispatch(
          setDashboardError(
            `Dashboard partially loaded. Failed sections: ${failed.join(", ")}`
          )
        );
      }

      return result;
    });
  }, [dispatch, withLoading]);

  return {
    loadDashboard,
  };
};

export default useDashboard;
