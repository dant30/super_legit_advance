export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = Object.freeze(["en", "sw"]);

export const LOCALES = Object.freeze({
  en: {
    common: {
      appName: "Super Legit Advance",
      dashboard: "Dashboard",
      customers: "Customers",
      loans: "Loans",
      repayments: "Repayments",
      reports: "Reports",
      notifications: "Notifications",
      settings: "Settings",
    },
    messages: {
      saved: "Saved successfully.",
      updated: "Updated successfully.",
      deleted: "Deleted successfully.",
    },
    errors: {
      unexpected: "Unexpected error.",
      requestFailed: "Request failed.",
      authFailed: "Authentication failed.",
    },
    auth: {
      loginSuccess: "Signed in successfully.",
      loginFailed: "Sign in failed.",
      logoutSuccess: "You have been signed out.",
      profileUpdated: "Profile updated successfully.",
      profileUpdateFailed: "Failed to update profile.",
      passwordChanged: "Password changed successfully.",
      passwordChangeFailed: "Failed to change password.",
      sessionExpired: "Your session has expired. Please sign in again.",
      checkingSession: "Checking your session...",
    },
    routes: {
      verifyingAccess: "Verifying access...",
      checkingPermissions: "Checking permissions...",
      checkingAdminAccess: "Checking admin access...",
      loadingApp: "Loading Super Legit Advance...",
      loadingPage: "Loading page...",
    },
    access: {
      restrictedTitle: "Access Restricted",
      restrictedMessage: "Your account does not have permission to open this section.",
      returnToDashboard: "Return to Dashboard",
    },
    toast: {
      successTitle: "Success",
      errorTitle: "Error",
      infoTitle: "Info",
      warningTitle: "Attention",
    },
  },
  sw: {
    common: {
      appName: "Super Legit Advance",
      dashboard: "Dashibodi",
      customers: "Wateja",
      loans: "Mikopo",
      repayments: "Malipo",
      reports: "Ripoti",
      notifications: "Arifa",
      settings: "Mipangilio",
    },
    messages: {
      saved: "Imehifadhiwa kikamilifu.",
      updated: "Imesasishwa kikamilifu.",
      deleted: "Imefutwa kikamilifu.",
    },
    errors: {
      unexpected: "Hitilafu isiyotarajiwa.",
      requestFailed: "Ombi halikufaulu.",
      authFailed: "Uthibitishaji umeshindikana.",
    },
    auth: {
      loginSuccess: "Umeingia kikamilifu.",
      loginFailed: "Kuingia kumeshindikana.",
      logoutSuccess: "Umetoka kwenye akaunti.",
      profileUpdated: "Wasifu umesasishwa kikamilifu.",
      profileUpdateFailed: "Imeshindikana kusasisha wasifu.",
      passwordChanged: "Nenosiri limebadilishwa kikamilifu.",
      passwordChangeFailed: "Imeshindikana kubadilisha nenosiri.",
      sessionExpired: "Kikao chako kimeisha. Tafadhali ingia tena.",
      checkingSession: "Inakagua kikao chako...",
    },
    routes: {
      verifyingAccess: "Inathibitisha ruhusa...",
      checkingPermissions: "Inakagua ruhusa...",
      checkingAdminAccess: "Inakagua ruhusa za msimamizi...",
      loadingApp: "Inapakia Super Legit Advance...",
      loadingPage: "Inapakia ukurasa...",
    },
    access: {
      restrictedTitle: "Ruhusa Imezuiwa",
      restrictedMessage: "Akaunti yako haina ruhusa ya kufungua sehemu hii.",
      returnToDashboard: "Rudi Dashibodi",
    },
    toast: {
      successTitle: "Mafanikio",
      errorTitle: "Hitilafu",
      infoTitle: "Taarifa",
      warningTitle: "Tahadhari",
    },
  },
});
