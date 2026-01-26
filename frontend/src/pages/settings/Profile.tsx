import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Camera } from 'lucide-react'

import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default function ProfileSettings() {
  const { register, handleSubmit } = useForm()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // API call would go here
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Profile Settings | Super Legit Advance</title>
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your account information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Profile Picture
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
              <label className="cursor-pointer">
                <Button as="span" variant="secondary">
                  Change Picture
                </Button>
                <input type="file" accept="image/*" hidden />
              </label>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Personal Information
            </h2>
            <div className="space-y-4">
              <Input
                label="First Name"
                {...register('first_name')}
              />
              <Input
                label="Last Name"
                {...register('last_name')}
              />
              <Input
                label="Email"
                type="email"
                {...register('email')}
              />
              <Input
                label="Phone Number"
                {...register('phone_number')}
              />
            </div>
          </Card>

          {/* Password */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Change Password
            </h2>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                {...register('current_password')}
              />
              <Input
                label="New Password"
                type="password"
                {...register('new_password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                {...register('confirm_password')}
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}