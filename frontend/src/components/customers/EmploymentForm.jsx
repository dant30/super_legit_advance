// frontend /src/components/customers/EmploymentForm.jsx
import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { useToast } from '../../contexts/ToastContext';
import {
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const EmploymentForm = ({ customerId }) => {
  const { 
    employment,
    employmentLoading,
    employmentError,
    getEmployment,
    updateEmployment 
  } = useCustomerContext();
  
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    employer_name: '',
    job_title: '',
    employment_type: '',
    department: '',
    employee_number: '',
    start_date: '',
    end_date: '',
    is_current: true,
    monthly_income: '',
    pay_frequency: 'MONTHLY',
    employer_address: '',
    employer_phone: '',
    employer_email: '',
    supervisor_name: '',
    supervisor_contact: '',
    work_duration: '',
    contract_type: '',
    profession: '',
    industry: '',
    company_size: '',
    payment_method: '',
    bank_name: '',
    bank_account_number: '',
    payslip_attachment: null,
    contract_attachment: null,
    reference_letter_attachment: null,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (customerId) {
      getEmployment(customerId);
    }
  }, [customerId]);

  useEffect(() => {
    if (employment) {
      setFormData({
        employer_name: employment.employer_name || '',
        job_title: employment.job_title || '',
        employment_type: employment.employment_type || '',
        department: employment.department || '',
        employee_number: employment.employee_number || '',
        start_date: employment.start_date ? 
          new Date(employment.start_date).toISOString().split('T')[0] : '',
        end_date: employment.end_date ? 
          new Date(employment.end_date).toISOString().split('T')[0] : '',
        is_current: employment.is_current || true,
        monthly_income: employment.monthly_income || '',
        pay_frequency: employment.pay_frequency || 'MONTHLY',
        employer_address: employment.employer_address || '',
        employer_phone: employment.employer_phone || '',
        employer_email: employment.employer_email || '',
        supervisor_name: employment.supervisor_name || '',
        supervisor_contact: employment.supervisor_contact || '',
        work_duration: employment.work_duration || '',
        contract_type: employment.contract_type || '',
        profession: employment.profession || '',
        industry: employment.industry || '',
        company_size: employment.company_size || '',
        payment_method: employment.payment_method || '',
        bank_name: employment.bank_name || '',
        bank_account_number: employment.bank_account_number || '',
        payslip_attachment: employment.payslip_attachment || null,
        contract_attachment: employment.contract_attachment || null,
        reference_letter_attachment: employment.reference_letter_attachment || null,
        notes: employment.notes || ''
      });
    }
  }, [employment]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (formData[key] instanceof File) {
            data.append(key, formData[key]);
          } else {
            data.append(key, formData[key]);
          }
        }
      });

      const result = await updateEmployment(customerId, data);
      
      if (result.success) {
        addToast('Employment information updated successfully', 'success');
        setIsEditing(false);
      } else {
        addToast(result.error || 'Failed to update employment information', 'error');
      }
    } catch (error) {
      console.error('Error updating employment:', error);
      addToast('An error occurred while updating employment information', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (employment) {
      setFormData({
        employer_name: employment.employer_name || '',
        job_title: employment.job_title || '',
        employment_type: employment.employment_type || '',
        department: employment.department || '',
        employee_number: employment.employee_number || '',
        start_date: employment.start_date ? 
          new Date(employment.start_date).toISOString().split('T')[0] : '',
        end_date: employment.end_date ? 
          new Date(employment.end_date).toISOString().split('T')[0] : '',
        is_current: employment.is_current || true,
        monthly_income: employment.monthly_income || '',
        pay_frequency: employment.pay_frequency || 'MONTHLY',
        employer_address: employment.employer_address || '',
        employer_phone: employment.employer_phone || '',
        employer_email: employment.employer_email || '',
        supervisor_name: employment.supervisor_name || '',
        supervisor_contact: employment.supervisor_contact || '',
        work_duration: employment.work_duration || '',
        contract_type: employment.contract_type || '',
        profession: employment.profession || '',
        industry: employment.industry || '',
        company_size: employment.company_size || '',
        payment_method: employment.payment_method || '',
        bank_name: employment.bank_name || '',
        bank_account_number: employment.bank_account_number || '',
        payslip_attachment: employment.payslip_attachment || null,
        contract_attachment: employment.contract_attachment || null,
        reference_letter_attachment: employment.reference_letter_attachment || null,
        notes: employment.notes || ''
      });
    }
  };

  if (employmentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (employmentError && !employment) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <DocumentTextIcon className="h-5 w-5 text-yellow-400 mr-2" />
          <p className="text-yellow-700">No employment information found</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="mt-3 px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
        >
          Add Employment Details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BriefcaseIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Employment
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employment Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
              Employment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Name *
                </label>
                <input
                  type="text"
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select Type</option>
                  <option value="PERMANENT">Permanent</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="TEMPORARY">Temporary</option>
                  <option value="CASUAL">Casual</option>
                  <option value="INTERN">Intern</option>
                  <option value="SELF_EMPLOYED">Self-Employed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Number
                </label>
                <input
                  type="text"
                  name="employee_number"
                  value={formData.employee_number}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Employment Dates */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    disabled={formData.is_current}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_current"
                    checked={formData.is_current}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Currently employed</span>
                </label>
              </div>
            </div>

            {/* Income Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                  Monthly Income (Ksh)
                </label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Frequency
                </label>
                <select
                  name="pay_frequency"
                  value={formData.pay_frequency}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Duration
                </label>
                <input
                  type="text"
                  name="work_duration"
                  value={formData.work_duration}
                  onChange={handleChange}
                  placeholder="e.g., 2 years 6 months"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Employer Contact */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Employer Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Address
                </label>
                <input
                  type="text"
                  name="employer_address"
                  value={formData.employer_address}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Phone
                </label>
                <input
                  type="text"
                  name="employer_phone"
                  value={formData.employer_phone}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Email
                </label>
                <input
                  type="email"
                  name="employer_email"
                  value={formData.employer_email}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  name="supervisor_name"
                  value={formData.supervisor_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor Contact
                </label>
                <input
                  type="text"
                  name="supervisor_contact"
                  value={formData.supervisor_contact}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Company Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select Size</option>
                  <option value="MICRO">Micro (1-10)</option>
                  <option value="SMALL">Small (11-50)</option>
                  <option value="MEDIUM">Medium (51-200)</option>
                  <option value="LARGE">Large (201-1000)</option>
                  <option value="ENTERPRISE">Enterprise (1000+)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Type
                </label>
                <select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select Contract</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONSULTANT">Consultant</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select Method</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Supporting Documents</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payslip Attachment
                </label>
                <input
                  type="file"
                  name="payslip_attachment"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Attachment
                </label>
                <input
                  type="file"
                  name="contract_attachment"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Letter
                </label>
                <input
                  type="file"
                  name="reference_letter_attachment"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Any additional information about employment..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isSubmitting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Save Employment Details
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {/* Employment Details */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Employer</h4>
                <p className="mt-1 text-sm text-gray-900">{employment.employer_name || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Job Title</h4>
                <p className="mt-1 text-sm text-gray-900">{employment.job_title || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Employment Type</h4>
                <p className="mt-1 text-sm text-gray-900">{employment.employment_type || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Department</h4>
                <p className="mt-1 text-sm text-gray-900">{employment.department || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {employment.start_date ? 
                    new Date(employment.start_date).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    employment.is_current ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employment.is_current ? 'Currently Employed' : 'Formerly Employed'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Income Information */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Monthly Income</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {employment.monthly_income ? `Ksh ${Number(employment.monthly_income).toLocaleString()}` : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Pay Frequency</h4>
                <p className="mt-1 text-sm text-gray-900">{employment.pay_frequency || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Work Duration</h4>
                <p className="mt-1 text-sm text-gray-900">{employment.work_duration || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Employer Contact */}
          {employment.employer_address || employment.employer_phone || employment.employer_email ? (
            <div className="px-6 py-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Employer Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {employment.employer_address && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Address</h4>
                    <p className="mt-1 text-sm text-gray-900">{employment.employer_address}</p>
                  </div>
                )}
                {employment.employer_phone && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Phone</h4>
                    <p className="mt-1 text-sm text-gray-900">{employment.employer_phone}</p>
                  </div>
                )}
                {employment.employer_email && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Email</h4>
                    <p className="mt-1 text-sm text-gray-900">{employment.employer_email}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Additional Information */}
          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {employment.industry && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Industry</h4>
                  <p className="mt-1 text-sm text-gray-900">{employment.industry}</p>
                </div>
              )}
              {employment.company_size && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Company Size</h4>
                  <p className="mt-1 text-sm text-gray-900">{employment.company_size}</p>
                </div>
              )}
              {employment.contract_type && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Contract Type</h4>
                  <p className="mt-1 text-sm text-gray-900">{employment.contract_type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {employment.notes && (
            <div className="px-6 py-4">
              <h4 className="text-sm font-medium text-gray-500">Notes</h4>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                {employment.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmploymentForm;