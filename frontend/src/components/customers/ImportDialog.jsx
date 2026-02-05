//  frontend/src/components/customers/ImportDialog.jsx
import React, { useState, useRef } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { useToast } from '../../contexts/ToastContext';
import {
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ImportDialog = ({ onClose, onSuccess }) => {
  const { importCustomers } = useCustomerContext();
  const { addToast } = useToast();
  
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      'text/x-csv'
    ];

    if (!allowedTypes.includes(selectedFile.type) && 
        !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please select a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }

    // Check file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setImportResults(null);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await importCustomers(file);
      
      if (result.success) {
        setImportResults(result.data);
        addToast('Customer import completed successfully', 'success');
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setError(result.error || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'An error occurred during import');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileSelect(event);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create template CSV content
    const templateContent = `First Name,Last Name,Middle Name,ID Number,ID Type,Date of Birth,Gender,Marital Status,Phone Number,Email,Physical Address,Postal Address,County,Sub County,Ward,Notes
John,Doe,,12345678,NATIONAL_ID,1990-01-01,M,SINGLE,0712345678,john.doe@example.com,123 Main St,P.O. Box 123,Nairobi,Westlands,Westlands Ward,Example customer
Jane,Smith,Anne,87654321,NATIONAL_ID,1985-05-15,F,MARRIED,0787654321,jane.smith@example.com,456 Oak Ave,P.O. Box 456,Mombasa,Island,Kongowea Ward,Another example`;

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <DocumentArrowUpIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Import Customers</h3>
              <p className="text-sm text-gray-500">Upload Excel or CSV file with customer data</p>
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
          {/* Instructions */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Import Instructions</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Download the template file to ensure proper formatting</li>
                  <li>Required fields: First Name, Last Name, ID Number, Phone Number, Date of Birth, Gender, Physical Address, County</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Supported formats: .xlsx, .xls, .csv</li>
                  <li>First row should contain column headers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          {!importResults && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                error ? 'border-red-300 bg-red-50' : 
                file ? 'border-green-300 bg-green-50' : 
                'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              {file ? (
                <div className="space-y-4">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Change File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Drag and drop your file here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">or</p>
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Browse Files
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    Excel (.xlsx, .xls) or CSV files up to 10MB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-lg ${
                importResults.error_count > 0 ? 
                'bg-yellow-50 border border-yellow-200' : 
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center">
                  {importResults.error_count > 0 ? (
                    <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      Import {importResults.error_count > 0 ? 'completed with errors' : 'completed successfully'}
                    </p>
                    <p className="text-sm mt-1">
                      {importResults.imported_count || 0} customers imported, {importResults.error_count || 0} errors
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Import Errors</h4>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Row
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Error
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importResults.errors.map((error, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {error.match(/Row (\d+)/)?.[1] || 'Unknown'}
                            </td>
                            <td className="px-4 py-2 text-sm text-red-600">
                              {error.replace(/^Row \d+: /, '')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            <button
              onClick={downloadTemplate}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              Download Template
            </button>
          </div>
          <div className="flex space-x-3">
            {!importResults && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={isUploading || !file}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    isUploading || !file ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    'Import Customers'
                  )}
                </button>
              </>
            )}
            {importResults && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;