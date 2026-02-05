// frontend/src/components/customers/CustomerForm.jsx
import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon,
  CameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const CustomerForm = ({ customerId, onSuccess }) => {
  const { 
    selectedCustomer,
    selectedCustomerLoading,
    createCustomer,
    updateCustomer,
    fetchCustomer
  } = useCustomerContext();
  
  const { addToast } = useToast();
  const navigate = useNavigate();
  
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
    
    // Contact Information
    phone_number: '',
    email: '',
    physical_address: '',
    postal_address: '',
    county: '',
    sub_county: '',
    ward: '',
    
    // Additional Information
    referred_by: '',
    status: 'ACTIVE',
    risk_level: 'MEDIUM',
    credit_score: '',
    profile_picture: null,
    document_files: [],
    
    // Notes
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load customer data if editing
  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId);
    }
  }, [customerId]);

  // Populate form when customer data is loaded
  useEffect(() => {
    if (selectedCustomer && customerId) {
      setFormData(prev => ({
        ...prev,
        ...selectedCustomer,
        date_of_birth: selectedCustomer.date_of_birth ? 
          new Date(selectedCustomer.date_of_birth).toISOString().split('T')[0] : ''
      }));
    }
  }, [selectedCustomer, customerId]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      if (name === 'profile_picture') {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      } else if (name === 'document_files') {
        setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
      }
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
    if (!formData.physical_address.trim()) newErrors.physical_address = 'Physical address is required';
    if (!formData.county) newErrors.county = 'County is required';
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Phone number validation (Kenyan format)
    const phoneRegex = /^(07|01)\d{8}$/;
    if (formData.phone_number && !phoneRegex.test(formData.phone_number.replace(/[^0-9]/g, ''))) {
      newErrors.phone_number = 'Invalid phone number format (e.g., 0712345678)';
    }
    
    // Age validation (must be 18+)
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
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
      addToast('Please fix the errors in the form', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      
      // Append all form data to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'profile_picture' && formData[key] instanceof File) {
          data.append(key, formData[key]);
        } else if (key === 'document_files' && Array.isArray(formData[key])) {
          formData[key].forEach(file => {
            data.append('document_files', file);
          });
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      
      let result;
      if (customerId) {
        result = await updateCustomer(customerId, data);
      } else {
        result = await createCustomer(data);
      }
      
      if (result.success) {
        addToast(
          customerId ? 'Customer updated successfully' : 'Customer created successfully',
          'success'
        );
        
        if (onSuccess) {
          onSuccess(result.data);
        } else {
          navigate('/customers');
        }
      } else {
        addToast(result.error || 'Failed to save customer', 'error');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      addToast('An error occurred while saving the customer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  if (selectedCustomerLoading && customerId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Card */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number *
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Type
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={formData.gender === 'M'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
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

      {/* Contact Information Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="0712345678"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.phone_number ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Address *
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Address
              </label>
              <input
                type="text"
                name="postal_address"
                value={formData.postal_address}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County *
              </label>
              <input
                type="text"
                name="county"
                value={formData.county}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.county ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.county && (
                <p className="mt-1 text-sm text-red-600">{errors.county}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub-County
              </label>
              <input
                type="text"
                name="sub_county"
                value={formData.sub_county}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ward
              </label>
              <input
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

      {/* Additional Information Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Score
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referred By (Customer ID)
              </label>
              <input
                type="text"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>
              <div className="mt-1 flex items-center">
                <label className="flex flex-col items-center px-4 py-2 bg-white text-primary-700 rounded-lg border border-primary-300 cursor-pointer hover:bg-primary-50">
                  <CameraIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">Choose File</span>
                  <input
                    type="file"
                    name="profile_picture"
                    onChange={handleChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                {formData.profile_picture && (
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.profile_picture instanceof File 
                      ? formData.profile_picture.name 
                      : 'File selected'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documents
              </label>
              <div className="mt-1 flex items-center">
                <label className="flex flex-col items-center px-4 py-2 bg-white text-primary-700 rounded-lg border border-primary-300 cursor-pointer hover:bg-primary-50">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">Choose Files</span>
                  <input
                    type="file"
                    name="document_files"
                    onChange={handleChange}
                    multiple
                    className="hidden"
                  />
                </label>
                {formData.document_files && formData.document_files.length > 0 && (
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.document_files.length} file(s) selected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
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

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
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
          {customerId ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;