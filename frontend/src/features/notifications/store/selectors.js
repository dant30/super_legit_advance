export const selectNotificationsState = (state) => state?.notifications || {};

export const selectNotifications = (state) =>
  selectNotificationsState(state).notifications || [];
export const selectNotificationsLoading = (state) =>
  Boolean(selectNotificationsState(state).notificationsLoading);
export const selectNotificationsError = (state) =>
  selectNotificationsState(state).notificationsError || null;
export const selectTotalNotifications = (state) =>
  Number(selectNotificationsState(state).totalNotifications || 0);
export const selectUnreadNotificationsCount = (state) =>
  Number(selectNotificationsState(state).unreadCount || 0);
export const selectRecentNotifications = (state) =>
  selectNotificationsState(state).recentNotifications || [];

export const selectSelectedNotification = (state) =>
  selectNotificationsState(state).selectedNotification || null;
export const selectSelectedNotificationLoading = (state) =>
  Boolean(selectNotificationsState(state).selectedNotificationLoading);
export const selectSelectedNotificationError = (state) =>
  selectNotificationsState(state).selectedNotificationError || null;

export const selectNotificationStats = (state) =>
  selectNotificationsState(state).stats || null;
export const selectNotificationStatsLoading = (state) =>
  Boolean(selectNotificationsState(state).statsLoading);
export const selectNotificationStatsError = (state) =>
  selectNotificationsState(state).statsError || null;

export const selectNotificationTemplates = (state) =>
  selectNotificationsState(state).templates || [];
export const selectNotificationTemplatesLoading = (state) =>
  Boolean(selectNotificationsState(state).templatesLoading);
export const selectNotificationTemplatesError = (state) =>
  selectNotificationsState(state).templatesError || null;

export const selectNotificationSmsLogs = (state) =>
  selectNotificationsState(state).smsLogs || [];
export const selectNotificationSmsLogsLoading = (state) =>
  Boolean(selectNotificationsState(state).smsLogsLoading);
export const selectNotificationSmsLogsError = (state) =>
  selectNotificationsState(state).smsLogsError || null;

export const selectNotificationSmsStats = (state) =>
  selectNotificationsState(state).smsStats || null;
export const selectNotificationSmsStatsLoading = (state) =>
  Boolean(selectNotificationsState(state).smsStatsLoading);
export const selectNotificationSmsStatsError = (state) =>
  selectNotificationsState(state).smsStatsError || null;

export const selectNotificationSuccessMessage = (state) =>
  selectNotificationsState(state).successMessage || null;
