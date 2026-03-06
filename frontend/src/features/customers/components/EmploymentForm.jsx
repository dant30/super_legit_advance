import React, { useEffect, useMemo, useState } from 'react'
import { useCustomerContext } from '@contexts/CustomerContext'
import { useToast } from '@contexts/ToastContext'
import { BriefcaseIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const DEFAULT_FORM = {
  employment_type: 'EMPLOYED',
  sector: '',
  occupation: '',
  employer_name: '',
  employer_address: '',
  employer_phone: '',
  employer_email: '',
  job_title: '',
  department: '',
  employee_number: '',
  date_employed: '',
  monthly_income: '',
  other_income: '',
  payment_frequency: 'MONTHLY',
  next_pay_date: '',
  business_name: '',
  business_type: '',
  business_registration: '',
  business_start_date: '',
  number_of_employees: '',
  employment_letter: null,
  pay_slips: null,
  business_permit: null,
  notes: '',
}

const dateValue = (value) => (value ? new Date(value).toISOString().split('T')[0] : '')

const buildFormData = (employment) => ({
  ...DEFAULT_FORM,
  employment_type: employment?.employment_type || DEFAULT_FORM.employment_type,
  sector: employment?.sector || '',
  occupation: employment?.occupation || '',
  employer_name: employment?.employer_name || '',
  employer_address: employment?.employer_address || '',
  employer_phone: employment?.employer_phone || '',
  employer_email: employment?.employer_email || '',
  job_title: employment?.job_title || '',
  department: employment?.department || '',
  employee_number: employment?.employee_number || '',
  date_employed: dateValue(employment?.date_employed),
  monthly_income: employment?.monthly_income || '',
  other_income: employment?.other_income || '',
  payment_frequency: employment?.payment_frequency || DEFAULT_FORM.payment_frequency,
  next_pay_date: dateValue(employment?.next_pay_date),
  business_name: employment?.business_name || '',
  business_type: employment?.business_type || '',
  business_registration: employment?.business_registration || '',
  business_start_date: dateValue(employment?.business_start_date),
  number_of_employees: employment?.number_of_employees || '',
  employment_letter: null,
  pay_slips: null,
  business_permit: null,
  notes: employment?.notes || '',
})

const EmploymentForm = ({ customerId }) => {
  const {
    employment,
    employmentLoading,
    employmentError,
    getEmployment,
    updateEmployment,
  } = useCustomerContext()
  const { addToast } = useToast()

  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (customerId) {
      getEmployment(customerId)
    }
  }, [customerId, getEmployment])

  useEffect(() => {
    setFormData(buildFormData(employment))
  }, [employment])

  const isSelfEmployed = formData.employment_type === 'SELF_EMPLOYED'
  const hasEmploymentRecord = Boolean(employment?.id)

  const summaryRows = useMemo(
    () => [
      ['Employment Type', employment?.employment_type || 'Not specified'],
      ['Occupation', employment?.occupation || 'Not specified'],
      ['Sector', employment?.sector || 'Not specified'],
      ['Employer / Business', employment?.employer_name || employment?.business_name || 'Not specified'],
      ['Monthly Income', employment?.monthly_income ? `KES ${Number(employment.monthly_income).toLocaleString()}` : 'Not specified'],
      ['Other Income', employment?.other_income ? `KES ${Number(employment.other_income).toLocaleString()}` : 'Not specified'],
      ['Date Employed', employment?.date_employed ? new Date(employment.date_employed).toLocaleDateString() : 'Not specified'],
      ['Next Pay Date', employment?.next_pay_date ? new Date(employment.next_pay_date).toLocaleDateString() : 'Not specified'],
      ['Verified', employment?.is_verified ? 'Yes' : 'No'],
    ],
    [employment]
  )

  const handleChange = (event) => {
    const { name, value, files, type } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files?.[0] || null : value,
    }))
  }

  const handleCancel = () => {
    setFormData(buildFormData(employment))
    setIsEditing(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    const payload = {}
    Object.entries(formData).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        return
      }
      payload[key] = value
    })

    try {
      const result = await updateEmployment(customerId, payload)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update employment information')
      }

      addToast('Employment information updated successfully', 'success')
      setIsEditing(false)
      await getEmployment(customerId)
    } catch (error) {
      addToast(error.message || 'Failed to update employment information', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (employmentLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  if (employmentError && !employment) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-center">
          <DocumentTextIcon className="mr-2 h-5 w-5 text-yellow-500" />
          <p className="text-sm text-yellow-800">{employmentError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BriefcaseIcon className="mr-2 h-6 w-6 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
            <p className="text-sm text-gray-500">
              {hasEmploymentRecord ? 'Review and update employment details.' : 'Add employment details for this borrower.'}
            </p>
          </div>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {hasEmploymentRecord ? 'Edit Employment' : 'Add Employment'}
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="grid grid-cols-1 gap-0 divide-y divide-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0">
            {summaryRows.map(([label, value]) => (
              <div key={label} className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
                <p className="mt-1 text-sm text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          {employment?.notes && (
            <div className="border-t border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</p>
              <p className="mt-1 text-sm text-gray-900">{employment.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="employment-type" className="mb-1 block text-sm font-medium text-gray-700">
                  Employment Type
                </label>
                <select
                  id="employment-type"
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="EMPLOYED">Employed</option>
                  <option value="SELF_EMPLOYED">Self-Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                  <option value="STUDENT">Student</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
              <div>
                <label htmlFor="employment-sector" className="mb-1 block text-sm font-medium text-gray-700">
                  Sector
                </label>
                <select
                  id="employment-sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select sector</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="PRIVATE">Private Sector</option>
                  <option value="NGO">NGO</option>
                  <option value="INFORMAL">Informal Sector</option>
                  <option value="AGRICULTURE">Agriculture</option>
                  <option value="MANUFACTURING">Manufacturing</option>
                  <option value="SERVICES">Services</option>
                  <option value="CONSTRUCTION">Construction</option>
                  <option value="HEALTH">Health</option>
                  <option value="EDUCATION">Education</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="employment-occupation" className="mb-1 block text-sm font-medium text-gray-700">
                  Occupation
                </label>
                <input
                  id="employment-occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-job-title" className="mb-1 block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <input
                  id="employment-job-title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-employer-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Employer Name
                </label>
                <input
                  id="employment-employer-name"
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-department" className="mb-1 block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  id="employment-department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-employee-number" className="mb-1 block text-sm font-medium text-gray-700">
                  Employee Number
                </label>
                <input
                  id="employment-employee-number"
                  name="employee_number"
                  value={formData.employee_number}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-date-employed" className="mb-1 block text-sm font-medium text-gray-700">
                  Date Employed
                </label>
                <input
                  id="employment-date-employed"
                  type="date"
                  name="date_employed"
                  value={formData.date_employed}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-employer-phone" className="mb-1 block text-sm font-medium text-gray-700">
                  Employer Phone
                </label>
                <input
                  id="employment-employer-phone"
                  name="employer_phone"
                  value={formData.employer_phone}
                  onChange={handleChange}
                  placeholder="+254700000000"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-employer-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Employer Email
                </label>
                <input
                  id="employment-employer-email"
                  type="email"
                  name="employer_email"
                  value={formData.employer_email}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="employment-employer-address" className="mb-1 block text-sm font-medium text-gray-700">
                  Employer Address
                </label>
                <input
                  id="employment-employer-address"
                  name="employer_address"
                  value={formData.employer_address}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="employment-monthly-income" className="mb-1 block text-sm font-medium text-gray-700">
                  Monthly Income
                </label>
                <input
                  id="employment-monthly-income"
                  type="number"
                  min="0"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-other-income" className="mb-1 block text-sm font-medium text-gray-700">
                  Other Income
                </label>
                <input
                  id="employment-other-income"
                  type="number"
                  min="0"
                  name="other_income"
                  value={formData.other_income}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="employment-payment-frequency" className="mb-1 block text-sm font-medium text-gray-700">
                  Payment Frequency
                </label>
                <select
                  id="employment-payment-frequency"
                  name="payment_frequency"
                  value={formData.payment_frequency}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="DAILY">Daily</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                  <option value="IRREGULAR">Irregular</option>
                </select>
              </div>
              <div>
                <label htmlFor="employment-next-pay-date" className="mb-1 block text-sm font-medium text-gray-700">
                  Next Pay Date
                </label>
                <input
                  id="employment-next-pay-date"
                  type="date"
                  name="next_pay_date"
                  value={formData.next_pay_date}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="employment-business-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  id="employment-business-name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  disabled={!isSelfEmployed}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="employment-business-type" className="mb-1 block text-sm font-medium text-gray-700">
                  Business Type
                </label>
                <input
                  id="employment-business-type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  disabled={!isSelfEmployed}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="employment-business-registration" className="mb-1 block text-sm font-medium text-gray-700">
                  Business Registration
                </label>
                <input
                  id="employment-business-registration"
                  name="business_registration"
                  value={formData.business_registration}
                  onChange={handleChange}
                  disabled={!isSelfEmployed}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="employment-business-start-date" className="mb-1 block text-sm font-medium text-gray-700">
                  Business Start Date
                </label>
                <input
                  id="employment-business-start-date"
                  type="date"
                  name="business_start_date"
                  value={formData.business_start_date}
                  onChange={handleChange}
                  disabled={!isSelfEmployed}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="employment-number-of-employees" className="mb-1 block text-sm font-medium text-gray-700">
                  Number of Employees
                </label>
                <input
                  id="employment-number-of-employees"
                  type="number"
                  min="0"
                  name="number_of_employees"
                  value={formData.number_of_employees}
                  onChange={handleChange}
                  disabled={!isSelfEmployed}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="employment-letter" className="mb-1 block text-sm font-medium text-gray-700">
                  Employment Letter
                </label>
                <input
                  id="employment-letter"
                  type="file"
                  name="employment_letter"
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="employment-payslips" className="mb-1 block text-sm font-medium text-gray-700">
                  Pay Slips
                </label>
                <input
                  id="employment-payslips"
                  type="file"
                  name="pay_slips"
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="employment-business-permit" className="mb-1 block text-sm font-medium text-gray-700">
                  Business Permit
                </label>
                <input
                  id="employment-business-permit"
                  type="file"
                  name="business_permit"
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-500"
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="employment-notes" className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="employment-notes"
                  name="notes"
                  rows="4"
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-400"
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Save Employment
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default EmploymentForm
