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
      const [overview, customers, loans, approvals, collections, performance, activity] =
        await Promise.all([
          dashboardAPI.getOverview(),
          dashboardAPI.getMyCustomers(),
          dashboardAPI.getMyLoans(),
          dashboardAPI.getPendingApprovals(),
          dashboardAPI.getCollectionsSummary(),
          dashboardAPI.getPerformanceMetrics(),
          dashboardAPI.getRecentActivity(),
        ]);

      dispatch(setOverview(overview));
      dispatch(setDashboardCustomers(customers));
      dispatch(setDashboardLoans(loans));
      dispatch(setPendingApprovals(approvals));
      dispatch(setCollections(collections));
      dispatch(setPerformance(performance));
      dispatch(setRecentActivity(activity));

      return {
        overview,
        customers,
        loans,
        approvals,
        collections,
        performance,
        activity,
      };
    });
  }, [dispatch, withLoading]);

  return {
    loadDashboard,
  };
};

export default useDashboard;
