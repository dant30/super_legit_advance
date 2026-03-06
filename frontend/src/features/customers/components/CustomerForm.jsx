import React, { useEffect, useState } from 'react';
import {
  UserCircleIcon,
  CameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const toDateInputValue = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0];
};

const normalizePhoneNumber = (value = '') => {
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.startsWith('254')) return `+${digitsOnly}`;
  if (digitsOnly.startsWith('0')) return `+254${digitsOnly.slice(1)}`;
  if (digitsOnly.length === 9) return `+254${digitsOnly}`;
  return trimmed;
};

const buildInitialFormData = (initialData = {}) => ({
  first_name: initialData.first_name || '',
  last_name: initialData.last_name || '',
  middle_name: initialData.middle_name || '',
  id_number: initialData.id_number || '',
  id_type: initialData.id_type || 'NATIONAL_ID',
  date_of_birth: toDateInputValue(initialData.date_of_birth),
  gender: initialData.gender || '',
  marital_status: initialData.marital_status || '',
  phone_number: initialData.phone_number || '',
  email: initialData.email || '',
  physical_address: initialData.physical_address || '',
  postal_address: initialData.postal_address || '',
  county: initialData.county || '',
  sub_county: initialData.sub_county || '',
  ward: initialData.ward || '',
  referred_by: initialData.referred_by || '',
  status: initialData.status || 'ACTIVE',
  risk_level: initialData.risk_level || 'MEDIUM',
  credit_score: initialData.credit_score || '',
  passport_photo: null,
  id_document: null,
  signature: null,
  notes: initialData.notes || '',
  nationality: initialData.nationality || 'Kenyan',
  id_expiry_date: toDateInputValue(initialData.id_expiry_date),
  bank_name: initialData.bank_name || '',
  bank_account_number: initialData.bank_account_number || '',
  bank_branch: initialData.bank_branch || '',
});

const CustomerForm = ({
  customerId,
  initialData = {},
  onSubmit,
  loading = false,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState(buildInitialFormData(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(buildInitialFormData(initialData));
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.id_number.trim()) newErrors.id_number = 'ID number is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.physical_address.trim()) newErrors.physical_address = 'Physical address is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    const normalizedPhone = normalizePhoneNumber(formData.phone_number);
    if (formData.phone_number && !/^\+254\d{9}$/.test(normalizedPhone)) {
      newErrors.phone_number = 'Invalid phone number format (e.g., +254712345678 or 0712345678)';
    }

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDelta = today.getMonth() - birthDate.getMonth();
      if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
      }
      if (age < 18) {
        newErrors.date_of_birth = 'Customer must be at least 18 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof onSubmit !== 'function') {
        throw new Error('CustomerForm requires an onSubmit handler');
      }

      const payload = {
        ...formData,
        phone_number: normalizePhoneNumber(formData.phone_number),
      };

      if (mode === 'create') {
        payload.confirm_phone_number = payload.phone_number;
        payload.confirm_email = payload.email || '';
        payload.create_user_account = false;
      }

      await onSubmit(payload);
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
            Personal Information
          </h3>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="customer-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="customer-first-name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.first_name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
            </div>

            <div>
              <label htmlFor="customer-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="customer-last-name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.last_name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
            </div>

            <div>
              <label htmlFor="customer-middle-name" className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                id="customer-middle-name"
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="customer-id-number" className="block text-sm font-medium text-gray-700 mb-1">
                ID Number *
              </label>
              <input
                id="customer-id-number"
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                disabled={mode === 'edit'}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.id_number ? 'border-red-300' : 'border-gray-300'} ${mode === 'edit' ? 'bg-gray-50 text-gray-500' : ''}`}
              />
              {errors.id_number && <p className="mt-1 text-sm text-red-600">{errors.id_number}</p>}
            </div>

            <div>
              <label htmlFor="customer-id-type" className="block text-sm font-medium text-gray-700 mb-1">
                ID Type
              </label>
              <select
                id="customer-id-type"
                name="id_type"
                value={formData.id_type}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="ALIEN_ID">Alien ID</option>
                <option value="DRIVING_LICENSE">Driving License</option>
              </select>
            </div>

            <div>
              <label htmlFor="customer-date-of-birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                id="customer-date-of-birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.date_of_birth ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.date_of_birth && <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>}
            </div>

            <div>
              <label htmlFor="customer-gender-m" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <div className="flex flex-wrap gap-3">
                <label htmlFor="customer-gender-m" className="inline-flex items-center">
                  <input
                    id="customer-gender-m"
                    type="radio"
                    name="gender"
                    value="M"
                    checked={formData.gender === 'M'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Male</span>
                </label>
                <label htmlFor="customer-gender-f" className="inline-flex items-center">
                  <input
                    id="customer-gender-f"
                    type="radio"
                    name="gender"
                    value="F"
                    checked={formData.gender === 'F'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Female</span>
                </label>
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>

            <div>
              <label htmlFor="customer-marital-status" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                id="customer-marital-status"
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="customer-phone-number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="customer-phone-number"
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={mode === 'edit'}
                placeholder="+254712345678"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.phone_number ? 'border-red-300' : 'border-gray-300'} ${mode === 'edit' ? 'bg-gray-50 text-gray-500' : ''}`}
              />
              {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
            </div>

            <div>
              <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="customer-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="customer-physical-address" className="block text-sm font-medium text-gray-700 mb-1">
                Physical Address *
              </label>
              <input
                id="customer-physical-address"
                type="text"
                name="physical_address"
                value={formData.physical_address}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.physical_address ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.physical_address && <p className="mt-1 text-sm text-red-600">{errors.physical_address}</p>}
            </div>

            <div>
              <label htmlFor="customer-postal-address" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Address
              </label>
              <input
                id="customer-postal-address"
                type="text"
                name="postal_address"
                value={formData.postal_address}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="customer-county" className="block text-sm font-medium text-gray-700 mb-1">
                County *
              </label>
              <input
                id="customer-county"
                type="text"
                name="county"
                value={formData.county}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.county ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.county && <p className="mt-1 text-sm text-red-600">{errors.county}</p>}
            </div>

            <div>
              <label htmlFor="customer-sub-county" className="block text-sm font-medium text-gray-700 mb-1">
                Sub-County
              </label>
              <input
                id="customer-sub-county"
                type="text"
                name="sub_county"
                value={formData.sub_county}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="customer-ward" className="block text-sm font-medium text-gray-700 mb-1">
                Ward
              </label>
              <input
                id="customer-ward"
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="customer-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="customer-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>

            <div>
              <label htmlFor="customer-risk-level" className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                id="customer-risk-level"
                name="risk_level"
                value={formData.risk_level}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="customer-credit-score" className="block text-sm font-medium text-gray-700 mb-1">
                Credit Score
              </label>
              <input
                id="customer-credit-score"
                type="number"
                name="credit_score"
                value={formData.credit_score}
                onChange={handleChange}
                min="0"
                max="1000"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="customer-referred-by" className="block text-sm font-medium text-gray-700 mb-1">
                Referred By (Customer ID)
              </label>
              <input
                id="customer-referred-by"
                type="text"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="customer-passport-photo" className="block text-sm font-medium text-gray-700 mb-1">
                Passport Photo
              </label>
              <div className="mt-1 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <label className="flex flex-col items-center px-4 py-2 bg-white text-primary-700 rounded-lg border border-primary-300 cursor-pointer hover:bg-primary-50">
                  <CameraIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">Choose File</span>
                  <input
                    id="customer-passport-photo"
                    type="file"
                    name="passport_photo"
                    onChange={handleChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                {formData.passport_photo && (
                  <span className="text-sm text-gray-600 sm:ml-3">
                    {formData.passport_photo instanceof File ? formData.passport_photo.name : 'File selected'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="customer-id-document" className="block text-sm font-medium text-gray-700 mb-1">
                ID Document
              </label>
              <div className="mt-1 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <label className="flex flex-col items-center px-4 py-2 bg-white text-primary-700 rounded-lg border border-primary-300 cursor-pointer hover:bg-primary-50">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">Choose File</span>
                  <input
                    id="customer-id-document"
                    type="file"
                    name="id_document"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
                {formData.id_document && (
                  <span className="text-sm text-gray-600 sm:ml-3">
                    {formData.id_document instanceof File ? formData.id_document.name : 'File selected'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="customer-signature" className="block text-sm font-medium text-gray-700 mb-1">
                Signature
              </label>
              <div className="mt-1 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <label className="flex flex-col items-center px-4 py-2 bg-white text-primary-700 rounded-lg border border-primary-300 cursor-pointer hover:bg-primary-50">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">Choose File</span>
                  <input
                    id="customer-signature"
                    type="file"
                    name="signature"
                    onChange={handleChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                {formData.signature && (
                  <span className="text-sm text-gray-600 sm:ml-3">
                    {formData.signature instanceof File ? formData.signature.name : 'File selected'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="customer-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="customer-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Additional notes about the customer..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto"
          disabled={isSubmitting || loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={`inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto ${(isSubmitting || loading) ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'}`}
        >
          {(isSubmitting || loading) && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {customerId ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
