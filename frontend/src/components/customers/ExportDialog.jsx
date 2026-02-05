// frontend/src/components/customers/ExportDialog.jsx
import React, { useMemo, useState } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { useToast } from '../../contexts/ToastContext';
import {
  DocumentArrowDownIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const ExportDialog = ({ open = false, onClose, filters = {} }) => {
  const { exportCustomers } = useCustomerContext();
  const { addToast } = useToast();
  
  const [format, setFormat] = useState('excel');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [status, setStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const canExport = typeof exportCustomers === 'function';

  const isInvalidRange = useMemo(() => {
    if (!dateRange.start_date || !dateRange.end_date) return false;
    return new Date(dateRange.start_date) > new Date(dateRange.end_date);
  }, [dateRange.start_date, dateRange.end_date]);

  const handleExport = async () => {
    if (!canExport) {
      addToast('Export is not available right now', 'error');
      return;
    }
    if (isInvalidRange) {
      addToast('Start date must be before end date', 'error');
      return;
    }
    setIsExporting(true);
    
    try {
      const exportFilters = {
        ...filters,
        ...dateRange,
        status: status || undefined
      };

      await exportCustomers(format, exportFilters);
      addToast('Export completed successfully', 'success');
      onClose?.();
    } catch (error) {
      console.error('Export error:', error);
      addToast('Failed to export customers', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <DocumentArrowDownIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Export Customers</h3>
              <p className="text-sm text-gray-500">Export customer data to file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Export Format */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('excel')}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors duration-200 ${
                  format === 'excel' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="h-10 w-10 mb-2">
                  <svg viewBox="0 0 24 24" className="h-full w-full">
                    <path fill="#217346" d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-2.38-3.87 2.34-3.8H7.46l-1.3 2.4-.05.08-.04.09-.64-1.28-.66-1.29H2.59l2.27 3.82-2.48 3.85h2.16zM22.5 21v-3h-2v3zm0-4.5v-3h-2v3zm0-4.5v-3h-2v3zm0-4.5v-3h-2v3z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors duration-200 ${
                  format === 'csv' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="h-10 w-10 mb-2">
                  <svg viewBox="0 0 24 24" className="h-full w-full">
                    <path fill="#217346" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m-1 15l-3-2.5L7 17v-5.5l3-2.5l3 2.5V17m1-11V3.5L18.5 9H14z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Start date"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => handleDateChange('end_date', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
            {isInvalidRange && (
              <p className="mt-2 text-xs text-red-600">Start date must be before end date.</p>
            )}
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter (Optional)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </select>
          </div>

          {/* Included Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Included Fields
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                All customer information will be exported including:
              </p>
              <ul className="mt-2 text-sm text-gray-500 space-y-1 list-disc list-inside">
                <li>Personal information</li>
                <li>Contact details</li>
                <li>Employment information</li>
                <li>Financial data</li>
                <li>Status and risk assessment</li>
              </ul>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Format</span>
              <span className="font-medium text-gray-900">{format === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Status</span>
              <span className="font-medium text-gray-900">{status || 'All'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Date Range</span>
              <span className="font-medium text-gray-900">
                {dateRange.start_date || dateRange.end_date ? `${dateRange.start_date || 'Any'} - ${dateRange.end_date || 'Any'}` : 'Any'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || isInvalidRange || !canExport}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              isExporting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export Customers
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
