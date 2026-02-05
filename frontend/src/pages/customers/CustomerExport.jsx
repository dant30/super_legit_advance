// frontend/src/pages/customers/CustomerExport.jsx
import React, { useState } from 'react'
import { Card, Select, Checkbox, Button, Alert, Space } from '@components/ui'
import { PageHeader,  DatePicker} from '@components/shared'
import { ArrowLeft, Download, Filter, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ExportDialog } from '@components/customers'

const CustomerExport = () => {
  const [filters, setFilters] = useState({
    status: '',
    dateRange: [],
    fields: [],
  })
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const fieldOptions = [
    { label: 'Customer ID', value: 'customer_number' },
    { label: 'Full Name', value: 'full_name' },
    { label: 'Phone Number', value: 'phone_number' },
    { label: 'Email', value: 'email' },
    { label: 'Status', value: 'status' },
    { label: 'Credit Score', value: 'credit_score' },
    { label: 'Registration Date', value: 'registration_date' },
    { label: 'Active Loans', value: 'active_loans' },
    { label: 'Outstanding Balance', value: 'outstanding_balance' },
  ]

  const statusOptions = [
    { label: 'All Customers', value: '' },
    { label: 'Active Only', value: 'ACTIVE' },
    { label: 'Blacklisted Only', value: 'BLACKLISTED' },
    { label: 'Pending Only', value: 'PENDING' },
  ]

  const handleFieldChange = (field, checked) => {
    if (checked) {
      setFilters(prev => ({
        ...prev,
        fields: [...prev.fields, field],
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        fields: prev.fields.filter(f => f !== field),
      }))
    }
  }

  const handleSelectAllFields = () => {
    setFilters(prev => ({
      ...prev,
      fields: fieldOptions.map(f => f.value),
    }))
  }

  const handleDeselectAllFields = () => {
    setFilters(prev => ({
      ...prev,
      fields: [],
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Customers"
        subTitle="Export customer data to various formats"
        extra={[
          <Link to="/customers" key="back">
            <Button icon={<ArrowLeft size={16} />}>
              Back to Customers
            </Button>
          </Link>,
        ]}
      />

      <Alert
        type="info"
        message="Export Options"
        description="Customize your export by selecting fields, filters, and format. Exports can be downloaded in Excel, CSV, or PDF format."
      />

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <Select
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                options={statusOptions}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <DatePicker.RangePicker
                value={filters.dateRange}
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Fields to Export
              </label>
              <div className="space-x-2">
                <Button type="link" size="small" onClick={handleSelectAllFields}>
                  Select All
                </Button>
                <Button type="link" size="small" onClick={handleDeselectAllFields}>
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="border rounded p-4">
              <div className="grid grid-cols-3 gap-2">
                {fieldOptions.map(field => (
                  <div key={field.value} className="flex items-center">
                    <Checkbox
                      checked={filters.fields.includes(field.value)}
                      onChange={(e) => handleFieldChange(field.value, e.target.checked)}
                    >
                      <span className="text-sm">{field.label}</span>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Summary</p>
                <p className="text-sm text-gray-600">
                  {filters.fields.length} fields selected • {filters.status || 'All'} customers
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">Estimated file size: ~2-5MB</p>
                <p className="text-sm">Rows: 100-500 customers</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <Space>
                <Button 
                  type="primary" 
                  icon={<Download size={16} />}
                  onClick={() => setExportDialogOpen(true)}
                >
                  Generate Export
                </Button>
                <Button icon={<Printer size={16} />}>
                  Print Preview
                </Button>
              </Space>
              
              <div className="text-sm text-gray-500">
                <p>Last export: Today, 10:30 AM</p>
                <p>Total exports this month: 12</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <FileSpreadsheet size={32} className="mx-auto text-green-500 mb-2" />
            <p className="font-medium">Excel Export</p>
            <p className="text-sm text-gray-600">Best for data analysis</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <FileText size={32} className="mx-auto text-blue-500 mb-2" />
            <p className="font-medium">CSV Export</p>
            <p className="text-sm text-gray-600">Compatible with most systems</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <FileText size={32} className="mx-auto text-red-500 mb-2" />
            <p className="font-medium">PDF Report</p>
            <p className="text-sm text-gray-600">Formatted for printing</p>
          </div>
        </Card>
      </div>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        filters={filters}
      />
    </div>
  )
}

export default CustomerExport