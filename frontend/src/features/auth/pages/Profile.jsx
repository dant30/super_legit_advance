import { useMemo, useState } from "react";
import { Save, Shield } from "lucide-react";
import { useAuth } from "@hooks/useAuth";

function Profile() {
  const {
    user,
    updateProfile,
    changePassword,
    isUpdatingProfile,
    isChangingPassword,
    error,
    successMessage,
    clearError,
    clearSuccess,
  } = useAuth();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const fullName = useMemo(() => {
    const first = user?.first_name || "";
    const last = user?.last_name || "";
    return `${first} ${last}`.trim() || user?.username || "User";
  }, [user]);

  const onProfileSubmit = async (event) => {
    event.preventDefault();
    clearError();
    clearSuccess();
    await updateProfile(profileForm);
  };

  const onPasswordSubmit = async (event) => {
    event.preventDefault();
    clearError();
    clearSuccess();
    await changePassword(passwordForm);
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage your account details and password for secure staff access.
          </p>
          <div className="mt-4 text-sm text-slate-300">
            <p>
              Signed in as <span className="font-medium text-slate-100">{fullName}</span>
            </p>
            <p className="mt-1 text-slate-400">{user?.email || "-"}</p>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-lg border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-sm text-danger-100">
            {typeof error === "string" ? error : error?.message || "Profile update failed."}
          </div>
        ) : null}
        {successMessage ? (
          <div className="mb-5 rounded-lg border border-success-500/40 bg-success-500/10 px-4 py-3 text-sm text-success-100">
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <form
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
            onSubmit={onProfileSubmit}
          >
            <h2 className="text-lg font-semibold">Personal Details</h2>
            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="First name"
                value={profileForm.first_name}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, first_name: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              />
              <input
                type="text"
                placeholder="Last name"
                value={profileForm.last_name}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, last_name: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              />
              <input
                type="text"
                placeholder="Phone number"
                value={profileForm.phone_number}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, phone_number: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isUpdatingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <form
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
            onSubmit={onPasswordSubmit}
          >
            <h2 className="text-lg font-semibold">Security</h2>
            <p className="mt-1 text-sm text-slate-300">Change your account password.</p>
            <div className="mt-4 space-y-4">
              <input
                type="password"
                placeholder="Current password"
                value={passwordForm.current_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordForm.new_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirm_new_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirm_new_password: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Shield className="h-4 w-4" />
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
