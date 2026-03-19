import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const navigateMock = vi.fn();
const loginMock = vi.fn();
const clearErrorMock = vi.fn();

const authState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    clearError: clearErrorMock,
  }),
}));

import Login from "../../../features/auth/pages/Login";

describe("auth UI lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authState.isAuthenticated = false;
    authState.isLoading = false;
    authState.error = null;
  });

  it("validates email and does not submit invalid credentials", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("staff@superlegitadvance.com"), { target: { value: "invalid-email" } });
    const passwordInput = document.querySelector('input[autocomplete="current-password"]');
    expect(passwordInput).not.toBeNull();
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).not.toHaveBeenCalled();
    });
  });

  it("submits normalized credentials and toggles password visibility", async () => {
    loginMock.mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = document.querySelector('input[autocomplete="current-password"]');
    expect(passwordInput.getAttribute("type")).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput.getAttribute("type")).toBe("text");

    fireEvent.change(screen.getByPlaceholderText("staff@superlegitadvance.com"), { target: { value: "STAFF@EXAMPLE.COM " } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "staff@example.com",
        password: "secret123",
      });
    });
  });
});
