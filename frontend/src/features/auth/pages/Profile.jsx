import { useMemo, useState } from 'react'
import { Save, Shield } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import {
  AuthAlert,
  AuthField,
  AuthPanel,
  AuthPrimaryButton,
  AuthShell,
} from '../components'

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
  } = useAuth()

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  })

  const fullName = useMemo(() => {
    const first = user?.first_name || "";
    const last = user?.last_name || "";
    return `${first} ${last}`.trim() || user?.username || "User";
  }, [user])

  const onProfileSubmit = async (event) => {
    event.preventDefault()
    clearError()
    clearSuccess()
    await updateProfile(profileForm)
  }

  const onPasswordSubmit = async (event) => {
    event.preventDefault()
    clearError()
    clearSuccess()
    await changePassword(passwordForm)
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    })
  }

  return (
    <AuthShell maxWidth="max-w-6xl">
      <div className="w-full space-y-6">
        <AuthPanel
          sectionLabel="Account Management"
          title="My Profile"
          subtitle="Manage your account details and password for secure staff access."
        >
          <div className="mt-4 text-sm text-text-secondary">
            <p>
              Signed in as <span className="font-medium text-text-primary">{fullName}</span>
            </p>
            <p className="mt-1 text-text-muted">{user?.email || '-'}</p>
          </div>
        </AuthPanel>

        {error ? (
          <AuthAlert tone="error" className="mt-0">
            {typeof error === 'string' ? error : error?.message || 'Profile update failed.'}
          </AuthAlert>
        ) : null}
        {successMessage ? (
          <AuthAlert tone="success" className="mt-0">
            {successMessage}
          </AuthAlert>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <AuthPanel sectionLabel="Profile" title="Personal Details">
            <form className="mt-4 space-y-4" onSubmit={onProfileSubmit}>
              <AuthField
                htmlFor="profile-first-name"
                label="First Name"
                type="text"
                value={profileForm.first_name}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, first_name: event.target.value }))
                }
                placeholder="First name"
              />
              <AuthField
                htmlFor="profile-last-name"
                label="Last Name"
                type="text"
                value={profileForm.last_name}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, last_name: event.target.value }))
                }
                placeholder="Last name"
              />
              <AuthField
                htmlFor="profile-phone"
                label="Phone Number"
                type="text"
                value={profileForm.phone_number}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, phone_number: event.target.value }))
                }
                placeholder="Phone number"
              />

              <AuthPrimaryButton type="submit" disabled={isUpdatingProfile}>
                <Save className="h-4 w-4" />
                {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
              </AuthPrimaryButton>
            </form>
          </AuthPanel>

          <AuthPanel sectionLabel="Security" title="Password">
            <p className="mt-1 text-sm text-text-secondary">Change your account password.</p>
            <form className="mt-4 space-y-4" onSubmit={onPasswordSubmit}>
              <AuthField
                htmlFor="current-password"
                label="Current Password"
                type="password"
                value={passwordForm.current_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))
                }
                placeholder="Current password"
                required
              />
              <AuthField
                htmlFor="new-password"
                label="New Password"
                type="password"
                value={passwordForm.new_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))
                }
                placeholder="New password"
                required
              />
              <AuthField
                htmlFor="confirm-new-password"
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirm_new_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirm_new_password: event.target.value,
                  }))
                }
                placeholder="Confirm new password"
                required
              />

              <AuthPrimaryButton type="submit" disabled={isChangingPassword}>
                <Shield className="h-4 w-4" />
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </AuthPrimaryButton>
            </form>
          </AuthPanel>
        </div>
      </div>
    </AuthShell>
  )
}

export default Profile
