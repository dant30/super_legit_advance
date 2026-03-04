import axios from "axios";

import { appConfig } from "../constants/config";
import logger from "../utils/logger";
import {
  clearAuthToken,
  clearActiveOrganizationId,
  getActiveOrganizationId,
  getRefreshToken,
  getAuthTokenScheme,
  getAuthToken,
  setAuthToken,
} from "../storage/localStorage";
import { API_ENDPOINTS } from "../../shared/constants/apiEndpoints";

function generateCorrelationId(prefix = "web") {
  if (globalThis?.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const correlationId = generateCorrelationId();
  config.headers["X-Correlation-ID"] = correlationId;
  const token = getAuthToken();
  if (token) {
    const scheme = getAuthTokenScheme();
    config.headers.Authorization = `${scheme} ${token}`;
  }
  if (!config?.skipOrganizationScope) {
    const organizationId = getActiveOrganizationId();
    if (organizationId) {
      config.headers["X-Organization-ID"] = organizationId;
      config.headers["X-Company-ID"] = organizationId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (error?.response?.status === 401) {
      const scheme = getAuthTokenScheme();
      const refreshToken = getRefreshToken();
      if (
        scheme === "Bearer" &&
        refreshToken &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          const refreshCorrelationId = generateCorrelationId("web-refresh");
          const response = await axios.post(
            `${appConfig.apiBaseUrl}${API_ENDPOINTS.auth.refresh}`,
            { refresh: refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Correlation-ID": refreshCorrelationId,
              },
            }
          );
          const nextAccess = response?.data?.access;
          if (nextAccess) {
            setAuthToken(nextAccess, "Bearer");
            logger.info("Auth token refreshed successfully");
            originalRequest.headers.Authorization = `Bearer ${nextAccess}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          logger.warn("Auth token refresh failed", {
            status: refreshError?.response?.status || null,
          });
        }
      }
      logger.info("Clearing auth session after 401 response");
      clearAuthToken();
      clearActiveOrganizationId();
    }
    return Promise.reject(error);
  }
);
