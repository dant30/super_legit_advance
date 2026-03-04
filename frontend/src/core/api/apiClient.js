import { api } from "./axiosConfig";
import { t } from "../i18n/i18n";
import { getErrorMessage } from "../utils/errorHandler";

let apiToastHandler = null;

export function setApiToastHandler(handler) {
  apiToastHandler = typeof handler === "function" ? handler : null;
}

function notifyToast(payload) {
  if (apiToastHandler) {
    apiToastHandler(payload);
  }
}

export async function get(url, config = {}) {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    if (!config?.suppressErrorToast) {
      notifyToast({
        variant: "danger",
        message:
          config?.toastError ||
          getErrorMessage(error, t("errors.requestFailed", "Request failed.")),
      });
    }
    throw error;
  }
}

export async function post(url, payload = {}, config = {}) {
  try {
    const response = await api.post(url, payload, config);
    if (config?.toastSuccess !== false) {
      notifyToast({
        variant: "success",
        message:
          typeof config?.toastSuccess === "string"
            ? config.toastSuccess
            : t("messages.saved", "Saved successfully."),
      });
    }
    return response.data;
  } catch (error) {
    if (!config?.suppressErrorToast) {
      notifyToast({
        variant: "danger",
        message:
          config?.toastError ||
          getErrorMessage(error, t("errors.requestFailed", "Request failed.")),
      });
    }
    throw error;
  }
}

export async function patch(url, payload = {}, config = {}) {
  try {
    const response = await api.patch(url, payload, config);
    if (config?.toastSuccess !== false) {
      notifyToast({
        variant: "success",
        message:
          typeof config?.toastSuccess === "string"
            ? config.toastSuccess
            : t("messages.updated", "Updated successfully."),
      });
    }
    return response.data;
  } catch (error) {
    if (!config?.suppressErrorToast) {
      notifyToast({
        variant: "danger",
        message:
          config?.toastError ||
          getErrorMessage(error, t("errors.requestFailed", "Request failed.")),
      });
    }
    throw error;
  }
}

export async function del(url, config = {}) {
  try {
    const response = await api.delete(url, config);
    if (config?.toastSuccess !== false) {
      notifyToast({
        variant: "success",
        message:
          typeof config?.toastSuccess === "string"
            ? config.toastSuccess
            : t("messages.deleted", "Deleted successfully."),
      });
    }
    return response.data;
  } catch (error) {
    if (!config?.suppressErrorToast) {
      notifyToast({
        variant: "danger",
        message:
          config?.toastError ||
          getErrorMessage(error, t("errors.requestFailed", "Request failed.")),
      });
    }
    throw error;
  }
}
