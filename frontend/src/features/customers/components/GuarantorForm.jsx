// frontend/src/components/customers/GuarantorForm.jsx
import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '@contexts/CustomerContext';
import { useToast } from '@contexts/ToastContext';
import {
  UserCircleIcon,
  BriefcaseIcon,
  BanknotesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const GuarantorForm = ({ 
  customerId, 
  guarantorId, 
  onSuccess,
  onCancel 
}) => {
  const { 
    selectedGuarantor,
    createGuarantor,
    updateGuarantor
  } = useCustomerContext();
  
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    middle_name: '',
    id_number: '',
    id_type: 'NATIONAL_ID',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    relationship: '',
    
    // Contact Information
    phone_number: '',
    email: '',
    physical_address: '',
    county: '',
    sub_county: '',
    ward: '',
    
    // Employment Information
    employer_name: '',
    job_title: '',
    monthly_income: '',
    employment_type: '',
    work_duration: '',
    
    // Financial Information
    credit_score: '',
    risk_level: 'MEDIUM',
    existing_liabilities: '',
    net_worth: '',
    
    // Additional Information
    is_active: true,
    verification_status: 'PENDING',
    verification_notes: '',
    guarantee_amount: '',
    guarantee_percentage: '',
    
    // Documents
    id_attachment: null,
    kra_pin_attachment: null,
    payslip_attachment: null,
    bank_statement_attachment: null,
    
    // Notes
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (guarantorId) {
      // Load guarantor data for editing
      // Note: getGuarantor function would need to be implemented in context
      // For now, we'll use selectedGuarantor if available
      if (selectedGuarantor) {
        setFormData(prev => ({
          ...prev,
          ...selectedGuarantor,
          date_of_birth: selectedGuarantor.date_of_birth ? 
            new Date(selectedGuarantor.date_of_birth).toISOString().split('T')[0] : ''
        }));
      }
    }
  }, [guarantorId, selectedGuarantor]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.id_number.trim()) newErrors.id_number = 'ID number is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.relationship) newErrors.relationship = 'Relationship is required';
    if (!formData.physical_address.trim()) newErrors.physical_address = 'Physical address is required';
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Phone validation
    const phoneRegex = /^(07|01)\d{8}$/;
    if (formData.phone_number && !phoneRegex.test(formData.phone_number.replace(/[^0-9]/g, ''))) {
      newErrors.phone_number = 'Invalid phone number format (e.g., 0712345678)';
    }
    
    // Age validation (must be 21+ for guarantor)
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 21) {
        newErrors.date_of_birth = 'Guarantor must be at least 21 years old';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] instanceof File) {
          data.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      
      let result;
      if (guarantorId) {
        result = await updateGuarantor(guarantorId, data);
      } else {
        result = await createGuarantor(customerId, data);
      }
      
      if (result.success) {
        addToast(
          guarantorId ? 'Guarantor updated successfully' : 'Guarantor created successfully',
          'success'
        );
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        addToast(result.error || 'Failed to save guarantor', 'error');
      }
    } catch (error) {
      console.error('Error saving guarantor:', error);
      addToast('An error occurred while saving the guarantor', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const relationshipOptions = [
    'Spouse', 'Parent', 'Sibling', 'Child', 'Relative',
    'Friend', 'Colleague', 'Employer', 'Business Partner',
    'Other'
  ];

  const employmentTypeOptions = [
    'PERMANENT', 'CONTRACT', 'TEMPORARY', 'CASUAL', 'SELF_EMPLOYED'
  ];

  const guaranteePercentageOptions = [
    '25', '50', '75', '100'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
            Personal Information
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guarantor-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="guarantor-first-name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.first_name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="guarantor-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="guarantor-last-name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.last_name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="guarantor-id-number" className="block text-sm font-medium text-gray-700 mb-1">
                ID Number *
              </label>
              <input
                id="guarantor-id-number"
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.id_number ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.id_number && (
                <p className="mt-1 text-sm text-red-600">{errors.id_number}</p>
              )}
            </div>

            <div>
              <label htmlFor="guarantor-relationship" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship to Customer *
              </label>
              <select
                id="guarantor-relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.relationship ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select Relationship</option>
                {relationshipOptions.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
              {errors.relationship && (
                <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>
              )}
            </div>

            <div>
              <label htmlFor="guarantor-date-of-birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                id="guarantor-date-of-birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.date_of_birth ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
              )}
            </div>

            <div>
              <label htmlFor="guarantor-gender-m" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <div className="flex space-x-4">
                <label htmlFor="guarantor-gender-m" className="inline-flex items-center">
                  <input
                    id="guarantor-gender-m"
                    type="radio"
                    name="gender"
                    value="M"
                    checked={formData.gender === 'M'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Male</span>
                </label>
                <label htmlFor="guarantor-gender-f" className="inline-flex items-center">
                  <input
                    id="guarantor-gender-f"
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
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            <div>
              <label htmlFor="guarantor-marital-status" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                id="guarantor-marital-status"
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

      {/* Contact Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guarantor-phone-number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="guarantor-phone-number"
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.phone_number ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>

            <div>
              <label htmlFor="guarantor-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="guarantor-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="guarantor-physical-address" className="block text-sm font-medium text-gray-700 mb-1">
                Physical Address *
              </label>
              <input
                id="guarantor-physical-address"
                type="text"
                name="physical_address"
                value={formData.physical_address}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.physical_address ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.physical_address && (
                <p className="mt-1 text-sm text-red-600">{errors.physical_address}</p>
              )}
            </div>

            <div>
              <label htmlFor="guarantor-county" className="block text-sm font-medium text-gray-700 mb-1">
                County
              </label>
              <input
                id="guarantor-county"
                type="text"
                name="county"
                value={formData.county}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="guarantor-sub-county" className="block text-sm font-medium text-gray-700 mb-1">
                Sub-County
              </label>
              <input
                id="guarantor-sub-county"
                type="text"
                name="sub_county"
                value={formData.sub_county}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-400" />
            Employment Information
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guarantor-employer-name" className="block text-sm font-medium text-gray-700 mb-1">
                Employer Name
              </label>
              <input
                id="guarantor-employer-name"
                type="text"
                name="employer_name"
                value={formData.employer_name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="guarantor-job-title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                id="guarantor-job-title"
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="guarantor-monthly-income" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BanknotesIcon className="h-4 w-4 text-gray-400 mr-1" />
                Monthly Income (Ksh)
              </label>
              <input
                id="guarantor-monthly-income"
                type="number"
                name="monthly_income"
                value={formData.monthly_income}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="guarantor-employment-type" className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                id="guarantor-employment-type"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select Type</option>
                {employmentTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="guarantor-work-duration" className="block text-sm font-medium text-gray-700 mb-1">
                Work Duration
              </label>
              <input
                id="guarantor-work-duration"
                type="text"
                name="work_duration"
                value={formData.work_duration}
                onChange={handleChange}
                placeholder="e.g., 3 years"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guarantor-credit-score" className="block text-sm font-medium text-gray-700 mb-1">
                Credit Score
              </label>
              <input
                id="guarantor-credit-score"
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
              <label htmlFor="guarantor-risk-level" className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                id="guarantor-risk-level"
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
              <label htmlFor="guarantor-existing-liabilities" className="block text-sm font-medium text-gray-700 mb-1">
                Existing Liabilities (Ksh)
              </label>
              <input
                id="guarantor-existing-liabilities"
                type="number"
                name="existing_liabilities"
                value={formData.existing_liabilities}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="guarantor-net-worth" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Net Worth (Ksh)
              </label>
              <input
                id="guarantor-net-worth"
                type="number"
                name="net_worth"
                value={formData.net_worth}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="guarantor-guarantee-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Guarantee Amount (Ksh)
              </label>
              <input
                id="guarantor-guarantee-amount"
                type="number"
                name="guarantee_amount"
                value={formData.guarantee_amount}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="guarantor-guarantee-percentage" className="block text-sm font-medium text-gray-700 mb-1">
                Guarantee Percentage
              </label>
              <select
                id="guarantor-guarantee-percentage"
                name="guarantee_percentage"
                value={formData.guarantee_percentage}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select Percentage</option>
                {guaranteePercentageOptions.map(percent => (
                  <option key={percent} value={percent}>{percent}%</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
            Supporting Documents
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guarantor-id-attachment" className="block text-sm font-medium text-gray-700 mb-1">
                ID Copy
              </label>
              <input
                id="guarantor-id-attachment"
                type="file"
                name="id_attachment"
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            <div>
              <label htmlFor="guarantor-kra-pin-attachment" className="block text-sm font-medium text-gray-700 mb-1">
                KRA PIN Certificate
              </label>
              <input
                id="guarantor-kra-pin-attachment"
                type="file"
                name="kra_pin_attachment"
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            <div>
              <label htmlFor="guarantor-payslip-attachment" className="block text-sm font-medium text-gray-700 mb-1">
                Payslip
              </label>
              <input
                id="guarantor-payslip-attachment"
                type="file"
                name="payslip_attachment"
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            <div>
              <label htmlFor="guarantor-bank-statement-attachment" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Statement (3 months)
              </label>
              <input
                id="guarantor-bank-statement-attachment"
                type="file"
                name="bank_statement_attachment"
                onChange={handleChange}
                accept=".pdf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guarantor-verification-status" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Status
              </label>
              <select
                id="guarantor-verification-status"
                name="verification_status"
                value={formData.verification_status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <label htmlFor="guarantor-is-active" className="flex items-center">
                <input
                  id="guarantor-is-active"
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleChange({
                    target: { name: 'is_active', type: 'checkbox', checked: e.target.checked }
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active Guarantor</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="guarantor-verification-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Notes
            </label>
            <textarea
              id="guarantor-verification-notes"
              name="verification_notes"
              value={formData.verification_notes}
              onChange={handleChange}
              rows="2"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Notes about guarantor verification..."
            />
          </div>

          <div className="mt-4">
            <label htmlFor="guarantor-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="guarantor-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Any additional information about the guarantor..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isSubmitting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'}`}
        >
          {isSubmitting && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {guarantorId ? 'Update Guarantor' : 'Add Guarantor'}
        </button>
      </div>
    </form>
  );
};

export default GuarantorForm;


