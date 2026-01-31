// frontend/src/components/customers/CustomerForm.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  ID_TYPE_OPTIONS,
  NATIONALITY_OPTIONS
} from '@/types/customers'
import type { CustomerFormData } from '@/types/customers'

const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  middle_name: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'O']),
  marital_status: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']).optional(),
  id_type: z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE', 'ALIEN_CARD']),
  id_number: z.string().min(1, 'ID number is required').max(50),
  id_expiry_date: z.string().optional(),
  nationality: z.string().default('Kenyan'),
  phone_number: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+254\d{9}$/, 'Phone must be in format: +254XXXXXXXXX'),
  confirm_phone_number: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  confirm_email: z.string().optional(),
  physical_address: z.string().min(1, 'Physical address is required'),
  postal_address: z.string().optional(),
  county: z.string().min(1, 'County is required'),
  sub_county: z.string().min(1, 'Sub-county is required'),
  ward: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_branch: z.string().optional(),
  notes: z.string().optional(),
  referred_by: z.string().optional(),
  create_user_account: z.boolean().default(false),
  user_password: z.string().optional()
}).refine(
  (data) => data.phone_number === data.confirm_phone_number,
  {
    message: "Phone numbers don't match",
    path: ["confirm_phone_number"]
  }
).refine(
  (data) => !data.email || data.email === data.confirm_email,
  {
    message: "Emails don't match",
    path: ["confirm_email"]
  }
)

export interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>
  onSubmit: (data: CustomerFormData) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
  loading?: boolean
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('personal')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      nationality: 'Kenyan',
      gender: 'M',
      id_type: 'NATIONAL_ID',
      create_user_account: false
    }
  })

  // FIX: Handle Select onChange properly
  const handleGenderChange = (value: string) => {
    setValue('gender', value as 'M' | 'F' | 'O')
  }

  const createUserAccount = watch('create_user_account')

  const handleFormSubmit = async (data: CustomerFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="identification">Identification</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  {...register('first_name')}
                  placeholder="John"
                  error={errors.first_name?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  {...register('last_name')}
                  placeholder="Doe"
                  error={errors.last_name?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <Input
                  {...register('middle_name')}
                  placeholder="Middle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  {...register('date_of_birth')}
                  error={errors.date_of_birth?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <Select
                  options={GENDER_OPTIONS}
                  value={watch('gender')}
                  onChange={handleGenderChange}
                  error={errors.gender?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                <Select
                  options={MARITAL_STATUS_OPTIONS}
                  value={watch('marital_status') || ''}
                  onChange={(value) => setValue('marital_status', value as any)}
                  error={errors.marital_status?.message}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="identification">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Type *
                </label>
                <Select
                  options={ID_TYPE_OPTIONS}
                  value={watch('id_type')}
                  onChange={(value) => setValue('id_type', value as any)}
                  error={errors.id_type?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number *
                </label>
                <Input
                  {...register('id_number')}
                  placeholder="12345678"
                  error={errors.id_number?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Expiry Date
                </label>
                <Input
                  type="date"
                  {...register('id_expiry_date')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <Select
                  options={NATIONALITY_OPTIONS}
                  value={watch('nationality') || 'Kenyan'}
                  onChange={(value) => setValue('nationality', value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  {...register('phone_number')}
                  placeholder="+254712345678"
                  error={errors.phone_number?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Phone Number
                </label>
                <Input
                  {...register('confirm_phone_number')}
                  placeholder="+254712345678"
                  error={errors.confirm_phone_number?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                  error={errors.email?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Email
                </label>
                <Input
                  type="email"
                  {...register('confirm_email')}
                  placeholder="john@example.com"
                  error={errors.confirm_email?.message}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Physical Address *
                </label>
                <Input
                  {...register('physical_address')}
                  placeholder="123 Main Street"
                  error={errors.physical_address?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Address
                </label>
                <Input
                  {...register('postal_address')}
                  placeholder="P.O. Box 12345"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County *
                  </label>
                  <Input
                    {...register('county')}
                    placeholder="Nairobi"
                    error={errors.county?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-County *
                  </label>
                  <Input
                    {...register('sub_county')}
                    placeholder="Westlands"
                    error={errors.sub_county?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ward
                  </label>
                  <Input
                    {...register('ward')}
                    placeholder="Parklands"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <Input
                    {...register('bank_name')}
                    placeholder="Equity Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <Input
                    {...register('bank_account_number')}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Branch
                  </label>
                  <Input
                    {...register('bank_branch')}
                    placeholder="Westlands Branch"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Any additional notes..."
                />
              </div>
              {mode === 'create' && (
                <div className="pt-4 border-t">
                  <Checkbox
                    label="Create User Account"
                    checked={createUserAccount}
                    onCheckedChange={(checked) => setValue('create_user_account', !!checked)}
                  />
                  {createUserAccount && (
                    <div className="mt-4 pl-6">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        {...register('user_password')}
                        placeholder="Enter password"
                        error={errors.user_password?.message}
                        action={
                          <button
                            type="button"
                            className="text-sm text-blue-600 hover:text-blue-800"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || (mode === 'edit' && !isDirty)}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Customer' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </form>
  )
}

// export default CustomerForm