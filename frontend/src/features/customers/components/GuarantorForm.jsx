import React, { useEffect, useState } from 'react'
import { useCustomerContext } from '@contexts/CustomerContext'
import { useToast } from '@contexts/ToastContext'
import { UserCircleIcon } from '@heroicons/react/24/outline'

const DEFAULT_FORM = {
  first_name: '',
  middle_name: '',
  last_name: '',
  phone_number: '',
  confirm_phone_number: '',
  email: '',
  physical_address: '',
  county: '',
  id_type: 'NATIONAL_ID',
  id_number: '',
  guarantor_type: 'PERSONAL',
  relationship: '',
  occupation: '',
  employer: '',
  monthly_income: '',
  id_document: null,
  passport_photo: null,
  notes: '',
}

const normalizePhoneNumber = (value = '') => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('254')) return `+${digits}`
  if (digits.startsWith('0')) return `+254${digits.slice(1)}`
  if (digits.length === 9) return `+254${digits}`
  return value.trim()
}

const buildFormData = (guarantor) => ({
  ...DEFAULT_FORM,
  ...guarantor,
  phone_number: guarantor?.phone_number || '',
  confirm_phone_number: guarantor?.phone_number || '',
  id_document: null,
  passport_photo: null,
})

const GuarantorForm = ({ customerId, guarantorId, initialData = null, onSuccess, onCancel }) => {
  const {
    selectedGuarantor,
    createGuarantor,
    updateGuarantor,
  } = useCustomerContext()
  const { addToast } = useToast()

  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(buildFormData(initialData))
    } else if (guarantorId && selectedGuarantor?.id === guarantorId) {
      setFormData(buildFormData(selectedGuarantor))
    } else if (!guarantorId) {
      setFormData(DEFAULT_FORM)
    }
  }, [guarantorId, initialData, selectedGuarantor])

  const handleChange = (event) => {
    const { name, value, files, type } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files?.[0] || null : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const nextErrors = {}
    if (!formData.first_name.trim()) nextErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) nextErrors.last_name = 'Last name is required'
    if (!formData.id_number.trim()) nextErrors.id_number = 'ID number is required'
    if (!formData.relationship) nextErrors.relationship = 'Relationship is required'
    if (!formData.occupation.trim()) nextErrors.occupation = 'Occupation is required'
    if (!formData.monthly_income) nextErrors.monthly_income = 'Monthly income is required'
    if (!formData.physical_address.trim()) nextErrors.physical_address = 'Physical address is required'
    if (!formData.county.trim()) nextErrors.county = 'County is required'

    const normalizedPhone = normalizePhoneNumber(formData.phone_number)
    const normalizedConfirmPhone = normalizePhoneNumber(formData.confirm_phone_number)
    if (!normalizedPhone) nextErrors.phone_number = 'Phone number is required'
    if (normalizedPhone !== normalizedConfirmPhone) {
      nextErrors.confirm_phone_number = 'Phone numbers do not match'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      addToast('Fix the highlighted guarantor fields and try again.', 'error')
      return
    }

    setIsSubmitting(true)
    const payload = {
      ...formData,
      phone_number: normalizePhoneNumber(formData.phone_number),
    }

    if (!guarantorId) {
      payload.confirm_phone_number = normalizePhoneNumber(formData.confirm_phone_number)
    }

    try {
      const result = guarantorId
        ? await updateGuarantor(guarantorId, payload)
        : await createGuarantor(customerId, payload)

      if (!result.success) {
        throw new Error(result.error || 'Failed to save guarantor')
      }

      addToast(guarantorId ? 'Guarantor updated successfully' : 'Guarantor added successfully', 'success')
      onSuccess?.(result.data)
    } catch (error) {
      addToast(error.message || 'Failed to save guarantor', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderError = (field) =>
    errors[field] ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p> : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="flex items-center text-lg font-medium text-gray-900">
            <UserCircleIcon className="mr-2 h-5 w-5 text-gray-400" />
            {guarantorId ? 'Edit Guarantor' : 'New Guarantor'}
          </h3>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="guarantor-first-name" className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
              <input id="guarantor-first-name" name="first_name" value={formData.first_name} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('first_name')}
            </div>
            <div>
              <label htmlFor="guarantor-middle-name" className="mb-1 block text-sm font-medium text-gray-700">Middle Name</label>
              <input id="guarantor-middle-name" name="middle_name" value={formData.middle_name} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
              <label htmlFor="guarantor-last-name" className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
              <input id="guarantor-last-name" name="last_name" value={formData.last_name} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('last_name')}
            </div>
            <div>
              <label htmlFor="guarantor-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input id="guarantor-email" type="email" name="email" value={formData.email} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
              <label htmlFor="guarantor-phone-number" className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
              <input id="guarantor-phone-number" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+254700000000" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('phone_number')}
            </div>
            <div>
              <label htmlFor="guarantor-confirm-phone-number" className="mb-1 block text-sm font-medium text-gray-700">Confirm Phone Number</label>
              <input id="guarantor-confirm-phone-number" name="confirm_phone_number" value={formData.confirm_phone_number} onChange={handleChange} placeholder="+254700000000" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('confirm_phone_number')}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="guarantor-address" className="mb-1 block text-sm font-medium text-gray-700">Physical Address</label>
              <input id="guarantor-address" name="physical_address" value={formData.physical_address} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('physical_address')}
            </div>
            <div>
              <label htmlFor="guarantor-county" className="mb-1 block text-sm font-medium text-gray-700">County</label>
              <input id="guarantor-county" name="county" value={formData.county} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('county')}
            </div>
            <div>
              <label htmlFor="guarantor-id-type" className="mb-1 block text-sm font-medium text-gray-700">ID Type</label>
              <select id="guarantor-id-type" name="id_type" value={formData.id_type} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING_LICENSE">Driving License</option>
              </select>
            </div>
            <div>
              <label htmlFor="guarantor-id-number" className="mb-1 block text-sm font-medium text-gray-700">ID Number</label>
              <input id="guarantor-id-number" name="id_number" value={formData.id_number} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('id_number')}
            </div>
            <div>
              <label htmlFor="guarantor-type" className="mb-1 block text-sm font-medium text-gray-700">Guarantor Type</label>
              <select id="guarantor-type" name="guarantor_type" value={formData.guarantor_type} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="PERSONAL">Personal</option>
                <option value="CORPORATE">Corporate</option>
                <option value="INSTITUTIONAL">Institutional</option>
              </select>
            </div>
            <div>
              <label htmlFor="guarantor-relationship" className="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
              <select id="guarantor-relationship" name="relationship" value={formData.relationship} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="">Select relationship</option>
                <option value="SPOUSE">Spouse</option>
                <option value="PARENT">Parent</option>
                <option value="SIBLING">Sibling</option>
                <option value="FRIEND">Friend</option>
                <option value="COLLEAGUE">Colleague</option>
                <option value="RELATIVE">Relative</option>
                <option value="OTHER">Other</option>
              </select>
              {renderError('relationship')}
            </div>
            <div>
              <label htmlFor="guarantor-occupation" className="mb-1 block text-sm font-medium text-gray-700">Occupation</label>
              <input id="guarantor-occupation" name="occupation" value={formData.occupation} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('occupation')}
            </div>
            <div>
              <label htmlFor="guarantor-employer" className="mb-1 block text-sm font-medium text-gray-700">Employer</label>
              <input id="guarantor-employer" name="employer" value={formData.employer} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
              <label htmlFor="guarantor-monthly-income" className="mb-1 block text-sm font-medium text-gray-700">Monthly Income</label>
              <input id="guarantor-monthly-income" type="number" min="0" name="monthly_income" value={formData.monthly_income} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {renderError('monthly_income')}
            </div>
            <div>
              <label htmlFor="guarantor-id-document" className="mb-1 block text-sm font-medium text-gray-700">ID Document</label>
              <input id="guarantor-id-document" type="file" name="id_document" onChange={handleChange} className="block w-full text-sm text-gray-500" />
            </div>
            <div>
              <label htmlFor="guarantor-passport-photo" className="mb-1 block text-sm font-medium text-gray-700">Passport Photo</label>
              <input id="guarantor-passport-photo" type="file" name="passport_photo" onChange={handleChange} className="block w-full text-sm text-gray-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="guarantor-notes" className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea id="guarantor-notes" name="notes" rows="4" value={formData.notes} onChange={handleChange} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-400"
        >
          {isSubmitting ? 'Saving...' : guarantorId ? 'Update Guarantor' : 'Add Guarantor'}
        </button>
      </div>
    </form>
  )
}

export default GuarantorForm
