import { beforeEach, describe, expect, it, vi } from "vitest";

const { axiosMock } = vi.hoisted(() => ({
  axiosMock: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("@api/axios", () => ({ default: axiosMock }));

import { AUTH_ENDPOINTS, authAPI } from "../../../features/auth/services/auth";

describe("auth lifecycle API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("uses login/current-user/update/change-password/logout endpoints", async () => {
    axiosMock.post.mockResolvedValueOnce({
      data: { access: "access-token", refresh: "refresh-token", user: { id: "u-1" } },
    });
    axiosMock.get.mockResolvedValueOnce({ data: { success: true, data: { id: "u-1" } } });
    axiosMock.patch.mockResolvedValueOnce({ data: { id: "u-1", first_name: "Updated" } });
    axiosMock.post.mockResolvedValueOnce({ data: { detail: "Password changed successfully." } });
    axiosMock.post.mockResolvedValueOnce({ data: { success: true } });

    const loginData = await authAPI.login({ email: "STAFF@EXAMPLE.COM", password: "secret" });
    const currentUser = await authAPI.getCurrentUser();
    const updated = await authAPI.updateProfile({ first_name: "Updated" });
    const changed = await authAPI.changePassword("old", "new", "new");
    localStorage.setItem("refresh_token", "refresh-token");
    await authAPI.logout();

    expect(loginData.access).toBe("access-token");
    expect(currentUser.id).toBe("u-1");
    expect(updated.first_name).toBe("Updated");
    expect(changed.detail).toContain("Password changed");

    expect(axiosMock.post).toHaveBeenNthCalledWith(1, AUTH_ENDPOINTS.login, {
      email: "staff@example.com",
      password: "secret",
    });
    expect(axiosMock.get).toHaveBeenCalledWith(AUTH_ENDPOINTS.currentUser);
    expect(axiosMock.patch).toHaveBeenCalledWith(AUTH_ENDPOINTS.updateProfile, {
      first_name: "Updated",
    });
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, AUTH_ENDPOINTS.changePassword, {
      current_password: "old",
      new_password: "new",
      confirm_new_password: "new",
    });
    expect(axiosMock.post).toHaveBeenNthCalledWith(3, AUTH_ENDPOINTS.logout, {
      refresh: "refresh-token",
    });
  });

  it("uses token refresh/verify endpoints and clears storage on refresh failure", async () => {
    localStorage.setItem("access_token", "old-access");
    localStorage.setItem("refresh_token", "old-refresh");
    localStorage.setItem("user", '{"id":"u-1"}');

    axiosMock.post
      .mockResolvedValueOnce({ data: { access: "new-access" } })
      .mockRejectedValueOnce(new Error("invalid token"));

    const refreshed = await authAPI.refreshToken("old-refresh");
    const verified = await authAPI.verifyToken("any-token");
    expect(refreshed.access).toBe("new-access");
    expect(verified.valid).toBe(false);
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, AUTH_ENDPOINTS.refreshToken, { refresh: "old-refresh" });
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, AUTH_ENDPOINTS.verifyToken, { token: "any-token" });

    axiosMock.post.mockRejectedValueOnce(new Error("refresh failed"));
    await expect(authAPI.refreshToken("bad-refresh")).rejects.toThrow("refresh failed");
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("uses password reset and verification endpoints with expected payloads", async () => {
    axiosMock.post
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } });

    await authAPI.requestPasswordReset("staff@example.com");
    await authAPI.confirmPasswordReset("uid123", "token123", "NewPass123!", "NewPass123!");
    await authAPI.verifyEmail("uid123", "token123");
    await authAPI.resendVerificationEmail("staff@example.com");

    expect(axiosMock.post).toHaveBeenNthCalledWith(1, AUTH_ENDPOINTS.requestPasswordReset, {
      email: "staff@example.com",
    });
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, AUTH_ENDPOINTS.confirmPasswordReset, {
      uid: "uid123",
      token: "token123",
      new_password: "NewPass123!",
      confirm_new_password: "NewPass123!",
      password: "NewPass123!",
      confirm_password: "NewPass123!",
    });
    expect(axiosMock.post).toHaveBeenNthCalledWith(3, AUTH_ENDPOINTS.verifyEmail, {
      uid: "uid123",
      token: "token123",
    });
    expect(axiosMock.post).toHaveBeenNthCalledWith(4, AUTH_ENDPOINTS.resendVerificationEmail, {
      email: "staff@example.com",
    });
  });
});
