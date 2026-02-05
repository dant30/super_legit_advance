// frontend/src/components/customers/CustomerSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { 
  MagnifyingGlassIcon,
  UserCircleIcon,
  PhoneIcon,
  IdentificationIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CustomerSearch = ({ 
  placeholder = "Search customers...",
  onSelect,
  autoFocus = false,
  size = "medium",
  showResults = true,
  className = ""
}) => {
  const { searchCustomers, searchResults, searchLoading, searchError } = useCustomerContext();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchType, setSearchType] = useState('basic');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchCustomers(debouncedQuery, searchType);
      setIsOpen(true);
    }
  }, [debouncedQuery, searchType]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  const handleSelect = (customer) => {
    if (onSelect) {
      onSelect(customer);
    } else {
      navigate(`/customers/${customer.id}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      // Navigate to search results page or perform action
      navigate(`/customers?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const searchTypes = [
    { value: 'basic', label: 'All', icon: MagnifyingGlassIcon },
    { value: 'name', label: 'Name', icon: UserCircleIcon },
    { value: 'phone', label: 'Phone', icon: PhoneIcon },
    { value: 'id', label: 'ID', icon: IdentificationIcon },
    { value: 'customer_number', label: 'Customer #', icon: IdentificationIcon },
  ];

  const sizeClasses = {
    small: 'h-9 text-sm',
    medium: 'h-10 text-sm',
    large: 'h-12 text-base'
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className={`relative flex items-center ${sizeClasses[size]}`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`
            block w-full pl-10 pr-10 border border-gray-300 rounded-md
            shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            bg-white sm:text-sm transition-colors duration-200
            ${sizeClasses[size]}
          `}
        />
        
        {/* Search Type Selector */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-10">
          <div className="relative">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="appearance-none bg-transparent border-0 text-gray-600 text-sm focus:outline-none focus:ring-0"
            >
              {searchTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {searchLoading ? (
              <ArrowPathIcon className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-hard rounded-md border border-gray-200 max-h-96 overflow-y-auto">
          {/* Results Header */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Search Results
              </span>
              <span className="text-xs text-gray-500">
                {searchResults?.length || 0} found
              </span>
            </div>
          </div>

          {/* Loading State */}
          {searchLoading && (
            <div className="px-4 py-8 text-center">
              <ArrowPathIcon className="h-6 w-6 text-gray-400 animate-spin mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          )}

          {/* Error State */}
          {searchError && !searchLoading && (
            <div className="px-4 py-8 text-center">
              <XMarkIcon className="h-6 w-6 text-red-400 mx-auto" />
              <p className="mt-2 text-sm text-red-600">{searchError}</p>
            </div>
          )}

          {/* No Results */}
          {!searchLoading && !searchError && (!searchResults || searchResults.length === 0) && (
            <div className="px-4 py-8 text-center">
              <UserCircleIcon className="h-6 w-6 text-gray-400 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">No customers found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}

          {/* Results List */}
          {!searchLoading && !searchError && searchResults && searchResults.length > 0 && (
            <ul className="py-1">
              {searchResults.map((customer) => (
                <li
                  key={customer.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(customer)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {customer.profile_picture ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={customer.profile_picture}
                          alt={customer.full_name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserCircleIcon className="h-8 w-8 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.full_name || `${customer.first_name} ${customer.last_name}`}
                      </p>
                      <div className="flex items-center mt-1 space-x-3">
                        <span className="text-xs text-gray-500 flex items-center">
                          <IdentificationIcon className="h-3 w-3 mr-1" />
                          {customer.customer_number}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {customer.phone_number}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        customer.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : customer.status === 'BLACKLISTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* View All Results */}
          {!searchLoading && !searchError && searchResults && searchResults.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  navigate(`/customers?search=${encodeURIComponent(query)}`);
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                View all results →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;