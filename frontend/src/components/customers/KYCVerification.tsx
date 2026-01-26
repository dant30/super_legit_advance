import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface KYCVerificationProps {
  kyc_completed: boolean
  email_verified: boolean
  phone_verified: boolean
  is_verified: boolean
  onStartVerification?: () => void
}

export default function KYCVerification({
  kyc_completed,
  email_verified,
  phone_verified,
  is_verified,
  onStartVerification,
}: KYCVerificationProps) {
  const verifications = [
    { name: 'Email Verified', status: email_verified, icon: 'email' },
    { name: 'Phone Verified', status: phone_verified, icon: 'phone' },
    { name: 'KYC Completed', status: kyc_completed, icon: 'kyc' },
    { name: 'Account Verified', status: is_verified, icon: 'account' },
  ]

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle2 className="h-5 w-5 text-success-600" />
    }
    return <Clock className="h-5 w-5 text-warning-600" />
  }

  const completedCount = [email_verified, phone_verified, kyc_completed].filter(Boolean).length
  const totalSteps = 3
  const progressPercentage = (completedCount / totalSteps) * 100

  const getVerificationStatus = () => {
    if (is_verified) {
      return {
        badge: 'success',
        text: 'Fully Verified',
        description: 'All verification steps completed',
        icon: <CheckCircle2 className="h-6 w-6 text-success-600" />,
      }
    }
    if (completedCount === totalSteps) {
      return {
        badge: 'warning',
        text: 'Pending Review',
        description: 'Awaiting final approval',
        icon: <Clock className="h-6 w-6 text-warning-600" />,
      }
    }
    return {
      badge: 'warning',
      text: 'Incomplete',
      description: `${completedCount} of ${totalSteps} steps completed`,
      icon: <Clock className="h-6 w-6 text-warning-600" />,
    }
  }

  const status = getVerificationStatus()

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                KYC Verification
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {status.description}
              </p>
            </div>
          </div>
          <Badge variant={status.badge as any}>
            {status.text}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {completedCount}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-success-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-3">
          {verifications.map((verification, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-shrink-0">
                {getStatusIcon(verification.status)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {verification.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {verification.status ? 'Completed' : 'Pending'}
                </p>
              </div>
              {verification.status && (
                <CheckCircle2 className="h-5 w-5 text-success-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Status Alert */}
        {!is_verified && (
          <div
            className={`p-4 rounded-lg border ${
              completedCount === totalSteps
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
            }`}
          >
            <div className="flex gap-2">
              {completedCount === totalSteps ? (
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-medium ${
                    completedCount === totalSteps
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-warning-900 dark:text-warning-100'
                  }`}
                >
                  {completedCount === totalSteps
                    ? 'All steps completed'
                    : 'Verification in progress'}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    completedCount === totalSteps
                      ? 'text-blue-800 dark:text-blue-200'
                      : 'text-warning-800 dark:text-warning-200'
                  }`}
                >
                  {completedCount === totalSteps
                    ? 'Your account is under review. This may take 24-48 hours.'
                    : `Complete ${totalSteps - completedCount} more step(s) to finish verification.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!is_verified && (
            <Button
              className="flex-1"
              onClick={onStartVerification}
              disabled={completedCount === totalSteps}
            >
              {completedCount === totalSteps
                ? 'Under Review'
                : 'Continue Verification'}
            </Button>
          )}
          {is_verified && (
            <div className="w-full p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success-600 flex-shrink-0" />
              <p className="text-sm font-medium text-success-900 dark:text-success-100">
                Account fully verified ✓
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Note:</span> Complete all verification steps to unlock
            full account features and increase loan eligibility.
          </p>
        </div>
      </div>
    </Card>
  )
}