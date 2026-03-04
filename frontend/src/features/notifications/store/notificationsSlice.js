import { createSlice } from "@reduxjs/toolkit";
import { NOTIFICATIONS_INITIAL_STATE } from "../types";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: NOTIFICATIONS_INITIAL_STATE,
  reducers: {
    setNotificationsState(state, action) {
      const patch = action.payload || {};
      Object.assign(state, patch);
    },
    setNotifications(state, action) {
      state.notifications = action.payload || [];
    },
    setNotificationsLoading(state, action) {
      state.notificationsLoading = Boolean(action.payload);
    },
    setNotificationsError(state, action) {
      state.notificationsError = action.payload || null;
    },
    setTotalNotifications(state, action) {
      state.totalNotifications = Number(action.payload || 0);
    },
    setUnreadCount(state, action) {
      state.unreadCount = Number(action.payload || 0);
    },
    setRecentNotifications(state, action) {
      state.recentNotifications = action.payload || [];
    },
    setSelectedNotification(state, action) {
      state.selectedNotification = action.payload || null;
    },
    setNotificationStats(state, action) {
      state.stats = action.payload || null;
    },
    setNotificationTemplates(state, action) {
      state.templates = action.payload || [];
    },
    setNotificationSmsLogs(state, action) {
      state.smsLogs = action.payload || [];
    },
    setNotificationSmsStats(state, action) {
      state.smsStats = action.payload || null;
    },
    setNotificationSuccessMessage(state, action) {
      state.successMessage = action.payload || null;
    },
    resetNotificationsState() {
      return NOTIFICATIONS_INITIAL_STATE;
    },
  },
});

export const {
  setNotificationsState,
  setNotifications,
  setNotificationsLoading,
  setNotificationsError,
  setTotalNotifications,
  setUnreadCount,
  setRecentNotifications,
  setSelectedNotification,
  setNotificationStats,
  setNotificationTemplates,
  setNotificationSmsLogs,
  setNotificationSmsStats,
  setNotificationSuccessMessage,
  resetNotificationsState,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
