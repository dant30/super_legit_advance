// frontend/src/components/customers/CustomerFilters.jsx
import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { 
  FunnelIcon,
  CalendarIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';

const CustomerFilters = ({ onFilterChange, initialFilters = {} }) => {
  const { filters } = useCustomerContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: '',
    gender: '',
    county: '',
    risk_level: '',
    start_date: '',
    end_date: '',
    search: '',
    ...initialFilters
  });

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'BLACKLISTED', label: 'Blacklisted' }
  ];

  const genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' }
  ];

  const riskOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' }
  ];

  // Common Kenyan counties
  const countyOptions = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
    'Machakos', 'Kiambu', 'Meru', 'Kakamega', 'Bungoma', 'Busia',
    'Siaya', 'Kisii', 'Nyamira', 'Kericho', 'Bomet', 'Narok',
    'Kajiado', 'Makueni', 'Kitui', 'Garissa', 'Wajir', 'Mandera',
    'Marsabit', 'Isiolo', 'Lamu', 'Tana River', 'Kilifi', 'Kwale',
    'Taita Taveta', 'Embu', 'Kirinyaga', 'Muranga', 'Nyeri',
    'Nyandarua', 'Laikipia', 'Turkana', 'West Pokot', 'Samburu',
    'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi',
    'Baringo', 'Kericho', 'Bomet', 'Narok', 'Kajiado', 'Makueni'
  ].sort();

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      status: '',
      gender: '',
      county: '',
      risk_level: '',
      start_date: '',
      end_date: '',
      search: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(
    value => value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="bg-white rounded-lg shadow-soft border border-gray-200 mb-6">
      {/* Filter Header */}
      <div 
        className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium text-gray-700">Filters</span>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear
              </button>
            )}
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={localFilters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                placeholder="Search by name, phone, ID..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Status</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={localFilters.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Genders</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* County */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County
              </label>
              <select
                value={localFilters.county}
                onChange={(e) => handleChange('county', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Counties</option>
                {countyOptions.map(county => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                value={localFilters.risk_level}
                onChange={(e) => handleChange('risk_level', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Risk Levels</option>
                {riskOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={localFilters.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Start date"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={localFilters.end_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-3">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(localFilters).map(([key, value]) => {
                    if (!value || value === '') return null;
                    
                    let displayValue = value;
                    let displayKey = key.replace('_', ' ');
                    
                    // Format display values
                    if (key === 'status') {
                      displayValue = statusOptions.find(opt => opt.value === value)?.label || value;
                    } else if (key === 'gender') {
                      displayValue = genderOptions.find(opt => opt.value === value)?.label || value;
                    } else if (key === 'risk_level') {
                      displayValue = riskOptions.find(opt => opt.value === value)?.label || value;
                    }
                    
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {displayKey}: {displayValue}
                        <button
                          onClick={() => handleChange(key, '')}
                          className="ml-1.5 text-primary-400 hover:text-primary-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerFilters;